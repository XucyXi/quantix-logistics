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
import {ModeToggle} from '../components/layout/ModeToggle.tsx';

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
    // !! Käytetään tässä Tailwind-luokkia dynaamisiin väreihin kaverit !!
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar - Tässä pidetään inline-tyylit layoutille, mutta värit classNameen */}
      <aside
        className="bg-sidebar border-r border-sidebar-border z-50 flex flex-col shrink-0"
        style={{
          width: isMobile ? (sidebarOpen ? 240 : 0) : sidebarOpen ? 240 : 64,
          transition: 'width 0.3s ease, transform 0.3s ease',
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          overflow: 'hidden',
          transform:
            isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        }}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between min-h-[64px]">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shrink-0">
                <Truck size={15} color="white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-tight">
                  QUANTIX
                </div>
                <div className="text-orange-500 font-semibold text-xs">
                  YLLÄPITO
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-7 h-7 rounded-md bg-white/10 border-none text-white/70 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors"
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({to, icon: Icon, label}) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={closeMobileSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap overflow-hidden ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {(sidebarOpen || !isMobile) && <span>{label}</span>}
                {(sidebarOpen || !isMobile) && active && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t border-sidebar-border">
          {sidebarOpen && user && (
            <div className="mb-3">
              <div className="text-sidebar-foreground font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {user.name}
              </div>
              <div className="text-sidebar-foreground/50 text-xs">
                Ylläpitäjä
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium text-sm w-full transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {sidebarOpen && 'Kirjaudu ulos'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top bar */}
        <header className="bg-card border-b border-border h-16 px-4 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <h2 className="m-0 text-foreground font-semibold text-lg">
              Hallintapaneeli
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <ModeToggle />

            <div className="relative cursor-pointer hover:text-primary transition-colors text-muted-foreground">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[0.6rem] flex items-center justify-center">
                3
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              {user?.name?.[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
