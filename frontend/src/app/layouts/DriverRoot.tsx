import {Outlet, useNavigate, useLocation, Navigate} from 'react-router';
import {Package, MapPin, User, Home, Navigation} from 'lucide-react';
import {DeliveryTracking, Order} from '../../types/logistics';
import {useEffect, useState, useRef} from 'react';

import {useAuth} from '../contexts/AuthContext';
import {orderService} from '../services/orderService';

export function DriverRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries] = useState<DeliveryTracking[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  // Tallennetaan edellisen päivityksen aikaleima
  const lastLocationUpdate = useRef<number>(0);

  const {user, isLoading} = useAuth();

  const navItems = [
    {to: '/driver', icon: Home, label: 'Koti'},
    {to: '/driver/deliveries', icon: Package, label: 'Toimitukset'},
    {to: '/driver/map', icon: MapPin, label: 'Kartta'},
    {to: '/driver/profile', icon: User, label: 'Profiili'},
  ];

  // Haetaan tilaukset säännöllisesti taustalla
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

  // KOKO SOVELLUKSEN LAAJUINEN GPS-SEURANTA
  useEffect(() => {
    let watchId: number;

    const activeTransitOrders = orders.filter((o) => o.status === 'in_transit');

    if (activeTransitOrders.length > 0 && user?.role === 'driver') {
      if ('geolocation' in navigator) {
        setTimeout(() => setIsTracking(true), 0);

        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const now = Date.now();

            // Onko kulunut 30 sekuntia (30000 millisekuntia) edellisestä päivityksestä?
            if (now - lastLocationUpdate.current < 30000) {
              return; // Jos ei, ohitetaan tämä GPS-päivitys kokonaan.
            }

            // Päivitetään uusi aikaleima
            lastLocationUpdate.current = now;

            const {latitude, longitude} = position.coords;

            activeTransitOrders.forEach((order) => {
              orderService
                .updateDeliveryLocation(order.order_id, {latitude, longitude})
                .catch((err) =>
                  console.error(
                    `Sijainnin lähetys epäonnistui tilaukselle ${order.order_id}:`,
                    err
                  )
                );
            });
          },
          (err) => {
            console.error('Sijainnin hakeminen epäonnistui:', err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000,
          }
        );
      } else {
        console.warn('Selaimesi ei tue paikannusta.');
      }
    } else {
      setTimeout(() => setIsTracking(false), 0);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [orders, user]);

  // --- ROUTE GUARD ---
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Ladataan...
      </div>
    );
  }

  if (!user || user.role !== 'driver') {
    return <Navigate to="/admin-login" state={{from: location}} replace />;
  }
  // -------------------

  const isActive = (path: string) =>
    path === '/driver'
      ? location.pathname === '/driver'
      : location.pathname.startsWith(path);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Space Grotesk', sans-serif",
        paddingBottom: '80px',
      }}
    >
      {/* Pieni globaali GPS-indikaattori yläreunaan, kun ajo on käynnissä */}
      {isTracking && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 100,
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            border: '1px solid #bbf7d0',
          }}
        >
          <Navigation
            size={12}
            className="fill-green-700"
            style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          GPS Päällä
        </div>
      )}

      {/* Main content */}
      <main style={{flex: 1, overflow: 'auto'}}>
        <Outlet context={{orders, deliveries}} />
      </main>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          padding: '0.5rem 0',
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}
      >
        {navItems.map(({to, icon: Icon, label}) => {
          const active = isActive(to);
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                padding: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                color: active ? '#f97316' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minHeight: '60px',
              }}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span
                style={{fontSize: '0.7rem', fontWeight: active ? 700 : 500}}
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
  );
}
