import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
  Truck,
  ChevronDown,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import {useCart} from '../../contexts/CartContext';
import {useAuth, type UserRole} from '../../contexts/AuthContext';

type PortalEntry = {label: string; path: string; emoji: string};

// Palauttaa vain YHDEN portaalin kirjautuneen käyttäjän roolin perusteella.
// Jos ei ole kirjautunut, palauttaa null.
function getPortalForUser(user: {role: UserRole} | null): PortalEntry | null {
  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return {label: 'Ylläpito', path: '/admin', emoji: '🏢'};
    case 'driver':
      return {label: 'Kuljettaja', path: '/driver', emoji: '🚚'};
    case 'customer':
    default:
      return {label: 'Kaupan portaali', path: '/customer', emoji: '👤'};
  }
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const {totalItems} = useCart();
  const {user, logout} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Määritellään linkit dynaamisesti käyttäjän mukaan
  const navLinks = [
    {to: '/', label: 'Etusivu'},
    {to: '/about', label: 'Meistä'},
    // Tuotteet-linkki näkyy VAIKKA olisi admin tai asiakas.
    // (Joskus adminitkin haluavat nähdä sen, tai voit rajata vain user.role === 'customer')
    ...(user ? [{to: '/products', label: 'Tuotteet'}] : []),
    {to: '/pricing', label: 'Hinnoittelu'},
  ];

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const roleLabels: Record<string, string> = {
    customer: 'Asiakas',
    admin: 'Ylläpito',
    driver: 'Kuljettaja',
  };

  const userPortal = getPortalForUser(user);

  return (
    <nav className="sticky top-0 z-50 bg-[#0f2444]/95 backdrop-blur-md border-b border-white/10 font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Truck size={20} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg tracking-tight">
                QUANTIX
              </span>
              <span className="text-orange-500 font-bold text-lg">
                {' '}
                LOGISTICS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive(link.to)
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Suora linkki portaaliin, JOS käyttäjä on kirjautunut */}
            {userPortal && (
              <Link
                to={userPortal.path}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-orange-500 transition-all cursor-pointer group ml-2"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {userPortal.emoji}
                </span>
                {userPortal.label}
              </Link>
            )}
          </div>

          {/* Right side (Cart, Auth, Mobile Menu Toggle) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart (Näkyy aina jos on tuotteita, tai jos käyttäjä on kirjautunut sisään) */}
            {(user || totalItems > 0) && (
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0f2444] shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop Auth */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 text-sm font-bold hover:bg-orange-500/25 transition-all cursor-pointer"
                  >
                    <User size={16} />
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 min-w-[240px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <div className="font-bold text-[#0f2444] text-sm">
                          {user.name}
                        </div>
                        <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-0.5">
                          {roleLabels[user.role]}
                        </div>
                      </div>

                      {userPortal && (
                        <button
                          type="button"
                          onClick={() => {
                            navigate(userPortal.path);
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                        >
                          <Settings size={16} className="text-slate-400" />
                          Siirry portaaliin
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t border-slate-100 transition-colors cursor-pointer text-left"
                      >
                        <LogOut size={16} className="text-red-500" />
                        Kirjaudu ulos
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg text-white/90 hover:text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Kirjaudu
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    Rekisteröidy
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Backdrop Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 top-16 bg-black/60 z-40 animate-in fade-in"
          />
        )}

        {/* Mobile Menu Slide-in Panel */}
        {mobileOpen && (
          <div className="md:hidden fixed top-16 right-0 w-72 max-w-[85vw] h-[calc(100vh-64px)] bg-[#0f2444]/98 backdrop-blur-xl border-l border-white/10 p-6 flex flex-col overflow-y-auto z-50 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col gap-2 mb-8">
              {/* Navigointilinkit */}
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors cursor-pointer ${
                    isActive(link.to)
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Portaalin suora linkki mobiilissa, vain jos kirjautunut */}
              {userPortal && (
                <Link
                  to={userPortal.path}
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span className="text-lg">{userPortal.emoji}</span>{' '}
                  {userPortal.label}
                </Link>
              )}
            </div>

            {/* Mobile Auth Bottom Section */}
            <div className="mt-auto border-t border-white/10 pt-6">
              {user ? (
                <div className="flex flex-col gap-3">
                  <div className="mb-2 px-2">
                    <div className="text-white font-bold">{user.name}</div>
                    <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mt-1">
                      {roleLabels[user.role]}
                    </div>
                  </div>

                  {userPortal && (
                    <button
                      onClick={() => {
                        navigate(userPortal.path);
                        setMobileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors font-medium cursor-pointer text-left"
                    >
                      <Settings size={18} className="text-slate-400" />
                      Asetukset / Portaali
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium cursor-pointer text-left"
                  >
                    <LogOut size={18} />
                    Kirjaudu ulos
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-3 rounded-xl text-white border border-white/20 font-bold hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Kirjaudu sisään
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-colors cursor-pointer"
                  >
                    Rekisteröidy
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
