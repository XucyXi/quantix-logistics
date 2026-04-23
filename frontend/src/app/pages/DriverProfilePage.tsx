import {motion} from 'motion/react';
import {
  User,
  Truck,
  Package,
  Clock,
  MapPin,
  LogOut,
  Settings,
  Bell,
  ChevronRight,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {useNavigate} from 'react-router';

export function DriverProfilePage() {
  const {user, logout} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = [
    {label: 'Toimituksia tänään', value: '6', icon: Package, color: '#f97316'},
    {label: 'Yhteensä viikolla', value: '28', icon: Truck, color: '#2563eb'},
    {
      label: 'Keskimääräinen aika',
      value: '12 min',
      icon: Clock,
      color: '#16a34a',
    },
    {label: 'Ajettu km', value: '156 km', icon: MapPin, color: '#8b5cf6'},
  ];

  const menuItems = [
    {label: 'Asetukset', icon: Settings, color: '#64748b'},
    {label: 'Ilmoitukset', icon: Bell, color: '#64748b'},
  ];

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        padding: '1.5rem',
      }}
    >
      {/* Profile Header */}
      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          padding: '2rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f2444, #1e3a5f)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'white',
          }}
        >
          {user?.name?.charAt(0) || 'K'}
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f2444',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {user?.name || 'Kuljettaja'}
        </h1>
        <p style={{fontSize: '1rem', color: '#64748b', margin: '0.5rem 0 0 0'}}>
          {user?.email || 'kuljettaja@quantix.fi'}
        </p>
        <div
          style={{
            marginTop: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: 12,
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            fontSize: '0.9rem',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#16a34a',
            }}
          />
          Aktiivinen
        </div>
      </motion.div>

      {/* Stats */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0f2444',
          marginBottom: '1rem',
        }}
      >
        Tilastot
      </h2>
      <div className="grid grid-cols-2 gap-3" style={{marginBottom: '1.5rem'}}>
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, scale: 0.9}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: idx * 0.05}}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: '1.25rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${stat.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <stat.icon size={22} color={stat.color} />
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#0f2444',
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{color: '#64748b', fontSize: '0.85rem', fontWeight: 600}}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Menu */}
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#0f2444',
          marginBottom: '1rem',
        }}
      >
        Asetukset
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {menuItems.map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: idx * 0.05}}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              minHeight: '64px',
              borderRadius: 16,
              backgroundColor: 'white',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <item.icon size={20} color={item.color} />
              </div>
              <span
                style={{fontSize: '1.05rem', fontWeight: 700, color: '#0f2444'}}
              >
                {item.label}
              </span>
            </div>
            <ChevronRight size={20} color="#94a3b8" />
          </motion.button>
        ))}
      </div>

      {/* Logout */}
      <motion.button
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
        onClick={handleLogout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1.25rem',
          minHeight: '64px',
          borderRadius: 16,
          backgroundColor: '#dc2626',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: 800,
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
        }}
      >
        <LogOut size={24} />
        Kirjaudu ulos
      </motion.button>
    </div>
  );
}
