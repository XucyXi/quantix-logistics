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

function portalEntriesFor(user: {role: UserRole} | null): PortalEntry[] {
  if (!user) {
    return [
      {label: 'Hallintaportaali', path: '/admin', emoji: '🏢'},
      {label: 'Kuljettajaportaali', path: '/driver', emoji: '🚚'},
      {label: 'Asiakasportaali', path: '/customer', emoji: '👤'},
    ];
  }
  switch (user.role) {
    case 'admin':
      return [{label: 'Hallintaportaali', path: '/admin', emoji: '🏢'}];
    case 'driver':
      return [{label: 'Kuljettajaportaali', path: '/driver', emoji: '🚚'}];
    case 'customer':
    default:
      return [{label: 'Asiakasportaali', path: '/customer', emoji: '👤'}];
  }
}

export function Navbar() {
  // Mobiilimenu, desktop-käyttäjämenu ja mobiilin portaali-alaosio hallitaan erikseen.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobilePortalsOpen, setMobilePortalsOpen] = useState(false);
  const [desktopPortalsOpen, setDesktopPortalsOpen] = useState(false);

  const {totalItems} = useCart();
  const {user, logout} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    {to: '/', label: 'Etusivu'},
    {to: '/about', label: 'Meistä'},
    {to: '/products', label: 'Tuotteet'},
    {to: '/pricing', label: 'Hinnoittelu'},
  ];

  // Juurireitti käsitellään erikoistapauksena, muut polut vertaillaan startsWith-logiikalla.
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

  const portalNav = portalEntriesFor(user);
  const showPortalDropdown = !user;

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
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 1.5rem',
        }}
      >
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
                style={{
                  color: '#f97316',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                }}
              >
                {' '}
                LOGISTICS
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            className="hidden md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
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

            {showPortalDropdown ? (
              <div
                style={{position: 'relative'}}
                onMouseEnter={() => setDesktopPortalsOpen(true)}
                onMouseLeave={() => setDesktopPortalsOpen(false)}
              >
                <button
                  type="button"
                  style={{
                    padding: '0.4rem 0.9rem',
                    borderRadius: 6,
                    color: desktopPortalsOpen
                      ? '#ffffff'
                      : 'rgba(255,255,255,0.8)',
                    backgroundColor: desktopPortalsOpen
                      ? '#f97316'
                      : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                >
                  Portaalit
                  <ChevronDown
                    size={16}
                    color={desktopPortalsOpen ? '#ffffff' : 'currentColor'}
                    style={{
                      transform: desktopPortalsOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0)',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                </button>

                {desktopPortalsOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      /* Näkymätön silti: kursori pysyy hover-vyöhykkeessä vaikka valikon ja napin välissä olisi rako */
                      paddingTop: 8,
                      minWidth: 200,
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 10,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                      }}
                    >
                      {portalNav.map((p, i) => (
                        <button
                          key={p.path}
                          type="button"
                          onClick={() => {
                            navigate(p.path);
                            setDesktopPortalsOpen(false);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f97316';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#374151';
                          }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderTop: i > 0 ? '1px solid #f1f5f9' : undefined,
                            cursor: 'pointer',
                            color: '#374151',
                            fontSize: '0.875rem',
                            textAlign: 'left',
                            transition: 'background-color 0.15s, color 0.15s',
                          }}
                        >
                          {p.emoji} {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={portalNav[0].path}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 6,
                  color: 'rgba(255,255,255,0.8)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.color = '#ffffff';
                  el.style.backgroundColor = '#f97316';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.color = 'rgba(255,255,255,0.8)';
                  el.style.backgroundColor = 'transparent';
                }}
              >
                <span>{portalNav[0].emoji}</span>
                {portalNav[0].label}
              </Link>
            )}
          </div>

          {/* Right side */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
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

            {/* Desktop Auth: näyttää joko käyttäjämenun tai login/register-linkit */}
            <div className="hidden md:block">
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
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
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
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '0.75rem',
                          }}
                        >
                          {roleLabels[user.role]}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(portalNav[0].path);
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
                        {portalNav[0].label}
                      </button>
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
                      color: '#0f2444',
                      backgroundColor: '#f97316',
                      border: 'none',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    Rekisteröidy
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle: näkyy vain md-breakpointin alapuolella */}
            <button
              onClick={() => {
                setMobileOpen(!mobileOpen);
                if (mobileOpen) setMobilePortalsOpen(false); // Sulkee alavalikon kun päävalikko suljetaan
              }}
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

        {/* Backdrop overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed',
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.3s ease-out',
            }}
            className="md:hidden"
          />
        )}

        {/* MOBILE MENU - Slide from right */}
        {mobileOpen && (
          <div
            style={{
              position: 'fixed',
              top: 64,
              right: 0,
              width: '280px',
              maxWidth: '80vw',
              height: 'calc(100vh - 64px)',
              backgroundColor: 'rgba(15, 36, 68, 0.98)',
              backdropFilter: 'blur(12px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: '1.5rem',
              paddingTop: '1rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              zIndex: 1000,
              boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
              animation: 'slideInRight 0.3s ease-out',
            }}
            className="md:hidden"
          >
            {/* Navigointilinkit */}
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
                  fontSize: '1rem',
                  fontWeight: 500,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {link.label}
              </Link>
            ))}

            {showPortalDropdown && (
              <div>
                <button
                  type="button"
                  onClick={() => setMobilePortalsOpen(!mobilePortalsOpen)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0',
                    color: 'rgba(255,255,255,0.8)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Portaalit
                  <ChevronDown
                    size={18}
                    style={{
                      transform: mobilePortalsOpen
                        ? 'rotate(180deg)'
                        : 'rotate(0)',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                </button>

                {mobilePortalsOpen && (
                  <div
                    style={{
                      padding: '0.5rem 0 0.5rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      backgroundColor: 'rgba(0,0,0,0.1)',
                    }}
                  >
                    {portalNav.map((p) => (
                      <Link
                        key={p.path}
                        to={p.path}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {p.emoji} {p.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Kirjautumisen tilan mukainen lisävalikko mobiiliin */}
            <div style={{marginTop: '1rem'}}>
              {user ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      padding: '0.5rem 0',
                      color: '#ffffff',
                      fontWeight: 600,
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {user.name}{' '}
                    <span
                      style={{
                        color: 'rgba(255,255,255,0.5)',
                        fontWeight: 400,
                        fontSize: '0.85rem',
                      }}
                    >
                      ({roleLabels[user.role]})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigate(portalNav[0].path);
                      setMobileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0',
                      color: 'rgba(255,255,255,0.8)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <Settings size={18} />
                    {portalNav[0].label}
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 0',
                      color: '#f87171',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <LogOut size={18} />
                    Kirjaudu ulos
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 8,
                      color: 'rgba(255,255,255,0.9)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
                  >
                    Kirjaudu
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 8,
                      color: '#0f2444',
                      backgroundColor: '#f97316',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: 500,
                    }}
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
