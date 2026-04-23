import {motion} from 'motion/react';
import {
  Bell,
  Lock,
  Globe,
  Mail,
  Palette,
  Database,
  User,
  Shield,
} from 'lucide-react';

export function SettingsPage() {
  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        style={{marginBottom: '1.5rem'}}
      >
        <h1
          style={{
            color: '#0f2444',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '0.5rem',
          }}
        >
          Asetukset
        </h1>
        <p style={{color: '#64748b', fontSize: '0.85rem', margin: 0}}>
          Hallitse järjestelmän asetuksia ja konfiguraatioita
        </p>
      </motion.div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={20} color="#2563eb" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Tilitiedot
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Yrityksen nimi
              </label>
              <input
                type="text"
                defaultValue="Quantix Logistics Oy"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Y-tunnus
              </label>
              <input
                type="text"
                defaultValue="1234567-8"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              style={{
                padding: '0.75rem',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#f97316',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#ea580c')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#f97316')
              }
            >
              Tallenna muutokset
            </button>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} color="#dc2626" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Turvallisuus
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {[
              {label: 'Vaihda salasana', desc: 'Päivitä tilisi salasana'},
              {
                label: 'Kaksivaiheinen tunnistautuminen',
                desc: 'Ota käyttöön 2FA lisäturvallisuutta varten',
              },
              {
                label: 'Kirjautumishistoria',
                desc: 'Tarkastele viimeaikaisia kirjautumisia',
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: '1rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f8fafc')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <div>
                  <div
                    style={{
                      color: '#0f2444',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{color: '#94a3b8', fontSize: '0.8rem'}}>
                    {item.desc}
                  </div>
                </div>
                <Shield size={18} color="#94a3b8" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={20} color="#16a34a" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Ilmoitukset
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {[
              {label: 'Sähköposti-ilmoitukset', enabled: true},
              {label: 'Push-ilmoitukset', enabled: true},
              {label: 'Tilauspäivitykset', enabled: true},
              {label: 'Varastoilmoitukset', enabled: false},
              {label: 'Markkinointisähköpostit', enabled: false},
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                }}
              >
                <span
                  style={{
                    color: '#374151',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
                <div
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: item.enabled ? '#f97316' : '#e2e8f0',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: 2,
                      left: item.enabled ? 22 : 2,
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Email Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.4}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Mail size={20} color="#d97706" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Sähköpostiasetukset
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                SMTP-palvelin
              </label>
              <input
                type="text"
                defaultValue="smtp.quantixlogistics.fi"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Lähettäjän osoite
              </label>
              <input
                type="email"
                defaultValue="noreply@quantixlogistics.fi"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              style={{
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.color = '#f97316';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              Testaa yhteys
            </button>
          </div>
        </motion.div>

        {/* System Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.5}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={20} color="#8b5cf6" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Järjestelmäasetukset
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Aikavyöhyke
              </label>
              <select
                defaultValue="Europe/Helsinki"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="Europe/Helsinki">Helsinki (UTC+2)</option>
                <option value="Europe/Stockholm">Stockholm (UTC+1)</option>
                <option value="Europe/Oslo">Oslo (UTC+1)</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Kieli
              </label>
              <select
                defaultValue="fi"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '0.9rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="fi">Suomi</option>
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>
            <button
              style={{
                padding: '0.75rem',
                borderRadius: 8,
                border: 'none',
                backgroundColor: '#f97316',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#ea580c')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#f97316')
              }
            >
              Tallenna asetukset
            </button>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.6}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Palette size={20} color="#f97316" />
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontWeight: 700,
                fontSize: '1rem',
                margin: 0,
              }}
            >
              Ulkoasu
            </h2>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label
                style={{
                  display: 'block',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  marginBottom: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Teema
              </label>
              <div style={{display: 'flex', gap: '0.75rem'}}>
                {[
                  {label: 'Vaalea', value: 'light'},
                  {label: 'Tumma', value: 'dark'},
                  {label: 'Auto', value: 'auto'},
                ].map((theme) => (
                  <div
                    key={theme.value}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: 8,
                      border:
                        theme.value === 'light'
                          ? '2px solid #f97316'
                          : '1px solid #e2e8f0',
                      backgroundColor:
                        theme.value === 'light' ? '#fff7ed' : 'transparent',
                      textAlign: 'center',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: theme.value === 'light' ? '#f97316' : '#64748b',
                      transition: 'all 0.2s',
                    }}
                  >
                    {theme.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
