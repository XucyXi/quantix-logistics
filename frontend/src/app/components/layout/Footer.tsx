import {Link} from 'react-router';
import {Truck, Mail, Phone, MapPin} from 'lucide-react';

// Footer kokoaa navigaation, portaalilinkit ja yhteystiedot yhteen.
export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0a1929',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: "'Space Grotesk', sans-serif",
        marginTop: 'auto',
      }}
    >
      {/* Main footer content */}
      <div
        style={{maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 2rem'}}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  background: 'linear-gradient(135deg, #f97316, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Truck size={18} color="white" />
              </div>
              <span
                style={{color: '#ffffff', fontWeight: 700, fontSize: '1rem'}}
              >
                QUANTIX <span style={{color: '#f97316'}}>LOGISTICS</span>
              </span>
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                lineHeight: 1.7,
                marginBottom: '1.25rem',
              }}
            >
              Moderni ruokalogistiikka-järjestelmä, joka yhdistää
              jakelukeskukset, kuljettajat ja kaupat saumattomasti.
            </p>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              {['FB', 'IG', 'LI'].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              Palvelut
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {/* Linkit renderöidään taulukosta, jotta lisäys/poisto on helppoa ilman JSX-toistoa. */}
              {[
                {to: '/products', label: 'Tuotteet'},
                {to: '/pricing', label: 'Hinnoittelu'},
                {to: '/cart', label: 'Ostoskori'},
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = '#f97316')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(255,255,255,0.6)')
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4
              style={{
                color: '#ffffff',
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              Portaalit
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {/* Portaalilinkit pidetään erillisenä listana, jotta roolikohtainen navilogiikka on selkeä. */}
              {[
                {to: '/login', label: 'Asiakkaan kirjautuminen'},
                {to: '/register', label: 'Rekisteröityminen'},
                {to: '/admin/login', label: 'Ylläpito'},
                {to: '/driver', label: 'Kuljettajan portaali'},
                {to: '/store', label: 'Kaupan portaali'},
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = '#f97316')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color =
                        'rgba(255,255,255,0.6)')
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                color: '#ffffff',
                fontWeight: 600,
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              Yhteystiedot
            </h4>
            <div
              style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}
            >
              {/* Ikoni + teksti -parit tehdään mapilla, jotta rakenne pysyy yhtenäisenä. */}
              {[
                {Icon: Mail, text: 'info@quantixlogistics.fi'},
                {Icon: Phone, text: '+358 9 1234 5678'},
                {Icon: MapPin, text: 'Logistiikkakatu 12, 00200 Helsinki'},
              ].map(({Icon, text}) => (
                <div
                  key={text}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Icon
                    size={15}
                    style={{color: '#f97316', marginTop: 2, flexShrink: 0}}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alapalkki: copyright + juridiset linkit */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <p style={{fontSize: '0.8rem', margin: 0}}>
            © 2026 Quantix Logistics Oy. Kaikki oikeudet pidätetään.
          </p>
          <div style={{display: 'flex', gap: '1.5rem'}}>
            {['Tietosuoja', 'Käyttöehdot', 'Evästeet'].map((t) => (
              <a
                key={t}
                href="#"
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                }}
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
