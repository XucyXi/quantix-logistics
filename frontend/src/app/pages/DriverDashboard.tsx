import {motion} from 'motion/react';
import {Truck, Check, Package, MapPin, Clock, AlertCircle} from 'lucide-react';
import {orderService} from '../services/orderService';
import {useOutletContext} from 'react-router';

// Tyyppimäärittelyt
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
  // TÄMÄ ON SE JUTTU: Haetaan DriverRootin lataamat tilaukset kontekstin kautta, ei API:sta!
  const {orders} = useOutletContext<{orders: AssignedOrder[]}>();

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Tilan päivitys epäonnistui.');
    }
  };

  return (
    <div style={{padding: '1.5rem'}}>
      <div className="flex justify-between items-center mb-6">
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#0f2444',
            margin: 0,
          }}
        >
          Omat toimitukset
        </h1>
      </div>

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
                border:
                  order.status === 'in_transit'
                    ? '2px solid #3b82f6'
                    : '1px solid transparent',
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
                  {order.customer?.company_name
                    ? ` - ${order.customer.company_name}`
                    : ''}
                </h2>

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
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Truck size={12} /> Matkalla
                  </span>
                ) : null}
              </div>

              <div className="text-sm font-medium text-slate-600 flex items-start gap-2 mb-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-blue-500" />
                <span>{order.delivery_address}</span>
              </div>

              {order.notes && (
                <div className="bg-orange-50 p-3 rounded-lg mb-4 text-sm text-orange-800 italic border border-orange-100 font-medium flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  &quot;{order.notes}&quot;
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 justify-end">
                {(order.status === 'assigned' ||
                  order.status === 'in_progress') && (
                  <button
                    disabled
                    className="bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed"
                  >
                    <Clock size={16} /> Odottaa varastoa...
                  </button>
                )}

                {order.status === 'ready_for_pickup' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.order_id, 'in_transit')
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Package size={16} /> Noudettu (Aloita ajo)
                  </button>
                )}

                {order.status === 'in_transit' && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'done')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Check size={16} /> Kuittaa toimitetuksi
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-sm mt-10">
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
