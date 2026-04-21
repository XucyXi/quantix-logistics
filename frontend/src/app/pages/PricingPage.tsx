import {useState} from 'react';
import {motion} from 'motion/react';
import {
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import {Link} from 'react-router';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthly: 89,
    yearly: 79,
    color: '#3b82f6',
    badge: null,
    description: 'Pienille kaupoille ja yksittäisille toimipisteille',
    features: [
      {text: 'Enintään 3 kauppaa', included: true},
      {text: 'Päivittäiset tilaukset', included: true},
      {text: 'Perusseuranta', included: true},
      {text: 'Sähköposti-ilmoitukset', included: true},
      {text: 'Mobiilisovellus (kuljettaja)', included: true},
      {text: 'Erityisruokavaliosuodattimet', included: false},
      {text: 'Oma API-rajapinta', included: false},
      {text: 'Prioriteettituki', included: false},
      {text: 'Analyytiikkaraportit', included: false},
      {text: 'Räätälöity ruokalista', included: false},
    ],
    cta: 'Aloita 14 pv ilmaiseksi',
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Building2,
    monthly: 249,
    yearly: 219,
    color: '#f97316',
    badge: 'SUOSITUIN',
    description: 'Kasvavien ketjujen ja keskisuurten toimijoiden ratkaisu',
    features: [
      {text: 'Enintään 25 kauppaa', included: true},
      {text: 'Päivittäiset tilaukset', included: true},
      {text: 'Reaaliaikainen Live-seuranta', included: true},
      {text: 'SMS + sähköposti-ilmoitukset', included: true},
      {text: 'Mobiilisovellus (kuljettaja)', included: true},
      {text: 'Erityisruokavaliosuodattimet', included: true},
      {text: 'Oma API-rajapinta', included: true},
      {text: 'Prioriteettituki', included: false},
      {text: 'Analyytiikkaraportit', included: true},
      {text: 'Räätälöity ruokalista', included: false},
    ],
    cta: 'Aloita 14 pv ilmaiseksi',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Rocket,
    monthly: 0,
    yearly: 0,
    color: '#8b5cf6',
    badge: null,
    description: 'Suurille ketjuille ja valtakunnallisille toimijoille',
    features: [
      {text: 'Rajoittamaton kauppamäärä', included: true},
      {text: 'Päivittäiset tilaukset', included: true},
      {text: 'Reaaliaikainen Live-seuranta', included: true},
      {text: 'Kaikki ilmoituskanavat', included: true},
      {text: 'Mobiilisovellus (kuljettaja)', included: true},
      {text: 'Erityisruokavaliosuodattimet', included: true},
      {text: 'Oma API-rajapinta', included: true},
      {text: 'Omistettu prioriteettituki', included: true},
      {text: 'Kattavat analyytiikkaraportit', included: true},
      {text: 'Täysin räätälöity ruokalista', included: true},
    ],
    cta: 'Ota yhteyttä',
  },
];

