import {Outlet, useNavigate, useLocation, Navigate} from 'react-router';
import {Store, LogOut, Bell} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';

export function StoreRoot() {
  const navigate = useNavigate();
  const location = useLocation();

  const {user, isLoading, logout} = useAuth();

  // Portsari (tai Route Guard) VASTA hookkien jälkeen
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

  // Varmistetaan, että käyttäjä on olemassa ja että rooli on asiakas
  if (!user || user.role !== 'customer') {
    return <Navigate to="/login" state={{from: location}} replace />;
  }

  // Normi apufunktiot
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <header
        style={{
          backgroundColor: '#1e3a5f',
          color: 'white',
          padding: '0 1.5rem',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Store size={16} color="white" />
          </div>
          <div>
            <span style={{fontWeight: 700, fontSize: '0.9rem'}}>QUANTIX</span>
            <span
              style={{color: '#f97316', fontWeight: 600, fontSize: '0.85rem'}}
            >
              {' '}
              | Kaupan portaali
            </span>
          </div>
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          {user?.company && (
            <span
              style={{fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)'}}
            >
              {user.company}
            </span>
          )}
          <div style={{position: 'relative'}}>
            <Bell size={18} color="rgba(255,255,255,0.7)" />
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: '#f97316',
                color: 'white',
                fontSize: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.3rem 0.75rem',
              borderRadius: 6,
              backgroundColor: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            <LogOut size={14} />
            Ulos
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
