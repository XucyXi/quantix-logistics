import {useState, useEffect} from 'react';
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
  const [stats, setStats] = useState({
    activeDrivers: 0,
    deliveredToday: 0,
    issues: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();
  // const { showToast } = useToast();

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Haetaan kaikki data rinnakkain
        const [routesData, notificationsData, analyticsData] =
          await Promise.all([
            adminService.getActiveRoutes(token),
            adminService.getNotifications(token),
            adminService.getAnalytics(token),
          ]);

        setRoutes(routesData.routes || []);
        setAlerts(notificationsData.notifications || []);

        // Päivitetään statistiikkakortit haetulla datalla
        setStats({
          activeDrivers: routesData.routes?.length || 0,
          deliveredToday: analyticsData.stats?.delivered || 0,
          issues:
            routesData.routes?.filter(
              (r: RouteOverview) => r.status === 'stuck'
            ).length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        // showToast('Datan haku epäonnistui', 'error');
      } finally {
        setIsRefreshing(false);
      }
    };

    setIsRefreshing(true);
    fetchData();
  }, [token, isRefreshing]); // Ajetaan uudelleen kun token muuttuu tai refresh-nappia painetaan

  const handleRefresh = () => {
    setIsRefreshing(true);
  };

  const handleApprove = async (driverId: number) => {
    setRoutes((prev) => prev.filter((r) => r.driverId !== driverId));
    // showToast('Reitti kuitattu', 'success');
  };

  const handleReject = async (driverId: number) => {
    setRoutes((prev) => prev.filter((r) => r.driverId !== driverId));
    // showToast('Reitti hylätty', 'error');
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
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-14 h-14 rounded-2xl bg-white/10 border-none text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              size={28}
              className={isRefreshing ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* Korvataan staattiset kortit dynaamisilla */}
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
        {/* Vanha staattinen data poistettu */}
        {/*
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
        */}
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-foreground mb-4 flex items-center gap-2">
          Huomiota vaativat
          {alerts.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {alerts.map((alert, i) => (
            <div
              key={alert.notification_id}
              className={`flex items-center gap-5 p-6 rounded-2xl border-2 ${
                alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50' // Warning
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50'
              }`}
            >
              <AlertTriangle
                size={36}
                className={`shrink-0 ${
                  alert.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-blue-600 dark:text-blue-500'
                }`}
              />
              <div className="flex-1">
                <div className="text-foreground font-extrabold text-lg mb-1">
                  {alert.title}
                </div>
                <div className="text-muted-foreground text-sm font-semibold">
                  {new Date(alert.created_at).toLocaleTimeString('fi-FI', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-4">
          Aktiiviset reitit ({routes.length})
        </h2>

        {/* PC-optimoitu, kompakti listanäkymä aktiivisille reiteille */}
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
