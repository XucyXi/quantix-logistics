import {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ArrowRight,
  RefreshCw,
  Clock,
  X,
  Home,
  Megaphone,
  MessageSquare,
  AlignLeft,
  Calendar,
  Send,
  Loader2,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {adminService} from '../services/adminService';

interface RouteOverview {
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  totalStops: number;
  completedStops: number;
  status: 'pending' | 'in_progress' | 'stuck';
  area: string;
}

interface Alert {
  notification_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  created_at: string;
}

interface Announcement {
  announcement_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  expires_at?: string | null;
}

function UserIcon({routeStatus}: {routeStatus: string}) {
  if (routeStatus === 'in_progress')
    return <Truck size={18} className="text-blue-500" />;
  if (routeStatus === 'stuck')
    return <AlertTriangle size={18} className="text-red-500" />;
  return <Clock size={18} className="text-amber-500" />;
}

export function AdminDashboard() {
  const {token} = useAuth();
  const [routes, setRoutes] = useState<RouteOverview[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    expires_at: '',
  });
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [stats, setStats] = useState({
    activeDrivers: 0,
    deliveredToday: 0,
    issues: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    setIsRefreshing(true);
    try {
      const [routesData, notificationsData, analyticsData] = await Promise.all([
        adminService.getActiveRoutes(),
        adminService.getNotifications(),
        adminService.getAnalytics(),
      ]);

      setRoutes(routesData.routes || []);
      setAlerts(notificationsData.notifications || []);
      setAnnouncements(notificationsData.announcements || []);

      setStats({
        activeDrivers: routesData.routes?.length || 0,
        deliveredToday: analyticsData.stats?.delivered || 0,
        issues:
          routesData.routes?.filter((r: RouteOverview) => r.status === 'stuck')
            .length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (alerts.length === 0 && announcements.length === 0) return;

    const seen = JSON.parse(localStorage.getItem('seen_notifications') || '[]');
    const currentNew = new Set<string>();
    let hasChanges = false;

    alerts.forEach((a) => {
      const id = `notif-${a.notification_id}`;
      if (!seen.includes(id)) {
        currentNew.add(id);
        seen.push(id);
        hasChanges = true;
      }
    });

    announcements.forEach((a) => {
      const id = `ann-${a.announcement_id}`;
      if (!seen.includes(id)) {
        currentNew.add(id);
        seen.push(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      localStorage.setItem('seen_notifications', JSON.stringify(seen));
      window.dispatchEvent(new Event('notifications_seen'));

      setNewItems((prev) => new Set([...prev, ...currentNew]));
    }
  }, [alerts, announcements]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleApprove = async (driverId: number) => {
    setRoutes((prev) => prev.filter((r) => r.driverId !== driverId));
  };

  const handleReject = async (driverId: number) => {
    setRoutes((prev) => prev.filter((r) => r.driverId !== driverId));
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim()) return;

    try {
      setIsSavingAnnouncement(true);
      await adminService.createAnnouncement({
        title: announcementForm.title.trim(),
        content: announcementForm.content.trim() || undefined,
        expires_at: announcementForm.expires_at || null,
      });

      setAnnouncementForm({title: '', content: '', expires_at: ''});
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to create announcement:', error);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  return (
    <div className="font-sans min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-blue-900 dark:from-sidebar dark:to-background p-8 text-primary-foreground rounded-b-3xl shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold m-0 mb-1">Ajokeskus</h1>
            <p className="text-primary-foreground/70 m-0 text-lg">
              Tilannekatsaus
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-14 h-14 rounded-2xl bg-white/10 border-none text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              title="Etusivulle"
            >
              <Home size={28} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-14 h-14 rounded-2xl bg-white/10 border-none text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
              title="Päivitä tiedot"
            >
              <RefreshCw
                size={28}
                className={isRefreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm">
            <div className="text-3xl font-extrabold mb-1">
              {stats.activeDrivers}
            </div>
            <div className="text-sm opacity-80">Aktiiviset kuskit</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm">
            <div className="text-3xl font-extrabold mb-1">
              {stats.deliveredToday}
            </div>
            <div className="text-sm opacity-80">Toimitettu tänään</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm">
            <div className="text-3xl font-extrabold mb-1">{stats.issues}</div>
            <div className="text-sm opacity-80">Ongelmatilanteet</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* ILMOITUS -LOMAKE */}
        <h2 className="text-2xl font-extrabold text-foreground mb-4 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Megaphone size={20} className="text-primary" />
          </div>
          Julkaise uusi ilmoitus
        </h2>
        <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
          {/* Koristepalkki vasemmassa reunassa */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

          <div className="flex flex-col gap-4">
            {/* Otsikko */}
            <div className="relative group">
              <MessageSquare
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Ilmoituksen otsikko (esim. Järjestelmäpäivitys)"
                className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium placeholder:font-normal"
              />
            </div>

            {/* Sisältö */}
            <div className="relative group">
              <AlignLeft
                size={18}
                className="absolute left-3.5 top-3.5 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <textarea
                value={announcementForm.content}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                placeholder="Kirjoita viestin sisältö tähän..."
                rows={3}
                className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y min-h-[100px]"
              />
            </div>

            {/* Alaosa: Pvm ja Nappi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pt-4 border-t border-border/50">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider ml-1">
                  Voimassaolo (valinnainen)
                </label>
                <div className="relative group w-full sm:w-auto">
                  <Calendar
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                  />
                  <input
                    type="datetime-local"
                    value={announcementForm.expires_at}
                    onChange={(e) =>
                      setAnnouncementForm((prev) => ({
                        ...prev,
                        expires_at: e.target.value,
                      }))
                    }
                    className="w-full sm:w-auto rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm text-muted-foreground focus:text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateAnnouncement}
                disabled={
                  isSavingAnnouncement || !announcementForm.title.trim()
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-auto cursor-pointer"
              >
                {isSavingAnnouncement ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {isSavingAnnouncement ? 'Julkaistaan...' : 'Julkaise ilmoitus'}
              </button>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-4 flex items-center gap-3">
          Ilmoitukset
          {newItems.size > 0 && (
            <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse">
              {newItems.size} uutta
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-h-[400px] overflow-y-auto pr-2 rounded-xl">
          {announcements.map((announcement) => {
            const isNew = newItems.has(`ann-${announcement.announcement_id}`);
            return (
              <div
                key={`announcement-${announcement.announcement_id}`}
                className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-500 ${
                  isNew
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                    : 'border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-900/50'
                }`}
              >
                <AlertTriangle
                  size={36}
                  className={`shrink-0 ${isNew ? 'text-orange-500' : 'text-indigo-600 dark:text-indigo-500'}`}
                />
                <div className="flex-1">
                  <div className="text-foreground font-extrabold text-lg mb-1 flex justify-between items-start">
                    {announcement.title}
                    {isNew && (
                      <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                        Uusi
                      </span>
                    )}
                  </div>
                  {announcement.content && (
                    <div className="text-muted-foreground text-sm mb-1">
                      {announcement.content}
                    </div>
                  )}
                  <div className="text-muted-foreground text-sm font-semibold mt-2">
                    {new Date(announcement.created_at).toLocaleTimeString(
                      'fi-FI',
                      {
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {alerts.map((alert) => {
            const isNew = newItems.has(`notif-${alert.notification_id}`);
            const baseBgClass =
              alert.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/20'
                : 'bg-blue-50 dark:bg-blue-950/20';

            const baseBorderClass =
              alert.type === 'warning'
                ? 'border-amber-200 dark:border-amber-900/50'
                : 'border-blue-200 dark:border-blue-900/50';

            return (
              <div
                key={alert.notification_id}
                className={`flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-500 ${baseBgClass} ${
                  isNew
                    ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                    : baseBorderClass
                }`}
              >
                <AlertTriangle
                  size={36}
                  className={`shrink-0 ${
                    isNew
                      ? 'text-orange-500'
                      : alert.type === 'warning'
                        ? 'text-amber-600 dark:text-amber-500'
                        : 'text-blue-600 dark:text-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="text-foreground font-extrabold text-lg mb-1 flex justify-between items-start">
                    {alert.title}
                    {isNew && (
                      <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                        Uusi
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm font-semibold mt-2">
                    {new Date(alert.created_at).toLocaleTimeString('fi-FI', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-4">
          Aktiiviset reitit ({routes.length})
        </h2>

        <div className="flex flex-col gap-3 mb-8">
          {routes.length > 0 ? (
            routes.map((route) => (
              <div
                key={route.driverId}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 transition-colors"
              >
                {/* Kuski ja ajoneuvo */}
                <div className="flex items-center gap-4 w-1/3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <UserIcon routeStatus={route.status} />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">
                      {route.driverName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Truck size={12} /> {route.vehicleInfo}
                    </div>
                  </div>
                </div>

                {/* Sijainti ja tilanne */}
                <div className="flex items-center gap-6 w-1/3">
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <MapPin size={16} className="text-muted-foreground" />
                    {route.area}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-foreground font-medium">
                    <Package size={16} className="text-muted-foreground" />
                    {route.completedStops} / {route.totalStops} toimitettu
                  </div>
                </div>

                {/* Status ja Toiminnot */}
                <div className="flex items-center justify-end gap-3 w-1/3">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold mr-2 ${
                      route.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : route.status === 'stuck'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}
                  >
                    {route.status === 'in_progress'
                      ? 'AJOSSA'
                      : route.status === 'stuck'
                        ? 'ONGELMA'
                        : 'ODOTTAA'}
                  </span>

                  <button
                    onClick={() => handleReject(route.driverId)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Hylkää / Peruuta"
                  >
                    <X size={18} />
                  </button>
                  <button
                    onClick={() => handleApprove(route.driverId)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-600 hover:text-white rounded-lg font-bold text-sm transition-colors"
                  >
                    <CheckCircle size={16} /> Kuittaa
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              <CheckCircle
                size={48}
                className="mx-auto mb-3 opacity-50 text-green-500"
              />
              <p className="text-lg font-bold m-0">Ei aktiivisia reittejä!</p>
              <p className="text-sm mt-1">
                Kaikki kuitattu tai odottaa uusia tilauksia.
              </p>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-4">
          Pikatoiminnot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center justify-between p-7 bg-card border-2 border-border rounded-2xl text-xl font-extrabold text-foreground hover:bg-accent hover:border-primary transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package
                  size={28}
                  className="text-amber-600 dark:text-amber-500"
                />
              </div>
              Hallitse tilauksia
            </div>
            <ArrowRight
              size={28}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center justify-between p-7 bg-card border-2 border-border rounded-2xl text-xl font-extrabold text-foreground hover:bg-accent hover:border-primary transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck
                  size={28}
                  className="text-green-600 dark:text-green-500"
                />
              </div>
              Hallitse kuljettajia
            </div>
            <ArrowRight
              size={28}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
