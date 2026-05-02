import {Outlet, useNavigate, useLocation, Navigate} from 'react-router';
import {Package, MapPin, User, Home} from 'lucide-react';
import {DeliveryTracking, Order} from '../../types/logistics';
import {useEffect, useState} from 'react';

import {useAuth} from '../contexts/AuthContext';
import api from '../lib/api';

export function DriverRoot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);

  const [deliveries] = useState<DeliveryTracking[]>([]);

  const {user, isLoading} = useAuth();

  const navItems = [
    {to: '/driver', icon: Home, label: 'Koti'},
    {to: '/driver/deliveries', icon: Package, label: 'Toimitukset'},
    {to: '/driver/map', icon: MapPin, label: 'Kartta'},
    {to: '/driver/profile', icon: User, label: 'Profiili'},
  ];

  useEffect(() => {
    const fetchMyDeliveries = async () => {
      try {
        const {data} = await api.get('/orders/assigned');

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.error('Bäkki palautti odottamattoman rakenteen:', data);
          setOrders([]);
        }
      } catch (err) {
        console.error('Datan haku epäonnistui:', err);
      }
    };

    if (user && user.role === 'driver') {
      fetchMyDeliveries();
    }
  }, [user]);

  // --- ROUTE GUARD (PORTSARI) Tulee vasta hookkien jälkeen ---
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
  // -----------------------------------------------------------

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
    </div>
  );
}
