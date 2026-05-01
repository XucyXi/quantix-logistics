import {useState} from 'react';
import {useNavigate, Link} from 'react-router';
import {Shield, Eye, EyeOff, AlertCircle, Truck} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {login} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Yksittäinen kirjautuminen, tarkistetaan tunnukset roolista riippumatta
    const ok = await login(email, password);
    setLoading(false);

    if (ok) {
      // Ohjataan käyttäjä oikeaan paneeliin roolin perusteella
      const saved = localStorage.getItem('quantix_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.role === 'admin') navigate('/admin');
        else if (u.role === 'driver') navigate('/driver');
        else navigate('/');
      } else {
        navigate('/');
      }
    } else {
      setError('Virheelliset tunnukset. Tarkista sähköposti ja salasana.');
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0a1929',
      }}
    >
      {/* Left side – branding */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Decorative circles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: (i + 1) * 200,
              height: (i + 1) * 200,
              borderRadius: '50%',
              border: '1px solid rgba(249,115,22,0.1)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
        <div style={{position: 'relative', textAlign: 'center'}}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 32px rgba(249,115,22,0.35)',
            }}
          >
            <Truck size={40} color="white" />
          </div>
          <h2
            style={{
              color: 'white',
              fontSize: '1.75rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
            }}
          >
            QUANTIX LOGISTICKS
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '1rem',
              lineHeight: 1.7,
              maxWidth: 360,
            }}
          >
            Ruokalogistiikan komentokeskus – kaikki toiminnot yhdessä paikassa.
          </p>

          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            {[
              'Reaaliaikainen reittiseuranta',
              'Kuljettajien hallinta',
              'Tilausraportointi',
              'Kauppaverkoston hallinta',
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: '0.9rem',
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#f97316',
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side – form */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{width: '100%', maxWidth: 420}}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: '2.5rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}
              >
                <Shield size={24} color="#d97706" />
              </div>
              <h1
                style={{
                  color: '#0f2444',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  marginBottom: '0.25rem',
                }}
              >
                Kirjaudu sisään
              </h1>
              <p style={{color: '#64748b', fontSize: '0.875rem', margin: 0}}>
                Kirjaudu sisään tilillesi
              </p>
            </div>

            {/* Demo hint */}
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 10,
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                fontSize: '0.8rem',
                color: '#0369a1',
              }}
            >
              <strong>Demotunnukset:</strong>
              <br />
              Ylläpito: admin@quantix.fi / admin123
              <br />
              Kuljettaja: kuljettaja@quantix.fi / driver123
              <br />
              Asiakas: asiakas@demo.fi / demo123
              <br />
              Yritys: yritys@demo.fi / business123
            </div>

            {error && (
              <div
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
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{marginBottom: '1.25rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Käyttäjätunnus
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="nimi@yritys.fi"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 10,
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem',
                    fontFamily: "'Space Grotesk', sans-serif",
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                  onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
                />
              </div>

              <div style={{marginBottom: '1.75rem'}}>
                <label
                  style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  Salasana
                </label>
                <div style={{position: 'relative'}}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.75rem 0.75rem 1rem',
                      borderRadius: 10,
                      border: '1.5px solid #e2e8f0',
                      fontSize: '0.9rem',
                      fontFamily: "'Space Grotesk', sans-serif",
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#f97316')}
                    onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
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
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: loading ? '#94a3b8' : '#0f2444',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
              </button>
            </form>

            <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
              <Link
                to="/"
                style={{
                  color: '#64748b',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                }}
              >
                ← Takaisin etusivulle
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              backgroundColor: '#fef3c7',
              borderRadius: 10,
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#92400e',
            }}
          >
            <Shield size={14} />
            Tämä sivu on suojattu. Luvattomat kirjautumisyritykset kirjataan
            lokiin.
          </div>
        </div>
      </div>
    </div>
  );
}
