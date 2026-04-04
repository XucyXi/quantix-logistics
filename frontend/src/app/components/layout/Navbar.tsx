import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router';
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
import {useAuth} from '../../contexts/AuthContext';

export function Navbar() {
  // Mobiilivalikon ja käyttäjävalikon paikallinen UI-tila.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {totalItems} = useCart();
  const {user, logout} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ylävalikon päälinkit.
  const navLinks = [
    {to: '/', label: 'Etusivu'},
    {to: '/products', label: 'Tuotteet'},
    {to: '/pricing', label: 'Hinnoittelu'},
  ];

  // Etusivu vaatii tarkan osuman, muut linkit hyväksyvät myös alireitit.
  // Esim. /products/123 merkitään edelleen Tuotteet-kohdan alle aktiiviseksi.
  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const handleLogout = () => {
    // Suljetaan valikko ennen navigointia, jotta UI ei jää auki seuraavalle sivulle.
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Roolikohtaiset tekstit näkyvät käyttäjävalikossa.
  const roleLabels: Record<string, string> = {
    customer: 'Asiakas',
    admin: 'Ylläpito',
    driver: 'Kuljettaja',
    store: 'Kauppa',
  };

  // Roolikohtaiset dashboard-polut.
  const roleDashboard: Record<string, string> = {
    admin: '/admin',
    driver: '/driver',
    store: '/store',
    customer: '/products',
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(15, 36, 68, 0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div style={{maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Truck size={20} color="white" />
            </div>
            <div>
              <span
                style={{
                  color: '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                QUANTIX
              </span>
              <span
                style={{color: '#f97316', fontSize: '1.1rem', fontWeight: 700}}
              >
                {' '}
                LOGISTICS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div
            style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}
            className="hidden md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                // Inline-hoverit pidetään tässä, koska komponentti käyttää pääosin inline-tyylejä.
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 6,
                  color: isActive(link.to)
                    ? '#f97316'
                    : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  backgroundColor: isActive(link.to)
                    ? 'rgba(249,115,22,0.1)'
                    : 'transparent',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.to)) {
                    (e.target as HTMLElement).style.color = '#ffffff';
                    (e.target as HTMLElement).style.backgroundColor =
                      'rgba(255,255,255,0.07)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.to)) {
                    (e.target as HTMLElement).style.color =
                      'rgba(255,255,255,0.8)';
                    (e.target as HTMLElement).style.backgroundColor =
                      'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            {/* Cart */}
            <Link
              to="/cart"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 8,
                color: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.07)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#f97316',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div style={{position: 'relative'}}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.875rem',
                    borderRadius: 8,
                    backgroundColor: 'rgba(249,115,22,0.15)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    color: '#f97316',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <User size={16} />
                  <span className="hidden md:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  // Pudotusvalikko ankkuroidaan oikeaan reunaan, jotta se pysyy napin alla
                  // myös silloin kun käyttäjän nimi on eri pituinen.
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      minWidth: 200,
                      backgroundColor: '#ffffff',
                      borderRadius: 10,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#0f2444',
                          fontSize: '0.875rem',
                        }}
                      >
                        {user.name}
                      </div>
                      <div style={{color: '#64748b', fontSize: '0.75rem'}}>
                        {roleLabels[user.role]}
                      </div>
                    </div>
                    {user.role !== 'customer' && (
                      <button
                        onClick={() => {
                          // Rooli määrää hallintapaneelin kohdenäkymän.
                          navigate(roleDashboard[user.role]);
                          setUserMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#374151',
                          fontSize: '0.875rem',
                          textAlign: 'left',
                        }}
                      >
                        <Settings size={15} />
                        Hallintapaneeli
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        textAlign: 'left',
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <LogOut size={15} />
                      Kirjaudu ulos
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{display: 'flex', gap: '0.5rem'}}>
                <Link
                  to="/login"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 8,
                    color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  Kirjaudu
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 8,
                    backgroundColor: '#f97316',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  Rekisteröidy
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 6,
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
              }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          // Mobiilissa näytetään sama linkkilista pystynäkymänä.
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '1rem',
            }}
            className="md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  color: isActive(link.to)
                    ? '#f97316'
                    : 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
