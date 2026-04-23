import {useState} from 'react';
import {motion} from 'motion/react';
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  store: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  time: string;
}

const ordersData: Order[] = [
  {
    id: 'TIL-2024-001',
    customerName: 'K-Market Kallio',
    store: 'Helsinki',
    items: 24,
    total: 1240.5,
    status: 'completed',
    date: '2026-04-21',
    time: '08:30',
  },
  {
    id: 'TIL-2024-002',
    customerName: 'S-Market Espoo',
    store: 'Espoo',
    items: 18,
    total: 890.0,
    status: 'processing',
    date: '2026-04-21',
    time: '09:15',
  },
  {
    id: 'TIL-2024-003',
    customerName: 'Alepa Kamppi',
    store: 'Helsinki',
    items: 12,
    total: 560.75,
    status: 'pending',
    date: '2026-04-21',
    time: '10:00',
  },
  {
    id: 'TIL-2024-004',
    customerName: 'Lidl Vantaa',
    store: 'Vantaa',
    items: 32,
    total: 1890.25,
    status: 'completed',
    date: '2026-04-21',
    time: '07:45',
  },
  {
    id: 'TIL-2024-005',
    customerName: 'K-Citymarket',
    store: 'Tampere',
    items: 45,
    total: 2340.0,
    status: 'processing',
    date: '2026-04-21',
    time: '08:00',
  },
  {
    id: 'TIL-2024-006',
    customerName: 'Prisma Turku',
    store: 'Turku',
    items: 28,
    total: 1450.5,
    status: 'cancelled',
    date: '2026-04-20',
    time: '16:30',
  },
];

const statusStyles = {
  pending: {bg: '#fef3c7', color: '#d97706', label: 'Odottaa', icon: Clock},
  processing: {
    bg: '#dbeafe',
    color: '#2563eb',
    label: 'Käsittelyssä',
    icon: Package,
  },
  completed: {
    bg: '#dcfce7',
    color: '#16a34a',
    label: 'Valmis',
    icon: CheckCircle,
  },
  cancelled: {bg: '#fee2e2', color: '#dc2626', label: 'Peruttu', icon: XCircle},
};

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>(
    'all'
  );

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: ordersData.length,
    pending: ordersData.filter((o) => o.status === 'pending').length,
    processing: ordersData.filter((o) => o.status === 'processing').length,
    completed: ordersData.filter((o) => o.status === 'completed').length,
  };

  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        style={{marginBottom: '1.5rem'}}
      >
        <h1
          style={{
            color: '#0f2444',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '0.5rem',
          }}
        >
          Tilaukset
        </h1>
        <p style={{color: '#64748b', fontSize: '0.85rem', margin: 0}}>
          {stats.total} tilausta yhteensä · {stats.completed} valmista
        </p>
      </motion.div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {[
          {label: 'Yhteensä', value: stats.total, color: '#0f2444'},
          {label: 'Odottaa', value: stats.pending, color: '#d97706'},
          {label: 'Käsittelyssä', value: stats.processing, color: '#2563eb'},
          {label: 'Valmiit', value: stats.completed, color: '#16a34a'},
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: '1.25rem',
              boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: stat.color,
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {stat.value}
            </div>
            <div style={{color: '#64748b', fontSize: '0.85rem'}}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filter */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        <div style={{position: 'relative'}}>
          <Search
            size={18}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Hae tilausnumero, asiakas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              fontSize: '0.9rem',
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              transition: 'border 0.2s',
              boxSizing: 'border-box',
              backgroundColor: 'white',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#f97316')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>

        <div style={{position: 'relative'}}>
          <Filter
            size={18}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              fontSize: '0.9rem',
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="all">Kaikki tilaukset</option>
            <option value="pending">Odottaa</option>
            <option value="processing">Käsittelyssä</option>
            <option value="completed">Valmis</option>
            <option value="cancelled">Peruttu</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
        }}
      >
        <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px',
            }}
          >
            <thead>
              <tr style={{backgroundColor: '#f8fafc'}}>
                {[
                  'TILAUSNUMERO',
                  'ASIAKAS',
                  'KAUPPA',
                  'TUOTTEET',
                  'SUMMA',
                  'PÄIVÄMÄÄRÄ',
                  'TILA',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, i) => {
                const st = statusStyles[order.status];
                const StatusIcon = st.icon;
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderTop: '1px solid #f1f5f9',
                      backgroundColor: 'white',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f8fafc')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'white')
                    }
                  >
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontWeight: 700,
                        color: '#0f2444',
                        fontSize: '0.85rem',
                      }}
                    >
                      {order.id}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                      }}
                    >
                      {order.customerName}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#64748b',
                      }}
                    >
                      {order.store}
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#374151',
                        fontWeight: 600,
                      }}
                    >
                      {order.items} kpl
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontSize: '0.875rem',
                        color: '#0f2444',
                        fontWeight: 700,
                      }}
                    >
                      {order.total.toFixed(2)} €
                    </td>
                    <td
                      style={{
                        padding: '1rem 1.25rem',
                        fontSize: '0.85rem',
                        color: '#64748b',
                      }}
                    >
                      {order.date}
                      <br />
                      <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>
                        {order.time}
                      </span>
                    </td>
                    <td style={{padding: '1rem 1.25rem'}}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.875rem',
                          borderRadius: 20,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          backgroundColor: st.bg,
                          color: st.color,
                        }}
                      >
                        <StatusIcon size={14} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{padding: '1rem 1.25rem'}}>
                      <button
                        style={{
                          padding: '0.5rem',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#f97316';
                          e.currentTarget.style.color = '#f97316';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>
              Ei tilauksia löytynyt hakuehdoilla.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
