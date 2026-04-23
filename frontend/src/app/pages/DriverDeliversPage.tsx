import {useState} from 'react';
import {motion} from 'motion/react';
import {Package, CheckCircle, Clock, MapPin, Filter} from 'lucide-react';

const allDeliveries = [
  {
    id: 'D-001',
    store: 'K-Market Töölö',
    address: 'Runeberginkatu 22',
    date: '2026-04-22',
    boxes: 24,
    status: 'done',
  },
  {
    id: 'D-002',
    store: 'S-Market Kallio',
    address: 'Fleminginkatu 18',
    date: '2026-04-22',
    boxes: 36,
    status: 'done',
  },
  {
    id: 'D-003',
    store: 'Lidl Hakaniemi',
    address: 'Hämeentie 12',
    date: '2026-04-22',
    boxes: 48,
    status: 'active',
  },
  {
    id: 'D-004',
    store: 'K-Market Arabianranta',
    address: 'Arabiankatu 12',
    date: '2026-04-22',
    boxes: 18,
    status: 'pending',
  },
  {
    id: 'D-005',
    store: 'Prisma Kallio',
    address: 'Viides linja 5',
    date: '2026-04-21',
    boxes: 52,
    status: 'done',
  },
  {
    id: 'D-006',
    store: 'Alepa Töölö',
    address: 'Runeberginkatu 5',
    date: '2026-04-21',
    boxes: 28,
    status: 'done',
  },
  {
    id: 'D-007',
    store: 'S-Market Kamppi',
    address: 'Urho Kekkosen katu 1',
    date: '2026-04-21',
    boxes: 32,
    status: 'done',
  },
  {
    id: 'D-008',
    store: 'K-Supermarket Sörnäinen',
    address: 'Sörnäisten rantatie 33',
    date: '2026-04-20',
    boxes: 64,
    status: 'done',
  },
];

export function DriverDeliveriesPage() {
  const [filter, setFilter] = useState<'all' | 'done' | 'pending'>('all');

  const filteredDeliveries = allDeliveries.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'done') return d.status === 'done';
    if (filter === 'pending')
      return d.status === 'pending' || d.status === 'active';
    return true;
  });

  const stats = {
    total: allDeliveries.length,
    done: allDeliveries.filter((d) => d.status === 'done').length,
    pending: allDeliveries.filter(
      (d) => d.status === 'pending' || d.status === 'active'
    ).length,
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        padding: '1.5rem',
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#0f2444',
          marginBottom: '1rem',
        }}
      >
        Toimitukset
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3" style={{marginBottom: '1.5rem'}}>
        {[
          {
            label: 'Yhteensä',
            value: stats.total,
            color: '#0f2444',
            bg: '#f1f5f9',
          },
          {
            label: 'Valmiit',
            value: stats.done,
            color: '#16a34a',
            bg: '#dcfce7',
          },
          {
            label: 'Jäljellä',
            value: stats.pending,
            color: '#f97316',
            bg: '#fff7ed',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: '1.25rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{color: '#64748b', fontSize: '0.9rem', fontWeight: 600}}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          {label: 'Kaikki', value: 'all' as const},
          {label: 'Valmiit', value: 'done' as const},
          {label: 'Kesken', value: 'pending' as const},
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.75rem 1.5rem',
              minHeight: '48px',
              borderRadius: 12,
              border: 'none',
              backgroundColor: filter === f.value ? '#f97316' : 'white',
              color: filter === f.value ? 'white' : '#64748b',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow:
                filter === f.value
                  ? '0 4px 12px rgba(249,115,22,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
        {filteredDeliveries.map((delivery, i) => {
          const isDone = delivery.status === 'done';
          return (
            <motion.div
              key={delivery.id}
              initial={{opacity: 0, x: -20}}
              animate={{opacity: 1, x: 0}}
              transition={{delay: i * 0.03}}
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: isDone ? '2px solid #16a34a' : '2px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'start',
                    gap: '1rem',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: isDone ? '#dcfce7' : '#fff7ed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? (
                      <CheckCircle size={24} color="#16a34a" />
                    ) : (
                      <Package size={24} color="#f97316" />
                    )}
                  </div>
                  <div style={{flex: 1}}>
                    <h3
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        color: '#0f2444',
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {delivery.store}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        color: '#64748b',
                        fontSize: '0.95rem',
                      }}
                    >
                      <MapPin size={16} />
                      <span>{delivery.address}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        marginTop: '0.75rem',
                        fontSize: '0.9rem',
                      }}
                    >
                      <span style={{color: '#64748b'}}>
                        <strong>{delivery.boxes}</strong> boksia
                      </span>
                      <span style={{color: '#94a3b8'}}>{delivery.date}</span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 12,
                    backgroundColor: isDone ? '#dcfce7' : '#fff7ed',
                    color: isDone ? '#16a34a' : '#f97316',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isDone ? 'VALMIS' : 'KESKEN'}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredDeliveries.length === 0 && (
        <div
          style={{textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8'}}
        >
          <Package size={48} style={{margin: '0 auto 1rem', opacity: 0.3}} />
          <p style={{fontSize: '1.1rem', fontWeight: 600}}>Ei toimituksia</p>
        </div>
      )}
    </div>
  );
}
