import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  Users,
  User,
  Target,
  Award,
  TrendingUp,
  Heart,
  Zap,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import quantixPropaganda from '../../../quanitxlogvideo1.mp4';
import teamImage from '../../../Meistä.png';
import tiimiBkg from '../../../Meistä.png';
import introVideo from '../../../intro.mp4';

const teamImg = teamImage;
const warehouseImg =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBsb2dpc3RpY3N8ZW58MXx8fHwxNzc0MzQwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080';
const teamTeamImg = tiimiBkg;

const values = [
  {
    icon: Heart,
    title: 'Asiakaslähtöisyys',
    desc: 'Asiakkaan tarpeet ovat toimintamme keskiössä. Kuuntelemme, kehitämme ja toimitamme.',
    color: '#f97316',
  },
  {
    icon: Zap,
    title: 'Tehokkuus',
    desc: 'Optimoimme jokaisen prosessin maksimaalisen tehokkuuden ja kustannussäästöjen saavuttamiseksi.',
    color: '#3b82f6',
  },
  {
    icon: Shield,
    title: 'Luotettavuus',
    desc: 'Lupaamme vain sen, minkä voimme täyttää ja täytämme sen aina ajallaan.',
    color: '#22c55e',
  },
  {
    icon: Globe,
    title: 'Läpinäkyvyys',
    desc: 'Kaikki tieto reaaliajassa. Ei piilokuluja eikä yllätyksiä.',
    color: '#8b5cf6',
  },
];

const milestones = [
  {year: '2019', event: 'Quantix Logistics perustettu Helsingissä'},
  {year: '2020', event: 'Ensimmäiset 50 kauppaa palvelussa'},
  {year: '2021', event: 'Live-seuranta julkaistu'},
  {year: '2022', event: 'Laajennuttiin 200+ kauppaan'},
  {year: '2023', event: 'ISO 22000 -sertifiointi saavutettu'},
  {year: '2024', event: '340+ kauppaa, 12 000 toimitusta viikossa'},
];

const stats = [
  {value: '340+', label: 'Kauppaa'},
  {value: '12 000', label: 'Toimitusta/vk'},
  {value: '99.2%', label: 'Ajallaan'},
  {value: '5v', label: 'Kokemusta'},
];

const team = [
  {
    name: 'Jere Mäkinen',
    role: 'Toimitusjohtaja',
    desc: '15v kokemus logistiikka-alalta',
  },
  {
    name: 'Teemu Virtanen',
    role: 'Teknologiajohtaja',
    desc: 'Aiemmin Senior Developer @ Wolt',
  },
  {
    name: 'Satvio Kallio',
    role: 'Operaatiopäällikkö',
    desc: '10v kokemus ruokaketjusta',
  },
  {
    name: 'Anders Hämäläinen',
    role: 'Manager, asiakaskokemus',
    desc: 'Vahva tausta asiakaskokemuksessa',
  },
];

