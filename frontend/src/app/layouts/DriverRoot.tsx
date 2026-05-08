import {Outlet, useNavigate, useLocation, Navigate} from 'react-router';
import {Package, MapPin, User, Home, Navigation, Bell} from 'lucide-react';
import {DeliveryTracking, Order} from '../../types/logistics';
import {useEffect, useState, useRef} from 'react';

import {useAuth} from '../contexts/AuthContext';
import {ThemeProvider} from '../contexts/ThemeProvider';
import {orderService} from '../services/orderService';
import {adminService} from '../services/adminService';

export function DriverRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries] = useState<DeliveryTracking[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const lastLocationUpdate = useRef<number>(0);
  const activeOrdersRef = useRef<Order[]>([]);
  const {user, isLoading} = useAuth();

  const navItems = [
    {to: '/driver', icon: Home, label: 'Koti'},
    {to: '/driver/deliveries', icon: Package, label: 'Toimitukset'},
    {to: '/driver/map', icon: MapPin, label: 'Kartta'},
    {to: '/driver/profile', icon: User, label: 'Profiili'},
  ];

  // Ilmoitusten haku
  useEffect(() => {
    let mounted = true;
    const fetchNotificationCount = async () => {
      try {
        const data = await adminService.getNotifications();
        const seen = JSON.parse(
          localStorage.getItem('seen_notifications_driver') || '[]'
        );

        const unseenAlerts = (data?.notifications || []).filter(
          (n: {notification_id: number}) =>
            !seen.includes(`notif-${n.notification_id}`)
        );
        const unseenAnns = (data?.announcements || []).filter(
          (a: {announcement_id: number}) =>
            !seen.includes(`ann-${a.announcement_id}`)
        );

        if (mounted) {
          setNotificationCount(unseenAlerts.length + unseenAnns.length);
        }
      } catch {
        if (mounted) setNotificationCount(0);
      }
    };

    if (user?.role === 'driver') {
      fetchNotificationCount();
      const interval = window.setInterval(fetchNotificationCount, 30000);
      window.addEventListener(
        'notifications_seen_driver',
        fetchNotificationCount
      );

      return () => {
        mounted = false;
        window.clearInterval(interval);
        window.removeEventListener(
          'notifications_seen_driver',
          fetchNotificationCount
        );
      };
    }
  }, [user]);

  // Tilausten haku (polling)
  useEffect(() => {
    if (!user || user.role !== 'driver') return;
    const fetchMyDeliveries = async () => {
      try {
        const data = await orderService.getAssignedOrders();
        setTimeout(() => setOrders(data), 0);
      } catch (err) {
        console.error('Datan haku epäonnistui (DriverRoot):', err);
      }
    };

    fetchMyDeliveries();
    const interval = setInterval(fetchMyDeliveries, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Pidetään Ref ajan tasalla aktiivisista tilauksista
  useEffect(() => {
    activeOrdersRef.current = orders.filter((o) => o.status === 'in_transit');
    setIsTracking(activeOrdersRef.current.length > 0);
  }, [orders]);

  // KOKO SOVELLUKSEN LAAJUINEN GPS-SEURANTA (Optimoitu)
  useEffect(() => {
    let watchId: number;

    if (user?.role === 'driver' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const activeTransitOrders = activeOrdersRef.current;

          // Jos ei ole ajossa olevia tilauksia, ei lähetetä sijaintia turhaan
          if (activeTransitOrders.length === 0) return;

          const now = Date.now();
          if (now - lastLocationUpdate.current < 30000) return;
          lastLocationUpdate.current = now;

          const {latitude, longitude} = position.coords;

          activeTransitOrders.forEach((order) => {
            orderService
              .updateDeliveryLocation(order.order_id, {latitude, longitude})
              .catch((err) => {
                // Sivuutetaan Axios Abortit (normaalia navigoidessa)
                if (
                  err.name !== 'CanceledError' &&
                  err.code !== 'ERR_CANCELED'
                ) {
                  console.error(
                    `Sijainnin lähetys epäonnistui tilaukselle ${order.order_id}:`,
                    err
                  );
                }
              });
          });
        },
        (err) => console.error('Sijainnin hakeminen epäonnistui:', err),
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        }
      );
    }

    // Puhdistetaan GPS vasta kun komponentti kuolee / käyttäjä kirjautuu ulos
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]); // Huom! Riippuvuutena ei ole orders, jotta GPS ei buuttaa turhaan

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        Ladataan...
      </div>
    );
  }

  if (!user || user.role !== 'driver') {
    return <Navigate to="/admin-login" state={{from: location}} replace />;
  }

  const isActive = (path: string) =>
    path === '/driver'
      ? location.pathname === '/driver'
      : location.pathname.startsWith(path);

  return (
    <ThemeProvider defaultTheme="system" storageKey="quantix-theme-driver">
      <div className="flex flex-col min-h-screen bg-background font-sans pb-[80px]">
        {/* Yläpalkki */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          {isTracking && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-green-200 dark:border-green-800">
              <Navigation
                size={12}
                className="fill-green-700 dark:fill-green-400"
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              GPS Päällä
            </div>
          )}

          <button
            onClick={() => navigate('/driver')}
            className="relative bg-card w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-border text-muted-foreground hover:text-primary transition-colors"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-card animate-bounce">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet context={{orders, deliveries}} />
        </main>

        {/* Alapalkki */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border grid grid-cols-4 py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-none">
          {navItems.map(({to, icon: Icon, label}) => {
            const active = isActive(to);
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex flex-col items-center justify-center gap-1 p-2 min-h-[60px] bg-transparent transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
                <span
                  className={`text-[0.7rem] ${
                    active ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        <style>
          {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
          }
        `}
        </style>
      </div>
    </ThemeProvider>
  );
}
