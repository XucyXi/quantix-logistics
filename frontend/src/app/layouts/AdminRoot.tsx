import {useState, useEffect} from 'react';
import {Outlet, Link, useLocation, useNavigate} from 'react-router';
import {
  LayoutDashboard,
  Truck,
  Package,
  Store,
  Users,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Map,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';

const navItems = [
  {to: '/admin', icon: LayoutDashboard, label: 'Kojelauta'},
  {to: '/admin/routes', icon: Truck, label: 'Reitit'},
  {to: '/admin/live-map', icon: Map, label: 'Live-kartta'},
  {to: '/admin/orders', icon: Package, label: 'Tilaukset'},
  {to: '/admin/stores', icon: Store, label: 'Kaupat'},
  {to: '/admin/users', icon: Users, label: 'Käyttäjät'},
  {to: '/admin/reports', icon: BarChart2, label: 'Raportit'},
  {to: '/admin/settings', icon: Settings, label: 'Asetukset'},
];

export function AdminRoot() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const {user, logout} = useAuth();

  // Tarkista näytön koko
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(path);

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isMobile ? (sidebarOpen ? 240 : 0) : sidebarOpen ? 240 : 64,
          backgroundColor: '#0f2444',
          transition: 'width 0.3s ease, transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'hidden',
          zIndex: 50,
          transform:
            isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Sidebar header */}
        <div
          style={{
            padding: '1rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 64,
          }}
        >
          {sidebarOpen && (
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={15} color="white" />
              </div>
              <div>
                <div
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    lineHeight: 1.2,
                  }}
                >
                  QUANTIX
                </div>
                <div
                  style={{
                    color: '#f97316',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                  }}
                >
                  YLLÄPITO
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            padding: '0.75rem 0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {navItems.map(({to, icon: Icon, label}) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileSidebar}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  borderRadius: 8,
                  textDecoration: 'none',
                  backgroundColor: active
                    ? 'rgba(249,115,22,0.15)'
                    : 'transparent',
                  color: active ? '#f97316' : 'rgba(255,255,255,0.65)',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <Icon size={18} style={{flexShrink: 0}} />
                {(sidebarOpen || !isMobile) && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {label}
                  </span>
                )}
                {(sidebarOpen || !isMobile) && active && (
                  <ChevronRight size={14} style={{marginLeft: 'auto'}} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div
          style={{
            padding: '1rem 0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {sidebarOpen && user && (
            <div style={{marginBottom: '0.75rem'}}>
              <div
                style={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.name}
              </div>
              <div
                style={{color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem'}}
              >
                Ylläpitäjä
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.5rem 0.5rem',
              borderRadius: 6,
              border: 'none',
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              width: '100%',
            }}
          >
            <LogOut size={16} style={{flexShrink: 0}} />
            {sidebarOpen && 'Kirjaudu ulos'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: '100%',
        }}
      >
        {/* Top bar */}
        <header
          style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 1rem',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  backgroundColor: 'white',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <h2 style={{margin: 0, color: '#0f2444', fontSize: '1.1rem'}}>
              Hallintapaneeli
            </h2>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{position: 'relative'}}>
              <Bell size={20} color="#64748b" />
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
                3
              </span>
            </div>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                backgroundColor: '#0f2444',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.name?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? '1rem' : '1.5rem',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
