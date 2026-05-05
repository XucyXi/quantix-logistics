import {Outlet, useNavigate, useLocation, Navigate, Link} from 'react-router';
import {Store, LogOut, Bell, Home} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {useEffect, useState} from 'react';
import {ThemeProvider} from '../contexts/ThemeProvider';
import {adminService} from '../services/adminService';

// Nämä määrittelyt estävät TS-virheet
interface Alert {
  notification_id: number;
}
interface Announcement {
  announcement_id: number;
}

export function StoreRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  const {user, isLoading, logout} = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);

  // ILMOITUSTEN HAKU & LASKURI
  useEffect(() => {
    let mounted = true;

    const fetchNotificationCount = async () => {
      try {
        const data = await adminService.getNotifications();

        // Luetaan mitkä ilmoitukset on jo nähty Asiakkaan portaalissa
        const seen = JSON.parse(
          localStorage.getItem('seen_notifications_customer') || '[]'
        );

        // Lasketaan vain ne, joita EI löydy "nähdyt" -listalta
        const unseenAlerts = (data?.notifications || []).filter(
          (n: Alert) => !seen.includes(`notif-${n.notification_id}`)
        );
        const unseenAnns = (data?.announcements || []).filter(
          (a: Announcement) => !seen.includes(`ann-${a.announcement_id}`)
        );

        if (mounted) {
          setNotificationCount(unseenAlerts.length + unseenAnns.length);
        }
      } catch (error) {
        if (mounted) setNotificationCount(0);
        console.error('Failed to fetch notification count:', error);
      }
    };

    if (user?.role === 'customer') {
      fetchNotificationCount();
      const interval = window.setInterval(fetchNotificationCount, 30000);
      window.addEventListener(
        'notifications_seen_customer',
        fetchNotificationCount
      );

      return () => {
        mounted = false;
        window.clearInterval(interval);
        window.removeEventListener(
          'notifications_seen_customer',
          fetchNotificationCount
        );
      };
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Ladataan...
      </div>
    );
  }

  if (!user || user.role !== 'customer') {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="quantix-theme-customer">
      <div className="min-h-screen bg-background font-sans">
        <header className="bg-[#1e3a5f] text-white px-6 h-16 flex items-center justify-between shadow-md">
          {/* Vasen reuna - Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-sm">
              <Store size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-wide">QUANTIX</span>
              <span className="text-orange-500 font-semibold text-sm ml-1">
                | Kaupan portaali
              </span>
            </div>
          </div>

          {/* Oikea reuna - Toiminnot */}
          <div className="flex items-center gap-5">
            {user?.company && (
              <span className="hidden md:inline text-sm text-white/75 font-medium border-r border-white/20 pr-5">
                {user.company}
              </span>
            )}

            {/* Etusivu-nappi Kaupalle */}
            <Link
              to="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              title="Etusivulle"
            >
              <Home size={18} />
              <span className="hidden sm:inline text-sm font-semibold">
                Etusivu
              </span>
            </Link>

            <button
              onClick={() => navigate('/store', {state: {tab: 'settings'}})}
              className="relative text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border border-[#1e3a5f] animate-bounce">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors text-sm font-semibold ml-2 cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Ulos</span>
            </button>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
