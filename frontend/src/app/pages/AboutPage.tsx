import {Link} from 'react-router-dom';
import teamImage from '../../../Meistä.png';

export function AboutPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '4rem 1.5rem 5rem',
        background:
          'radial-gradient(circle at top left, rgba(15, 23, 42, 0.08), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      <div style={{maxWidth: 1180, margin: '0 auto'}}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '2rem',
            padding: '1.5rem',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.8rem',
                borderRadius: '9999px',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                marginBottom: '1rem',
              }}
            >
              Demo-sivu
            </div>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: '#0f172a',
                marginBottom: '1rem',
              }}
            >
              Meistä
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.8,
                color: '#334155',
                maxWidth: 620,
                marginBottom: '1.5rem',
              }}
            >
              Tämä sivu on vielä demo-versio. Palataan tähän myöhemmin ja
              kirjoitetaan tänne varsinainen tarina, arvot ja tarkempi esittely
              tiimistä.
            </p>
            <p
              style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: '#475569',
                maxWidth: 600,
                marginBottom: '2rem',
              }}
            >
              Sillä välin sivu näyttää jo valmiilta ja toimii linkkipisteenä
              etusivulle.
            </p>
            <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.95rem 1.3rem',
                  borderRadius: '9999px',
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.2)',
                }}
              >
                Takaisin etusivulle
              </Link>
            </div>
          </div>

          <div style={{position: 'relative'}}>
            <div
              style={{
                position: 'absolute',
                inset: '-14px -14px auto auto',
                width: '120px',
                height: '120px',
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle, rgba(15, 23, 42, 0.18), transparent 70%)',
                filter: 'blur(10px)',
              }}
            />
            <div
              style={{
                borderRadius: '1.75rem',
                overflow: 'hidden',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                backgroundColor: '#0f172a',
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
              }}
            >
              <img
                src={teamImage}
                alt="Tiimin henkilökuva varastohallissa"
                style={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem 1.2rem',
                borderRadius: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.86)',
                border: '1px solid rgba(148, 163, 184, 0.18)',
              }}
            >
              <div
                style={{fontSize: '0.9rem', fontWeight: 700, color: '#0f172a'}}
              >
                Lisätään myöhemmin
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  marginTop: '0.35rem',
                }}
              >
                Tänne voi myöhemmin tulla tiimin esittely, arvot ja tarkempi
                yritystarina.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
