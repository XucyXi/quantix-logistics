import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {
  Truck,
  Package,
  Store,
  ArrowRight,
  CheckCircle,
  BarChart2,
  Shield,
  Star,
  ChevronRight,
  Zap,
} from 'lucide-react';

// Ulkoinen kuva pienentaa bundlea ja mahdollistaa nopean visuaalisen vaihdon ilman deployta.
const heroImg =
  'https://images.unsplash.com/photo-1641290451977-a427586acf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwbG9naXN0aWNzJTIwdHJ1Y2slMjBkZWxpdmVyeSUyMHdhcmVob3VzZXxlbnwxfHx8fDE3NzQzNDA3Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080';

// Luvut on erotettu vakioksi, jotta markkinointisisalto paivittyy yhdesta paikasta.
const stats = [
  {value: '340+', label: 'Kauppaa palveltu'},
  {value: '12 000', label: 'Toimitusta / viikko'},
  {value: '99.2%', label: 'Ajallaan-prosentti'},
  {value: '5', label: 'Toimintavuotta'},
];

// Ominaisuudet kuvataan datana, jotta jarjestys, copy ja ikonit pysyvat synkassa ilman JSX-toistoa.
const features = [
  {
    icon: Zap,
    title: 'Live-seuranta',
    desc: 'Reaaliaikainen seuranta jokaiselle ruokarullakolle jakelukeskuksesta kauppaan asti.',
    color: '#f97316',
  },
  {
    icon: Package,
    title: 'Alykäs pakkaus',
    desc: 'Jakelukeskus pakkaa rullakot optimaalisesti boksikohtaisten tilausten mukaan.',
    color: '#3b82f6',
  },
  {
    icon: Truck,
    title: 'Reittioptimointi',
    desc: 'Automaattinen reittioptimointi vahentaa kuljetuskustannuksia ja parantaa tehokkuutta.',
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
    desc: 'Analytiikka kaikesta toimitusketjusta - myynneista reklamaatioihin.',
    color: '#ec4899',
  },
  {
    icon: Shield,
    title: 'Elintarviketurvallisuus',
    desc: 'Taysi jaljitettavyys ja kylmaketjun valvonta HACCP-standardien mukaisesti.',
    color: '#f59e0b',
  },
];

