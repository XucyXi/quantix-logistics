import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Eye, EyeOff, Truck, CheckCircle, Building2, User} from 'lucide-react';

type AccountType = 'customer' | 'store';

export function RegisterPage() {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>('customer');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    businessId: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const update = (field: string, value: string | boolean) => {
    setForm((f) => ({...f, [field]: value}));
    setErrors((e) => ({...e, [field]: ''}));
  };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!accountType) e.accountType = 'Valitse tili tyyppi';
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Etunimi vaaditaan';
    if (!form.lastName) e.lastName = 'Sukunimi vaaditaan';
    if (!form.email || !form.email.includes('@'))
      e.email = 'Kelvollinen sähköposti vaaditaan';
    if (accountType === 'store' && !form.company)
      e.company = 'Yrityksen nimi vaaditaan';
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (form.password.length < 8) e.password = 'Vähintään 8 merkkiä';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Salasanat eivät täsmää';
    if (!form.acceptTerms) e.acceptTerms = 'Hyväksy käyttöehdot';
    return e;
  };

  const handleNext = () => {
    const e = step === 1 ? validateStep1() : step === 2 ? validateStep2() : {};
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep3();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  const inputStyle = (hasError?: boolean) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: 10,
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    fontSize: '0.9rem',
    fontFamily: "'Space Grotesk', sans-serif",
    outline: 'none',
    backgroundColor: hasError ? '#fef2f2' : 'white',
    boxSizing: 'border-box' as const,
  });

  if (done) {
    return (
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: '3rem 2.5rem',
            textAlign: 'center',
            maxWidth: 480,
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={36} color="#16a34a" />
          </div>
          <h2
            style={{
              color: '#0f2444',
              fontWeight: 800,
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Rekisteröinti onnistui!
          </h2>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            Tervetuloa Quantix Logisticks -palveluun, {form.firstName}!
            Lähetimme vahvistusviestin sähköpostiisi{' '}
            <strong>{form.email}</strong>.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.875rem 2rem',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#f97316',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Kirjaudu sisään
          </button>
        </div>
      </div>
    );
  }

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
      <div style={{width: '100%', maxWidth: 520}}>
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
            border: '1px solid #f1f5f9',
          }}
        >
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Truck size={24} color="white" />
            </div>
            <h1
              style={{
                color: '#0f2444',
                fontWeight: 800,
                fontSize: '1.4rem',
                marginBottom: '0.25rem',
              }}
            >
              Luo tili
            </h1>
            <p style={{color: '#64748b', fontSize: '0.875rem', margin: 0}}>
              Quantix Logisticks
            </p>
          </div>

          {/* Step indicators */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '2rem',
            }}
          >
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{display: 'flex', alignItems: 'center', flex: 1}}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: step >= s ? '#f97316' : '#e2e8f0',
                    color: step >= s ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: step > s ? '#f97316' : '#e2e8f0',
                      transition: 'background 0.2s',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Account type */}
          {step === 1 && (
            <div>
              <h3
                style={{
                  color: '#0f2444',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Valitse tilityyppi
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {[
                  {
                    type: 'customer' as AccountType,
                    icon: User,
                    title: 'Yksityisasiakas',
                    desc: 'Tilaa lounasboxeja ja seuraa toimituksia',
                  },
                  {
                    type: 'store' as AccountType,
                    icon: Building2,
                    title: 'Kauppias / Yritys',
                    desc: 'Hallinnoi kaupan tilauksia ja vastaanota toimituksia',
                  },
                ].map(({type, icon: Icon, title, desc}) => (
                  <button
                    key={type}
                    onClick={() => setAccountType(type)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.25rem',
                      borderRadius: 12,
                      border: `2px solid ${accountType === type ? '#f97316' : '#e2e8f0'}`,
                      backgroundColor:
                        accountType === type ? '#fff7ed' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: "'Space Grotesk', sans-serif",
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor:
                          accountType === type ? '#fed7aa' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        size={22}
                        color={accountType === type ? '#f97316' : '#94a3b8'}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f2444',
                          fontSize: '0.95rem',
                        }}
                      >
                        {title}
                      </div>
                      <div style={{color: '#64748b', fontSize: '0.8rem'}}>
                        {desc}
                      </div>
                    </div>
                    {accountType === type && (
                      <CheckCircle
                        size={18}
                        color="#f97316"
                        style={{marginLeft: 'auto'}}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal info */}
          {step === 2 && (
            <div>
              <h3
                style={{
                  color: '#0f2444',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Henkilötiedot
              </h3>
              <div
                className="grid grid-cols-2 gap-4"
                style={{marginBottom: '1rem'}}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#374151',
                      fontWeight: 600,
                      marginBottom: '0.4rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    Etunimi *
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => update('firstName', e.target.value)}
                    placeholder="Matti"
                    style={inputStyle(!!errors.firstName)}
                  />
                  {errors.firstName && (
                    <p
                      style={{
                        color: '#dc2626',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      color: '#374151',
                      fontWeight: 600,
                      marginBottom: '0.4rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    Sukunimi *
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => update('lastName', e.target.value)}
                    placeholder="Virtanen"
                    style={inputStyle(!!errors.lastName)}
                  />
                  {errors.lastName && (
                    <p
                      style={{
                        color: '#dc2626',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Sähköposti *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="sinun@email.fi"
                  style={inputStyle(!!errors.email)}
                />
                {errors.email && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>
              <div style={{marginBottom: '1rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Puhelin
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  placeholder="+358 40 123 4567"
                  style={inputStyle()}
                />
              </div>
              {accountType === 'store' && (
                <>
                  <div style={{marginBottom: '1rem'}}>
                    <label
                      style={{
                        display: 'block',
                        color: '#374151',
                        fontWeight: 600,
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      Yrityksen nimi *
                    </label>
                    <input
                      value={form.company}
                      onChange={(e) => update('company', e.target.value)}
                      placeholder="K-Market Tampere"
                      style={inputStyle(!!errors.company)}
                    />
                    {errors.company && (
                      <p
                        style={{
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                        }}
                      >
                        {errors.company}
                      </p>
                    )}
                  </div>
                  <div style={{marginBottom: '1rem'}}>
                    <label
                      style={{
                        display: 'block',
                        color: '#374151',
                        fontWeight: 600,
                        marginBottom: '0.4rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      Y-tunnus
                    </label>
                    <input
                      value={form.businessId}
                      onChange={(e) => update('businessId', e.target.value)}
                      placeholder="1234567-8"
                      style={inputStyle()}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h3
                style={{
                  color: '#0f2444',
                  fontWeight: 700,
                  marginBottom: '1.25rem',
                  fontSize: '1rem',
                }}
              >
                Luo salasana
              </h3>
              <div style={{marginBottom: '1rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Salasana *
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Vähintään 8 merkkiä"
                    style={{
                      ...inputStyle(!!errors.password),
                      paddingRight: '2.75rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>
              <div style={{marginBottom: '1.25rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                    fontSize: '0.85rem',
                  }}
                >
                  Vahvista salasana *
                </label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => update('confirmPassword', e.target.value)}
                  placeholder="Toista salasana"
                  style={inputStyle(!!errors.confirmPassword)}
                />
                {errors.confirmPassword && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <div style={{marginBottom: '1.5rem'}}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={(e) => update('acceptTerms', e.target.checked)}
                    style={{marginTop: 2, accentColor: '#f97316'}}
                  />
                  <span style={{color: '#374151', fontSize: '0.85rem'}}>
                    Hyväksyn{' '}
                    <a
                      href="#"
                      style={{color: '#f97316', textDecoration: 'none'}}
                    >
                      käyttöehdot
                    </a>{' '}
                    ja{' '}
                    <a
                      href="#"
                      style={{color: '#f97316', textDecoration: 'none'}}
                    >
                      tietosuojakäytännön
                    </a>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p
                    style={{
                      color: '#dc2626',
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {errors.acceptTerms}
                  </p>
                )}
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
                }}
              >
                {loading ? 'Luodaan tiliä...' : 'Luo tili'}
              </button>
            </form>
          )}

          {/* Navigation */}
          {step < 3 && (
            <button
              onClick={handleNext}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: 10,
                border: 'none',
                backgroundColor: '#f97316',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: '1.5rem',
              }}
            >
              Jatka →
            </button>
          )}
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                backgroundColor: 'transparent',
                color: '#64748b',
                fontWeight: 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                marginTop: '0.5rem',
              }}
            >
              ← Takaisin
            </button>
          )}

          <div style={{textAlign: 'center', marginTop: '1.25rem'}}>
            <span style={{color: '#64748b', fontSize: '0.875rem'}}>
              Onko sinulla jo tili?{' '}
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
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