export function AboutPage() {
  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#0f2444',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${teamImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0f2444 0%, rgba(15,36,68,0.92) 100%)',
          }}
        />

        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '4rem 1.5rem',
            position: 'relative',
            zIndex: 2,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.7}}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 1rem',
                borderRadius: 30,
                backgroundColor: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.3)',
                marginBottom: '1.5rem',
              }}
            >
              <Users size={16} color="#f97316" />
              <span
                style={{color: '#f97316', fontSize: '0.8rem', fontWeight: 600}}
              >
                Meistä
              </span>
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              Ruokalogistiikan{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #f97316, #fb923c)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                uudistajat
              </span>
            </h1>

            <p
              style={{
                color: 'rgba(255,255,255,0.75)',
                fontSize: '1.2rem',
                lineHeight: 1.75,
                maxWidth: 700,
                margin: '0 auto 2rem',
              }}
            >
              Quantix Logistics syntyi tarpeesta tehdä ruokalogistiikasta
              läpinäkyvää, tehokasta ja reaaliaikaista. Yhdistämme
              jakelukeskukset, kuljettajat ja kaupat yhteen älykkääseen
              järjestelmään.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  borderRadius: 10,
                  backgroundColor: '#f97316',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                }}
              >
                Liity mukaan
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.875rem 2rem',
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                }}
              >
                Tutustu tuotteisiin
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section style={{backgroundColor: 'white', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial={{opacity: 0, x: -30}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.7}}
              viewport={{once: true}}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 1rem',
                  borderRadius: 30,
                  backgroundColor: 'rgba(249,115,22,0.1)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  marginBottom: '1rem',
                }}
              >
                <Users size={16} color="#f97316" />
                <span
                  style={{
                    color: '#f97316',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  Meistä lyhyesti
                </span>
              </div>

              <h2
                style={{
                  color: '#0f2444',
                  fontSize: 'clamp(1.9rem, 3vw, 2.7rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  margin: '0 0 1rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Rakennamme ruokalogistiikasta läpinäkyvämpää arkea koko
                ketjulle.
              </h2>

              <p
                style={{
                  color: '#475569',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  margin: '0 0 1rem',
                }}
              >
                Quantix Logistics syntyi tarpeesta yhdistää jakelukeskukset,
                kuljettajat ja kaupat yhteen selkeään näkymään. Tavoitteemme on
                vähentää epävarmuutta, nopeuttaa päätöksentekoa ja tehdä
                toimitusketjusta aidosti ennakoitava.
              </p>

              <p
                style={{
                  color: '#475569',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                Kun tieto kulkee reaaliajassa, myös hävikki, viiveet ja
                ylimääräinen säätö vähenevät. Siksi rakennamme järjestelmää,
                jossa jokainen toimitus näkyy, jokainen rooli tietää mitä tehdä
                ja koko ketju toimii yhtenä kokonaisuutena.
              </p>
            </motion.div>

            <motion.div
              initial={{opacity: 0, x: 30}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.7, delay: 0.1}}
              viewport={{once: true}}
              style={{
                background:
                  'linear-gradient(180deg, rgba(15,36,68,0.98) 0%, rgba(23,50,79,0.96) 100%)',
                borderRadius: 24,
                padding: '1.5rem',
                color: 'white',
                boxShadow: '0 18px 40px rgba(15,36,68,0.22)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#f97316',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Introvideo
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: 'white',
                    }}
                  >
                    Katso lyhyt esittely
                  </h3>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.8rem',
                    borderRadius: 999,
                    backgroundColor: 'rgba(249,115,22,0.14)',
                    color: '#f97316',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid rgba(249,115,22,0.25)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  noin 40 s
                </div>
              </div>

              <div
                style={{
                  width: '100%',
                  borderRadius: 20,
                  backgroundColor: '#000000',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
                  overflow: 'hidden',
                  aspectRatio: '9 / 14',
                  minHeight: 360,
                }}
              >
                <video
                  controls
                  playsInline
                  preload="metadata"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    objectPosition: 'center 38%',
                  }}
                >
                  <source src={introVideo} type="video/mp4" />
                  Selaimesi ei tue videotoistoa.
                </video>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                {[
                  {label: 'Reaaliaikainen näkyvyys', value: '24/7'},
                  {label: 'Yksi yhteinen näkymä', value: 'Koko ketju'},
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 14,
                      padding: '0.95rem 1rem',
                    }}
                  >
                    <div
                      style={{
                        color: 'rgba(255,255,255,0.62)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginBottom: '0.3rem',
                      }}
                    >
                      {item.label}
                    </div>
                    <div style={{fontSize: '1rem', fontWeight: 800}}>
                      {item.value}
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    backgroundColor: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.22)',
                    borderRadius: 14,
                    padding: '0.95rem 1rem',
                  }}
                >
                  <div
                    style={{
                      color: '#f97316',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.3rem',
                    }}
                  >
                    Käytännössä
                  </div>
                  <div style={{fontSize: '1rem', fontWeight: 800}}>
                    Vähemmän säätöä
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{backgroundColor: '#f8fafc', padding: '3rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color: i % 2 === 0 ? '#f97316' : '#0f2444',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section style={{backgroundColor: 'white', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{opacity: 0, x: -40}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.7}}
              viewport={{once: true}}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: 'rgba(249,115,22,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Target size={24} color="#f97316" />
                </div>
                <h2
                  style={{
                    color: '#0f2444',
                    fontSize: '2rem',
                    fontWeight: 800,
                    margin: 0,
                  }}
                >
                  Missiomme
                </h2>
              </div>
              <p
                style={{
                  color: '#475569',
                  fontSize: '1.05rem',
                  lineHeight: 1.8,
                  marginBottom: '1.5rem',
                }}
              >
                Tehdä ruokalogistiikasta Suomessa älykkäintä, läpinäkyvintä ja
                tehokkainta koskaan. Autamme kauppoja, kuljettajia ja
                jakelukeskuksia toimimaan yhtenä saumattomana kokonaisuutena.
              </p>
              <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                {[
                  'Reaaliaikainen seuranta jokaiselle toimitukselle',
                  'Optimoidut reitit ja vähemmän hävikkiä',
                  'Täydellinen läpinäkyvyys koko toimitusketjuun',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '0.875rem',
                    }}
                  >
                    <CheckCircle
                      size={20}
                      color="#22c55e"
                      style={{marginTop: '0.125rem', flexShrink: 0}}
                    />
                    <span style={{color: '#64748b', fontSize: '0.95rem'}}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{opacity: 0, x: 40}}
              whileInView={{opacity: 1, x: 0}}
              transition={{duration: 0.7}}
              viewport={{once: true}}
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
            >
              <img
                src={warehouseImg}
                alt="Quantix warehouse"
                style={{width: '100%', height: 'auto', display: 'block'}}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{backgroundColor: '#f8fafc', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '3.5rem'}}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(249,115,22,0.1)',
                color: '#f97316',
                padding: '0.3rem 1rem',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              ARVOMME
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '1rem',
              }}
            >
              Periaatteet, jotka ohjaavat toimintaamme
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: '2rem 1.5rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: `${v.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <v.icon size={26} color={v.color} />
                </div>
                <h3
                  style={{
                    color: '#0f2444',
                    marginBottom: '0.75rem',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{backgroundColor: 'white', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '3.5rem'}}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(249,115,22,0.1)',
                color: '#f97316',
                padding: '0.3rem 1rem',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              TARINAMME
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
              }}
            >
              Matka tähän päivään
            </h2>
          </div>

          <div style={{maxWidth: 800, margin: '0 auto'}}>
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{opacity: 0, x: -30}}
                whileInView={{opacity: 1, x: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  marginBottom: '2rem',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      border: '3px solid #fff',
                      boxShadow: '0 0 0 4px rgba(249,115,22,0.2)',
                      zIndex: 2,
                    }}
                  />
                  {i !== milestones.length - 1 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: '#e2e8f0',
                        marginTop: '0.5rem',
                      }}
                    />
                  )}
                </div>
                <div style={{flex: 1, paddingBottom: '1.5rem'}}>
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#0f2444',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {m.year}
                  </div>
                  <p
                    style={{
                      color: '#475569',
                      fontSize: '1rem',
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {m.event}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{backgroundColor: '#0f2444', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '3.5rem'}}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: 'rgba(249,115,22,0.15)',
                color: '#f97316',
                padding: '0.3rem 1rem',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              TIIMIMME
            </div>
            <h2
              style={{
                color: 'white',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '1rem',
              }}
            >
              Asiantuntijat toimintasi tueksi
            </h2>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1rem',
                maxWidth: 600,
                margin: '0 auto',
              }}
            >
              Kokenut tiimimme logistiikasta, teknologiasta ja asiakaspalvelusta
              varmistaa parhaan mahdollisen palvelun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.1}}
                viewport={{once: true}}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16,
                  padding: '2rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(249,115,22,0.2)',
                    border: '3px solid rgba(249,115,22,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <User size={36} color="#f97316" />
                </div>
                <h3
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  {t.name}
                </h3>
                <div
                  style={{
                    color: '#f97316',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                  }}
                >
                  {t.role}
                </div>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.85rem',
                    margin: 0,
                  }}
                >
                  {t.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{marginTop: '2rem'}}>
            <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.7}}
              viewport={{once: true}}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              }}
            >
              <video
                controls
                playsInline
                preload="metadata"
                style={{
                  width: '50%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'center 38%',
                }}
              >
                <source src={quantixPropaganda} type="video/mp4" />
                Selaimesi ei tue videotoistoa.
              </video>
            </motion.div>
            <motion.div
              initial={{opacity: 0, y: 20}}
              whileInView={{opacity: 1, y: 0}}
              transition={{duration: 0.7, delay: 0.2}}
              viewport={{once: true}}
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12,
                padding: '1.5rem',
                marginTop: '1rem',
                color: 'white',
              }}
            >
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#f97316',
                  marginTop: 0,
                  marginBottom: '0.75rem',
                }}
              >
                Yhtä vahva tiimi, yhtä kuin tavoitteemme
              </h3>
              <p
                style={{
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  margin: 0,
                  marginBottom: '1rem',
                }}
              >
                Quantix Logisticsin tiimi koostuu ammattilaisista, jotka ovat
                innostuneita muuttamaan ruokalogistiikkaa paremmaksi. Jokainen
                tiimin jäsen tuo oman erikoisosaamisensa logistiikasta,
                teknologiasta, operaatioista ja asiakaspalvelusta. Yhdessä
                varmistamme, että jokainen kuljetus on turvallinen, tehokas ja
                ajoissa perille.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(249,115,22,0.15)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    borderRadius: 10,
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Award size={16} color="#f97316" />
                  <span style={{fontSize: '0.85rem'}}>
                    ISO 22000 -sertifioitu
                  </span>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: 10,
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <TrendingUp size={16} color="#22c55e" />
                  <span style={{fontSize: '0.85rem'}}>99.2% ajoissa</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{maxWidth: 700, margin: '0 auto'}}>
          <h2
            style={{
              color: 'white',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '1rem',
            }}
          >
            Aloita yhteistyö kanssamme
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: '1.05rem',
              marginBottom: '2rem',
            }}
          >
            Liity satojen kauppojen joukkoon ja koe ero reaaliaikaisessa
            ruokalogistiikassa.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register"
              style={{
                padding: '0.9rem 2.25rem',
                borderRadius: 10,
                backgroundColor: 'white',
                color: '#ea580c',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              Aloita ilmaiseksi
            </Link>
            <Link
              to="/pricing"
              style={{
                padding: '0.9rem 2.25rem',
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Katso hinnat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
