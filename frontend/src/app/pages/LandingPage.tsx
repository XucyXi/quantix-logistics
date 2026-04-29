import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import testimonialVideo from '../../assets/videos/Ravintolaomistajan_suositus_kuljetuspalvelulle.mp4';
import {
  Truck,
  Package,
  Store,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Zap,
  Mail,
  Phone,
  MapPin,
  Send,
} from 'lucide-react';

// Rivikohtainen lisaselitys loytyy tiedostosta: src/app/pages/LandingPage.comments.md

const heroImg =
  'https://images.unsplash.com/photo-1641290451977-a427586acf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbG9naXN0aWNzJTIwdHJ1Y2slMjBkZWxpdmVyeSUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzQzNDA3Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080';
const distImg =
  'https://images.unsplash.com/photo-1766793110924-98e05b48eadc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBkaXN0cmlidXRpb24lMjBjZW50ZXIlMjBsb2dpc3RpY3N8ZW58MXx8fHwxNzc0MzQwNzc4fDA&ixlib=rb-4.1.0&q=80&w=1080';

// Hero-osan KPI-luvut: desktopissa kortteina, mobiilissa omana rivinään.
const stats = [
  {value: '340+', label: 'Kauppaa palveltu'},
  {value: '12 000', label: 'Toimitusta / viikko'},
  {value: '99.2%', label: 'Ajallaan-prosentti'},
  {value: '5', label: 'Toimintavuotta'},
];

// Ominaisuuskortit: icon + teksti + korostusväri, renderöidään features-gridiin.
const features = [
  {
    icon: Zap,
    title: 'Live-seuranta',
    desc: 'Reaaliaikainen seuranta jokaiselle ruokarullakolle jakelukeskuksesta kauppaan asti.',
    color: '#f97316',
  },
  {
    icon: Package,
    title: 'Älykäs pakkaus',
    desc: 'Jakelukeskus pakkaa rullakot optimaalisesti boksikohtaisten tilausten mukaan.',
    color: '#3b82f6',
  },
  {
    icon: Truck,
    title: 'Reittioptimointi',
    desc: 'Automaattinen reittioptimointi vähentää kuljetuskustannuksia ja parantaa tehokkuutta.',
    color: '#8b5cf6',
  },
  {
    icon: Store,
    title: 'Kaupan portaali',
    desc: 'Kaupat seuraavat tilauksiaan, vastaanottavat toimitukset ja hallinnoivat valikoimaa.',
    color: '#22c55e',
  },
  {
    icon: BarChart2,
    title: 'Kattavat raportit',
    desc: 'Analytiikka kaikesta toimitusketjusta – myynneistä reklamaatioihin.',
    color: '#ec4899',
  },
  {
    icon: Shield,
    title: 'Elintarviketurvallisuus',
    desc: 'Täysi jäljitettävyys ja kylmäketjun valvonta HACCP-standardien mukaisesti.',
    color: '#f59e0b',
  },
];

// Roolikortit ja niiden CTA-linkit roolikohtaisiin näkymiin.
const roles = [
  {
    icon: BarChart2,
    role: 'Ajokeskus',
    desc: 'Hallinnoi reittejä, pakkausta ja kuljettajia yhdestä paikasta.',
    to: '/admin/login',
    color: '#0f2444',
    cta: 'Kirjaudu ylläpitoon',
  },
  {
    icon: Truck,
    role: 'Kuljettaja',
    desc: 'Näe päivän reitit, toimitukset ja päivitä tilanne liikkeellä ollessa.',
    to: '/driver',
    color: '#17324f',
    cta: 'Kuljettajan portaali',
  },
  {
    icon: Store,
    role: 'Kauppa',
    desc: 'Seuraa saapuvia toimituksia ja hallinnoi tilauksia helposti.',
    to: '/store',
    color: '#0f2444',
    cta: 'Kaupan portaali',
  },
];

