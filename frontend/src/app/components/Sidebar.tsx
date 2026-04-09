import {Link, useLocation} from 'react-router-dom';

const items = [
  {to: '/admin', label: 'Dashboard'},
  {to: '/admin/login', label: 'Kirjautuminen'},
  {to: '/driver', label: 'Kuljettaja'},
  {to: '/store', label: 'Kauppa'},
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      style={{
        width: 260,
        borderRight: '1px solid #e2e8f0',
        background: '#ffffff',
        padding: '1rem',
      }}
    >
      {/* Sivupalkki on vain admin-näkymän oma navigaatio. */}
      <div style={{fontWeight: 700, marginBottom: '1rem', color: '#0f2444'}}>
        Navigaatio
      </div>
      <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        {items.map((item) => {
          // Aktiivinen kohta korostetaan nykyisen URL-polun perusteella.
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              style={{
                textDecoration: 'none',
                color: active ? '#f97316' : '#334155',
                fontWeight: active ? 700 : 500,
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
