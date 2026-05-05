import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {CheckCircle, Clock, MapPin, Truck} from 'lucide-react';
import {orderService} from '../services/orderService';

interface Delivery {
  order_id: number;
  status: string;
  delivery_address: string;
  customer: {company_name: string | null};
  items: {quantity: number}[];
}

export function DriverDeliveriesPage() {
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'pending'>('all');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await orderService.getAssignedOrders();
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'in_transit') return d.status === 'in_transit';
    if (filter === 'pending')
      return ['assigned', 'in_progress', 'ready_for_pickup'].includes(d.status);
    return true;
  });

  const stats = {
    total: deliveries.length,
    in_transit: deliveries.filter((d) => d.status === 'in_transit').length,
    pending: deliveries.filter((d) =>
      ['assigned', 'in_progress', 'ready_for_pickup'].includes(d.status)
    ).length,
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Ladataan toimituksia...
      </div>
    );

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        padding: '1.5rem',
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#0f2444',
          marginBottom: '1rem',
        }}
      >
        Kaikki työtehtävät
      </h1>

      <div className="grid grid-cols-3 gap-3" style={{marginBottom: '1.5rem'}}>
        {[
          {
            label: 'Yhteensä',
            value: stats.total,
            color: '#0f2444',
            bg: '#f1f5f9',
          },
          {
            label: 'Matkalla',
            value: stats.in_transit,
            color: '#8b5cf6',
            bg: '#f3e8ff',
          },
          {
            label: 'Odottaa',
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
              style={{color: '#64748b', fontSize: '0.8rem', fontWeight: 600}}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

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
          {label: 'Matkalla', value: 'in_transit' as const},
          {label: 'Odottaa (Varasto)', value: 'pending' as const},
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: 12,
              border: 'none',
              backgroundColor: filter === f.value ? '#0f2444' : 'white',
              color: filter === f.value ? 'white' : '#64748b',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow:
                filter === f.value
                  ? '0 4px 12px rgba(15,36,68,0.2)'
                  : '0 2px 8px rgba(0,0,0,0.06)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
        <AnimatePresence>
          {filteredDeliveries.map((delivery, i) => {
            const isTransit = delivery.status === 'in_transit';
            const totalBoxes = delivery.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <motion.div
                key={delivery.order_id}
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, height: 0}}
                transition={{delay: i * 0.03}}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: isTransit ? '2px solid #8b5cf6' : '2px solid #e2e8f0',
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
                        backgroundColor: isTransit ? '#f3e8ff' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isTransit ? (
                        <Truck size={24} color="#8b5cf6" />
                      ) : (
                        <Clock size={24} color="#64748b" />
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
                        Tilaus #{delivery.order_id}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                          color: '#64748b',
                          fontSize: '0.9rem',
                        }}
                      >
                        <MapPin size={14} />{' '}
                        <span>{delivery.delivery_address}</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          marginTop: '0.5rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span style={{color: '#64748b'}}>
                          <strong>{totalBoxes}</strong> kpl tuotteita
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 12,
                      backgroundColor: isTransit ? '#f3e8ff' : '#f8fafc',
                      color: isTransit ? '#8b5cf6' : '#64748b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isTransit ? 'MATKALLA' : 'ODOTTAA'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDeliveries.length === 0 && (
        <div
          style={{textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8'}}
        >
          <CheckCircle
            size={48}
            style={{margin: '0 auto 1rem', opacity: 0.3}}
          />
          <p style={{fontSize: '1.1rem', fontWeight: 600}}>
            Ei toimituksia valitulla suodattimella.
          </p>
        </div>
      )}
    </div>
  );
}
