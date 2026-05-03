import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {Truck, Check, Package, MapPin, Clock, AlertCircle} from 'lucide-react';
import {orderService} from '../services/orderService';

interface OrderItem {
  name: string;
  quantity: number;
}

interface AssignedOrder {
  order_id: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'in_transit'
    | 'done'
    | 'cancelled';
  delivery_address: string;
  notes: string | null;
  customer: {
    company_name: string | null;
    tel: string | null;
  };
  items: OrderItem[];
}

export function DriverDashboard() {
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAssignedOrders();
      setOrders(data);
      setError('');
    } catch (err) {
      console.error('Error fetching assigned orders:', err);
      setError('Toimitusten lataus epäonnistui.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Pollaa tietoja 5 sekunnin välein, jotta nähdään varaston automaattiset päivitykset!
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      // Päivitä tila paikallisesti heti nopean UX:n takaamiseksi
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === orderId
            ? {...o, status: status as AssignedOrder['status']}
            : o
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Tilan päivitys epäonnistui.');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground mt-10">
        Ladataan toimituksia...
      </div>
    );
  }

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
          marginBottom: '1.5rem',
        }}
      >
        Omat toimitukset
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, i) => (
            <motion.div
              key={order.order_id}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: i * 0.1}}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: '#0f2444',
                    margin: 0,
                  }}
                >
                  Tilaus #{order.order_id}
                  {order.customer.company_name
                    ? ` - ${order.customer.company_name}`
                    : ''}
                </h2>

                {/* Tila-badge */}
                {order.status === 'assigned' ||
                order.status === 'in_progress' ? (
                  <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock size={12} /> Varastolla
                  </span>
                ) : order.status === 'ready_for_pickup' ? (
                  <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Package size={12} /> Odottaa noutoa
                  </span>
                ) : order.status === 'in_transit' ? (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Truck size={12} /> Matkalla
                  </span>
                ) : null}
              </div>

              <div className="text-sm text-slate-600 flex items-start gap-2 mb-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <span>{order.delivery_address}</span>
              </div>

              {order.notes && (
                <div className="bg-amber-50 p-3 rounded-lg mb-4 text-sm text-amber-800 italic border border-amber-100">
                  &quot;{order.notes}&quot;
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                {/* Jos varasto ei ole vielä kuitannut tilausta valmiiksi */}
                {(order.status === 'assigned' ||
                  order.status === 'in_progress') && (
                  <button
                    disabled
                    className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed"
                  >
                    <Clock size={16} /> Odottaa varastoa...
                  </button>
                )}

                {/* Varasto valmis -> Kuski ottaa kyytiin */}
                {order.status === 'ready_for_pickup' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.order_id, 'in_transit')
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Package size={16} /> Noudettu (Aloita ajo)
                  </button>
                )}

                {/* Kuski perillä -> Merkitsee toimitetuksi */}
                {order.status === 'in_transit' && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'done')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                  >
                    <Check size={16} /> Kuittaa toimitetuksi
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-10 bg-white rounded-2xl border border-slate-200">
            <Package size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">
              Ei sinulle määrättyjä toimituksia tällä hetkellä.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