// Roolikortit pidetaan datassa, koska kohdepolut muuttuvat helposti pilotoinnin aikana.
const roles = [
  {
    icon: BarChart2,
    role: 'Ajokeskus',
    desc: 'Hallinnoi reitteja, pakkausta ja kuljettajia yhdesta paikasta.',
    to: '/admin/login',
    color: '#0f2444',
    cta: 'Kirjaudu yllapitoon',
  },
  {
    icon: Truck,
    role: 'Kuljettaja',
    desc: 'Nae paivan reitit, toimitukset ja paivita tilanne liikkeella ollessa.',
    to: '/driver',
    color: '#1e3a5f',
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

// Referenssit nostavat luottamusta ennen CTA-vaihetta, erityisesti ensikertalaisille.
const testimonials = [
  {
    name: 'Mirka Korhonen',
    company: 'K-Market Jarvenpaa',
    text: 'Quantix on muuttanut tavan, jolla seuraamme saapuvia toimituksia. Ei enaa yllatysten odottelua - tiedamme tarkalleen milloin rekka saapuu.',
    rating: 5,
  },
  {
    name: 'Petri Salminen',
    company: 'S-Market Espoo',
    text: 'Tuotetietojen hallinta on nyt niin paljon helpompaa. Kaupan henkilokunta tietaa tarkalleen mita on tulossa ja milloin.',
    rating: 5,
  },
  {
    name: 'Anne Virtanen',
    company: 'Lidl Tampere',
    text: 'Toimitusaikataulu pitaa yllattavan hyvin. Quantixiin siirtymisen jalkeen hukkaprosenttimme putosi merkittavasti.',
    rating: 5,
  },
];

export function LandingPage() {
  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Kerrosrakenne valittiin luettavuuden takia: kuva tuo tunnelman, mutta kontrasti pysyy turvallisena eri naytoilla. */}
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
              // Liike on hillitty, jotta ensivaikutelma tuntuu elavalta mutta ei hidasta CTA-paatosta.
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
                  Live-seuranta kaytossä
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
                Quantix Logistics yhdistaa jakelukeskuksen, kuljettajat ja
                kaupat saumattomaksi digitaaliseksi ketjuksi - reaaliaikaisesti,
                lapinakyvasti ja tehokkaasti.
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
              // Viiveella varmistetaan, etta katse osuu ensin arvolupaukseen eika hajautu numeroihin liian aikaisin.
              initial={{opacity: 0, x: 40}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.7, delay: 0.2}}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {/* Dataohjaus estaa ristiriidat desktop- ja mobiilinakymien valilla, kun samat luvut kaytetaan molemmissa. */}
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

      {/* Mobiilissa luvut erotetaan omaksi osioksi, jotta hero ei paisu ja CTA pysyy heti peukalon ulottuvilla. */}
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

      {/* Tasalevyiset kortit pitavat vertailun reiluna, jolloin yksittainen ominaisuus ei vie suhteetonta huomiota. */}
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
              Kaikki mita tarvitset tehokkaaseen ruokalogistiikkaan
            </h2>
            <p
              style={{
                color: '#64748b',
                fontSize: '1rem',
                maxWidth: 580,
                margin: '0 auto',
              }}
            >
              Quantix yhdistaa kaikki toimitusketjun osat yhteen alykkaaseen
              jarjestelmaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                // Once=true estaa jatkuvan uudelleenanimaation, joka voi tuntua nykivalta pitkillä sivuilla.
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

      {/* Vaiheistus puretaan kolmeen osaan, koska liika yksityiskohtaisuus landingissa heikentaa ymmarrettavyytta. */}
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
              Kolme vaihetta taydelliseen toimitukseen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Jakelukeskus pakkaa',
                desc: 'Tilaukset saapuvat jarjestelmaan, jakelukeskus pakkaa rullakot ruokabokseineen ja kirjaa ne jarjestelmaan.',
              },
              {
                step: '02',
                icon: Truck,
                title: 'Rekka toimittaa',
                desc: 'Kuljettaja saa optimoidun reitin, merkitsee toimitukset tehdyksi ja jarjestelma paivittyy reaaliajassa.',
              },
              {
                step: '03',
                icon: Store,
                title: 'Kauppa vastaanottaa',
                desc: 'Kauppa seuraa tilauksen saapumista, vastaanottaa rullakot ja kuittaa toimituksen jarjestelmassa.',
              },
            ].map((item) => (
              <div key={item.step} style={{textAlign: 'center'}}>
                <div
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
                  }}
                >
                  <item.icon size={28} color="#f97316" />
                  <div
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
                    {item.step}
                  </div>
                </div>
                <h3
                  style={{
                    color: 'white',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    fontSize: '1.1rem',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roolijaottelu rajaa valinnan nopeasti oikeaan polkuun ja vahentaa vaarin kirjautumisen riskiä. */}
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
              Kolme erillista kayttajaroolia, kukin omalla raataloidylla
              nakymallaan.
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

      {/* Sosiaalinen todiste sijoitetaan loppuun, koska epavarma kayttaja paattaa usein vasta juuri ennen CTA:ta. */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 16,
                  padding: '1.75rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '0.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  {Array.from({length: t.rating}).map((_, i) => (
                    <Star key={i} size={16} color="#f97316" fill="#f97316" />
                  ))}
                </div>
                <p
                  style={{
                    color: '#374151',
                    fontSize: '0.9rem',
                    lineHeight: 1.7,
                    marginBottom: '1.25rem',
                  }}
                >
                  "{t.text}"
                </p>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#0f2444',
                      fontSize: '0.9rem',
                    }}
                  >
                    {t.name}
                  </div>
                  <div style={{color: '#64748b', fontSize: '0.8rem'}}>
                    {t.company}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lopussa on vain kaksi valintaa, jotta paatoksenteon kitka pysyy pienenä eika huomio hajoa. */}
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
          </div>
        </div>
      </section>
    </div>
  );
}
