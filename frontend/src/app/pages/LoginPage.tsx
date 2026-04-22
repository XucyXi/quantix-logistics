import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {Eye, EyeOff, Truck, AlertCircle} from 'lucide-react';
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
    await new Promise((r) => setTimeout(r, 700));
    const ok = login(email, password);
    setLoading(false);
    if (ok) {
      navigate('/menu');
    } else {
      setError(
        'Sähköposti tai salasana on väärin. Kokeile: asiakas@demo.fi / demo123'
      );
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
      <div style={{width: '100%', maxWidth: 440}}>
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
          {/* Logo */}
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
                fontSize: '1.4rem',
                marginBottom: '0.25rem',
              }}
            >
              Kirjaudu sisään
            </h1>
            <p style={{color: '#64748b', fontSize: '0.875rem', margin: 0}}>
              Quantix Logisticks asiakasportaali
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
            <strong>Demo-tunnukset:</strong> asiakas@demo.fi / demo123
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
                Sähköposti
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

            <div style={{marginBottom: '1.5rem'}}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <label
                  style={{
                    color: '#374151',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Salasana
                </label>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#f97316',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Unohtuiko salasana?
                </Link>
              </div>
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
                    transition: 'border 0.2s',
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
                    display: 'flex',
                    alignItems: 'center',
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
                backgroundColor: loading ? '#94a3b8' : '#f97316',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Kirjaudutaan...' : 'Kirjaudu sisään'}
            </button>
          </form>

          <div style={{textAlign: 'center', marginTop: '1.5rem'}}>
            <span style={{color: '#64748b', fontSize: '0.875rem'}}>
              Ei vielä tiliä?{' '}
              <Link
                to="/register"
                style={{
                  color: '#f97316',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Rekisteröidy ilmaiseksi
              </Link>
            </span>
          </div>

          <div
            style={{
              borderTop: '1px solid #f1f5f9',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
            }}
          >
            <p
              style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
              }}
            >
              Oletko henkilöstöä?
            </p>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <Link
                to="/admin/login"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Ylläpito
              </Link>
              <Link
                to="/driver"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Kuljettaja
              </Link>
              <Link
                to="/store"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Kauppa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