const faqs = [
  {
    q: 'Voinko vaihtaa pakettia myöhemmin?',
    a: 'Kyllä! Voit päivittää tai alentaa pakettiasi milloin tahansa. Muutokset astuvat voimaan seuraavan laskutusjakson alusta.',
  },
  {
    q: 'Miten laskutus toimii?',
    a: 'Laskutamme joko kuukausittain tai vuosittain valintasi mukaan. Vuosipaketissa säästät noin 13 % verrattuna kuukausilaskutukseen.',
  },
  {
    q: 'Onko API-rajapinnan käyttö maksullista?',
    a: 'API sisältyy Pro- ja Enterprise-paketteihin ilman lisämaksua. Starter-paketti ei sisällä API-pääsyä.',
  },
  {
    q: 'Kuinka kauan 14 päivän kokeilu sitoo minua?',
    a: 'Ei lainkaan. Kokeilujakso on täysin ilmainen eikä vaadi luottokorttia. Voit peruuttaa milloin tahansa.',
  },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div style={{maxWidth: 700, margin: '0 auto'}}>
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
            HINNOITTELU
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
              fontWeight: 800,
              marginBottom: '1rem',
            }}
          >
            Selkeät hinnat, ei yllätyksiä
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1rem',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            Valitse tarpeisiisi sopiva paketti. Kaikki paketit sisältävät 14
            päivän ilmaisen kokeilujakson.
          </p>

          {/* Billing toggle */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.875rem',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '0.5rem 1rem',
              borderRadius: 40,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                color: !yearly ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: !yearly ? 600 : 400,
              }}
            >
              Kuukausittain
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: yearly ? '#f97316' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'transform 0.25s ease, background 0.25s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: yearly ? 22 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            <span
              style={{
                fontSize: '0.875rem',
                color: yearly ? 'white' : 'rgba(255,255,255,0.5)',
                fontWeight: yearly ? 600 : 400,
              }}
            >
              Vuosittain
              <span
                style={{
                  marginLeft: '0.375rem',
                  backgroundColor: 'rgba(34,197,94,0.2)',
                  color: '#4ade80',
                  padding: '0.1rem 0.5rem',
                  borderRadius: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                -13%
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem'}}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              whileHover={{
                y: -10,
                scale: 1.015,
                boxShadow: `0 18px 45px ${plan.color}30`,
              }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                type: 'spring',
                stiffness: 220,
                damping: 24,
              }}
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: plan.badge
                  ? '0 8px 40px rgba(249,115,22,0.18)'
                  : '0 2px 12px rgba(0,0,0,0.07)',
                border: plan.badge
                  ? `2px solid ${plan.color}`
                  : '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: plan.color,
                    color: 'white',
                    padding: '0.2rem 0.75rem',
                    borderRadius: 20,
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Top color bar */}
              <div style={{height: 4, backgroundColor: plan.color}} />

              <div
                style={{
                  padding: '1.75rem',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${plan.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <plan.icon size={22} color={plan.color} />
                </div>

                <h3
                  style={{
                    color: '#0f2444',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    marginBottom: '0.375rem',
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                  }}
                >
                  {plan.description}
                </p>

                {/* Price */}
                <div style={{marginBottom: '1.5rem'}}>
                  {plan.id === 'enterprise' ? (
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: '#0f2444',
                      }}
                    >
                      Tarjouspyyntö
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.25rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          color: '#0f2444',
                        }}
                      >
                        {yearly ? plan.yearly : plan.monthly}
                      </span>
                      <span style={{color: '#94a3b8', fontSize: '0.9rem'}}>
                        € / kk
                      </span>
                    </div>
                  )}
                  {plan.id !== 'enterprise' && yearly && (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#22c55e',
                        fontWeight: 600,
                        marginTop: '0.25rem',
                      }}
                    >
                      Säästät {((plan.monthly - plan.yearly) * 12).toFixed(0)} €
                      / vuosi
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    flex: 1,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f.text}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        fontSize: '0.875rem',
                        color: f.included ? '#374151' : '#cbd5e1',
                      }}
                    >
                      {f.included ? (
                        <Check
                          size={16}
                          color="#22c55e"
                          style={{flexShrink: 0}}
                        />
                      ) : (
                        <X size={16} color="#cbd5e1" style={{flexShrink: 0}} />
                      )}
                      {f.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={plan.id === 'enterprise' ? '/contact' : '/register'}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = `0 10px 22px ${plan.color}33`;
                    if (!plan.badge) {
                      e.currentTarget.style.backgroundColor = `${plan.color}12`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    if (!plan.badge) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    backgroundColor: plan.badge ? plan.color : 'transparent',
                    color: plan.badge ? 'white' : plan.color,
                    border: `2px solid ${plan.color}`,
                    transition:
                      'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{maxWidth: 720, margin: '4rem auto 0'}}>
          <h2
            style={{
              color: '#0f2444',
              fontWeight: 800,
              fontSize: '1.5rem',
              textAlign: 'center',
              marginBottom: '2rem',
            }}
          >
            Usein kysytyt kysymykset
          </h2>
          <div
            style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}
          >
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    color: '#0f2444',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.22s ease',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <HelpCircle size={16} color="#f97316" />
                    {faq.q}
                  </span>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      color: '#94a3b8',
                      transform: expandedFaq === i ? 'rotate(45deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  >
                    +
                  </span>
                </button>
                {expandedFaq === i && (
                  <div
                    style={{
                      padding: '0 1.25rem 1rem',
                      color: '#64748b',
                      fontSize: '0.875rem',
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise banner */}
        <div
          style={{
            marginTop: '4rem',
            background: 'linear-gradient(135deg, #0f2444, #1e3a5f)',
            borderRadius: 20,
            padding: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <h3
              style={{
                color: 'white',
                fontWeight: 800,
                fontSize: '1.25rem',
                marginBottom: '0.5rem',
              }}
            >
              Tarvitsetko räätälöidyn ratkaisun?
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '0.9rem',
                margin: 0,
              }}
            >
              Olemme valmiita räätälöimään järjestelmän juuri teidän
              tarpeisiinne.
            </p>
          </div>
          <Link
            to="/register"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow =
                '0 12px 24px rgba(249,115,22,0.32)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              borderRadius: 10,
              backgroundColor: '#f97316',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
          >
            Ota yhteyttä
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
