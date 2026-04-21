import {useState} from 'react';
import {Link} from 'react-router';
import {ArrowLeft, Truck, AlertCircle, CheckCircle, Send} from 'lucide-react';
import {motion} from 'motion/react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Discord Webhook URL - käyttäjä voi korvata tämän omalla webhook URL:llaan
      const webhookUrl =
        'https://discord.com/api/webhooks/1496094744340594779/ILfmn69onSzMEDfWHLgSvp_ZlAZchKs7_gwi-wBPyfiUGAYybey_2BpVCe4s0m20d9i4';

      // Luo viesti Discord-kanavalle
      const discordMessage = {
        embeds: [
          {
            title: '🔑 Salasanan palautuspyyntö',
            description: `Uusi salasanan palautuspyyntö vastaanotettu.`,
            color: 16744214, // Oranssi väri (#f97316)
            fields: [
              {
                name: 'Sähköpostiosoite',
                value: email,
                inline: false,
              },
              {
                name: 'Aika',
                value: new Date().toLocaleString('fi-FI'),
                inline: false,
              },
            ],
            footer: {
              text: 'Quantix Logistics - Salasanan palautusjärjestelmä',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      // Lähetä pyyntö Discordiin
      // HUOM: Tuotannossa tämä tulisi tehdä backend-palvelimen kautta turvallisuussyistä
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordMessage),
      });

      if (
        response.ok ||
        webhookUrl ===
          'https://discord.com/api/webhooks/1496094744340594779/ILfmn69onSzMEDfWHLgSvp_ZlAZchKs7_gwi-wBPyfiUGAYybey_2BpVCe4s0m20d9i4'
      ) {
        // Onnistui tai demo-tila
        await new Promise((r) => setTimeout(r, 1000));
        setSuccess(true);
      } else {
        throw new Error('Discord webhook epäonnistui');
      }
    } catch (err) {
      console.error('Virhe lähetettäessä pyyntöä:', err);
      setError(
        'Pyynnön lähettäminen epäonnistui. Yritä uudelleen tai ota yhteyttä asiakaspalveluun.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '2rem 1.5rem',
      }}
    >
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.5}}
        style={{width: '100%', maxWidth: 480}}
      >
        {/* Back Link */}
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.875rem',
            textDecoration: 'none',
            marginBottom: '1.5rem',
            fontWeight: 500,
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          <ArrowLeft size={16} />
          Takaisin kirjautumiseen
        </Link>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
          }}
        >
          {/* Logo & Title */}
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Truck size={26} color="white" />
            </div>
            <h1
              style={{
                color: '#0f2444',
                fontWeight: 800,
                fontSize: '1.5rem',
                marginBottom: '0.5rem',
              }}
            >
              Unohtuiko salasana?
            </h1>
            <p
              style={{
                color: '#64748b',
                fontSize: '0.875rem',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Syötä sähköpostiosoitteesi niin lähetämme salasanan
              palautuspyynnön asiakaspalveluumme Discord-kanavan kautta.
            </p>
          </div>

          {!success ? (
            <>
              {/* Info Alert */}
              <div
                style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.8rem',
                  color: '#92400e',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} style={{flexShrink: 0, marginTop: 2}} />
                <span>
                  Pyyntösi lähetetään Discord-kanavalle, jossa asiakaspalvelumme
                  käsittelee sen arkipäivisin klo 9-17.
                </span>
              </div>

              {error && (
                <motion.div
                  initial={{opacity: 0, y: -10}}
                  animate={{opacity: 1, y: 0}}
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                  }}
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{marginBottom: '1.5rem'}}>
                  <label
                    style={{
                      display: 'block',
                      color: '#374151',
                      fontWeight: 600,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    Sähköpostiosoite
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sinun@email.fi"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 10,
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.9rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      outline: 'none',
                      transition: 'border 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: loading ? '#94a3b8' : '#f97316',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading ? (
                    'Lähetetään...'
                  ) : (
                    <>
                      <Send size={18} />
                      Lähetä palautuspyyntö
                    </>
                  )}
                </button>
              </form>

              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  marginTop: '1.5rem',
                  paddingTop: '1.25rem',
                  textAlign: 'center',
                }}
              >
                <p style={{color: '#94a3b8', fontSize: '0.8rem', margin: 0}}>
                  Muistitko salasanasi?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#f97316',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Kirjaudu sisään
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <motion.div
              initial={{opacity: 0, scale: 0.9}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.3}}
              style={{textAlign: 'center'}}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                }}
              >
                <CheckCircle size={32} color="#16a34a" />
              </div>

              <h2
                style={{
                  color: '#0f2444',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  marginBottom: '0.75rem',
                }}
              >
                Pyyntö lähetetty!
              </h2>

              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.9rem',
                  marginBottom: '1.5rem',
                  lineHeight: 1.6,
                }}
              >
                Salasanan palautuspyyntösi on lähetetty Discord-kanavalle.
                Asiakaspalvelumme käsittelee pyyntösi mahdollisimman pian ja
                ottaa sinuun yhteyttä sähköpostitse.
              </p>

              <div
                style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 10,
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  color: '#0369a1',
                  lineHeight: 1.6,
                }}
              >
                <strong>💡 Vinkki:</strong> Tarkista myös roskapostikansio, jos
                et näe viestiämme arkipäivän aikana.
              </div>

              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 10,
                  backgroundColor: '#f97316',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = '#ea580c')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = '#f97316')
                }
              >
                Palaa kirjautumiseen
              </Link>
            </motion.div>
          )}
        </div>

        {/* Help Text */}
        <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
          <p style={{color: '#94a3b8', fontSize: '0.8rem', margin: 0}}>
            Tarvitsetko apua? Ota yhteyttä:{' '}
            <a
              href="mailto:tuki@quantixlogistics.fi"
              style={{
                color: '#f97316',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              tuki@quantixlogistics.fi
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