// Asiakastiedot säilytetään edelleen datassa mahdollista laajennusta varten.
const testimonials = [
  {
    name: 'Jaakko Koskinen',
    company: 'Viiden tähden ravintola Helsinki',
    text: 'Quantix on muuttanut tavan, jolla seuraamme saapuvia toimituksia. Ei enää yllätysten odottelua – tiedämme tarkalleen milloin rekka saapuu.',
    rating: 5,
  },
  {
    name: 'Petri Salminen',
    company: 'S-Market Espoo',
    text: 'Tuotetietojen hallinta on nyt niin paljon helpompaa. Kaupan henkilökunta tietää tarkalleen mitä on tulossa ja milloin.',
    rating: 5,
  },
  {
    name: 'Anne Virtanen',
    company: 'Lidl Tampere',
    text: 'Toimitusaikataulu pitää yllättävän hyvin. Quantixiin siirtymisen jälkeen hukkaprosenttimme putosi merkittävästi.',
    rating: 5,
  },
];

// Yhteinen tyyli lomakkeen kentille
const inputStyle = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  backgroundColor: 'white',
  fontSize: '0.95rem',
  color: '#334155',
  fontFamily: "'Space Grotesk', sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s',
};

export function LandingPage() {
  // now-tila päivittyy sekunnin välein, jotta hero-badgen kello käy reaaliajassa.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Muotoillaan päivä, viikonpäivä ja aika erikseen, jotta niitä voi yhdistellä UI:ssa vapaasti.
  const liveDate = now.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const liveWeekday = now.toLocaleDateString('fi-FI', {
    weekday: 'long',
  });

  const liveTime = now.toLocaleTimeString('fi-FI', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Hero */}
      <section
        style={{
          position: 'relative',
          minHeight: '88vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundColor: '#0a1929',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${heroImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, #0a1929 0%, rgba(10,25,41,0.85) 60%, rgba(15,36,68,0.7) 100%)',
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
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#f97316',
                  }}
                />
                <span
                  style={{
                    color: '#f97316',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Live-seuranta käytössä
                </span>
                <span
                  style={{
                    width: 1,
                    height: 14,
                    backgroundColor: 'rgba(249,115,22,0.35)',
                  }}
                />
                <span
                  style={{
                    color: 'rgba(255,255,255,0.82)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                  }}
                >
                  {liveWeekday} {liveDate} {liveTime}
                </span>
              </div>

              <h1
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  marginBottom: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Ruokalogistiikka{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg, #f97316, #fb923c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  uudella tasolla
                </span>
              </h1>

              <p
                style={{
                  color: 'rgba(255,255,255,0.72)',
                  fontSize: '1.1rem',
                  lineHeight: 1.75,
                  marginBottom: '2rem',
                  maxWidth: 520,
                }}
              >
                Quantix Logistics yhdistää jakelukeskuksen, kuljettajat ja
                kaupat saumattomaksi digitaaliseksi ketjuksi – reaaliaikaisesti,
                läpinäkyvästi ja tehokkaasti.
              </p>

              <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
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
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
                  }}
                >
                  Aloita ilmaiseksi
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
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'white',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.2s',
                  }}
                >
                  Katso tuotteet
                </Link>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '2.5rem',
                }}
              >
                {['HACCP-sertifioitu', 'ISO 22000', 'GDPR-yhteensopiva'].map(
                  (tag) => (
                    <div
                      key={tag}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: '0.78rem',
                      }}
                    >
                      <CheckCircle size={13} color="#22c55e" />
                      {tag}
                    </div>
                  )
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{opacity: 0, x: 40}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.7, delay: 0.2}}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    padding: '1.5rem',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 800,
                      color: i % 2 === 0 ? '#f97316' : '#60a5fa',
                      lineHeight: 1,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.85rem',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: 'linear-gradient(to top, #f8fafc, transparent)',
          }}
        />
      </section>

      {/* Stats row (mobile) */}
      <section
        style={{backgroundColor: '#f8fafc', padding: '2rem 1.5rem'}}
        className="lg:hidden"
      >
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  padding: '1.25rem',
                  textAlign: 'center',
                  boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#f97316',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{color: '#64748b', fontSize: '0.8rem'}}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
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
              OMINAISUUDET
            </div>
            <h2
              style={{
                color: '#0f2444',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '1rem',
              }}
            >
              Kaikki mitä tarvitset tehokkaaseen ruokalogistiikkaan
            </h2>
            <p
              style={{
                color: '#64748b',
                fontSize: '1rem',
                maxWidth: 580,
                margin: '0 auto',
              }}
            >
              Quantix yhdistää kaikki toimitusketjun osat yhteen älykkääseen
              järjestelmään.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: i * 0.08}}
                viewport={{once: true}}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: '1.75rem',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                whileHover={{y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.1)'}}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: `${f.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <f.icon size={22} color={f.color} />
                </div>
                <h3
                  style={{
                    color: '#0f2444',
                    marginBottom: '0.625rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
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
              MITEN SE TOIMII
            </div>
            <h2
              style={{
                color: 'white',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '1rem',
              }}
            >
              Kolme vaihetta täydelliseen toimitukseen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Jakelukeskus pakkaa',
                desc: 'Tilaukset saapuvat järjestelmään, jakelukeskus pakkaa rullakot ruokabokseineen ja kirjaa ne järjestelmään.',
              },
              {
                step: '02',
                icon: Truck,
                title: 'Rekka toimittaa',
                desc: 'Kuljettaja saa optimoidun reitin, merkitsee toimitukset tehdyksi ja järjestelmä päivittyy reaaliajassa.',
              },
              {
                step: '03',
                icon: Store,
                title: 'Kauppa vastaanottaa',
                desc: 'Kauppa seuraa tilauksen saapumista, vastaanottaa rullakot ja kuittaa toimituksen järjestelmässä.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{opacity: 0, y: 40}}
                whileInView={{opacity: 1, y: 0}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
                viewport={{once: true}}
                style={{textAlign: 'center'}}
              >
                <motion.div
                  initial={{scale: 0}}
                  whileInView={{scale: 1}}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.3 + 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                  }}
                  viewport={{once: true}}
                  whileHover={{scale: 1.1}}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(249,115,22,0.15)',
                    border: '2px solid rgba(249,115,22,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <item.icon size={28} color="#f97316" />
                  <motion.div
                    initial={{scale: 0, rotate: -180}}
                    whileInView={{scale: 1, rotate: 0}}
                    transition={{
                      duration: 0.6,
                      delay: i * 0.3 + 0.4,
                      type: 'spring',
                      stiffness: 200,
                    }}
                    viewport={{once: true}}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#f97316',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 0 0 rgba(249,115,22,0.4)',
                          '0 0 0 10px rgba(249,115,22,0)',
                          '0 0 0 0 rgba(249,115,22,0)',
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        delay: i * 0.3 + 0.8,
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                      }}
                    />
                    {item.step}
                  </motion.div>
                </motion.div>
                <motion.h3
                  initial={{opacity: 0}}
                  whileInView={{opacity: 1}}
                  transition={{duration: 0.5, delay: i * 0.3 + 0.5}}
                  viewport={{once: true}}
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    fontSize: '1.1rem',
                  }}
                >
                  {item.title}
                </motion.h3>
                <motion.p
                  initial={{opacity: 0}}
                  whileInView={{opacity: 1}}
                  transition={{duration: 0.5, delay: i * 0.3 + 0.6}}
                  viewport={{once: true}}
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section style={{backgroundColor: '#f8fafc', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '3rem'}}>
            <h2
              style={{
                color: '#0f2444',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 800,
              }}
            >
              Portaalit jokaiselle roolille
            </h2>
            <p style={{color: '#64748b', marginTop: '0.75rem'}}>
              Kolme erillistä käyttäjäroolia, kukin omalla räätälöidyllä
              näkymällään.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((r) => (
              <div
                key={r.role}
                style={{
                  backgroundColor: r.color,
                  borderRadius: 20,
                  padding: '2rem',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: 'rgba(249,115,22,0.2)',
                    border: '1px solid rgba(249,115,22,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <r.icon size={24} color="#f97316" />
                </div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  {r.role}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.9rem',
                    lineHeight: 1.65,
                    flex: 1,
                  }}
                >
                  {r.desc}
                </p>
                <Link
                  to={r.to}
                  style={{
                    marginTop: '1.5rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.25rem',
                    borderRadius: 8,
                    backgroundColor: 'rgba(249,115,22,0.2)',
                    border: '1px solid rgba(249,115,22,0.4)',
                    color: '#fb923c',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    alignSelf: 'flex-start',
                  }}
                >
                  {r.cta}
                  <ChevronRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{backgroundColor: 'white', padding: '5rem 1.5rem'}}>
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{textAlign: 'center', marginBottom: '3rem'}}>
            <h2
              style={{
                color: '#0f2444',
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 800,
              }}
            >
              Asiakkaiden kokemuksia
            </h2>
          </div>

          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 18,
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              maxWidth: 920,
              margin: '0 auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                marginBottom: '1rem',
              }}
            >
              {Array.from({length: testimonials[0].rating}).map((_, i) => (
                <Star key={i} size={16} color="#f97316" fill="#f97316" />
              ))}
            </div>

            <video
              controls
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                borderRadius: 14,
                marginBottom: '1.25rem',
                backgroundColor: '#000000',
              }}
            >
              <source src={testimonialVideo} type="video/mp4" />
              Selaimesi ei tue videotoistoa.
            </video>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  color: '#0f2444',
                  fontSize: '0.95rem',
                }}
              >
                {testimonials[0].name}
              </div>
              <div style={{color: '#64748b', fontSize: '0.85rem'}}>
                {testimonials[0].company}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ota yhteyttä */}
      <section
        style={{
          backgroundColor: 'white',
          padding: '5rem 1.5rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Vasen puoli: Yhteystiedot */}
            <div>
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
                OTA YHTEYTTÄ
              </div>
              <h2
                style={{
                  color: '#0f2444',
                  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                  fontWeight: 800,
                  marginBottom: '1rem',
                }}
              >
                Kysyttävää? Olemme täällä auttamassa.
              </h2>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                  marginBottom: '2.5rem',
                }}
              >
                Haluatko kuulla lisää siitä, miten Quantix voi tehostaa
                yrityksesi ruokalogistiikkaa? Jätä viesti, niin asiantuntijamme
                on sinuun yhteydessä.
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                {[
                  {icon: Mail, title: 'Sähköposti', value: 'myynti@quantix.fi'},
                  {icon: Phone, title: 'Puhelin', value: '+358 10 123 4567'},
                  {
                    icon: MapPin,
                    title: 'Toimisto',
                    value: 'Logistiikkakuja 1, 00980 Helsinki',
                  },
                ].map((info) => (
                  <div
                    key={info.title}
                    style={{display: 'flex', alignItems: 'center', gap: '1rem'}}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <info.icon size={20} color="#f97316" />
                    </div>
                    <div>
                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {info.title}
                      </div>
                      <div style={{color: '#0f2444', fontWeight: 700}}>
                        {info.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oikea puoli: Lomake */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 20,
                padding: '2.5rem',
                border: '1px solid #e2e8f0',
              }}
            >
              <form
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f2444',
                      }}
                    >
                      Etunimi
                    </label>
                    <input type="text" placeholder="Matti" style={inputStyle} />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f2444',
                      }}
                    >
                      Sukunimi
                    </label>
                    <input
                      type="text"
                      placeholder="Meikäläinen"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f2444',
                    }}
                  >
                    Sähköposti
                  </label>
                  <input
                    type="email"
                    placeholder="matti.meikalainen@yritys.fi"
                    style={inputStyle}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f2444',
                    }}
                  >
                    Viesti
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Miten voimme auttaa?"
                    style={{...inputStyle, resize: 'vertical'}}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderRadius: 10,
                    backgroundColor: '#f97316',
                    color: 'white',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '1rem',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = '#ea580c')
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = '#f97316')
                  }
                >
                  Lähetä viesti
                  <Send size={18} />
                </button>
              </form>
            </div>
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
            Valmis aloittamaan?
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
            <Link
              to="/meista"
              style={{
                padding: '0.9rem 2.25rem',
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
              }}
            >
              Meistä
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
