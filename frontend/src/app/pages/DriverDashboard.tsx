import {useState, useEffect} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {orderService} from '../services/orderService';
import {Truck, Check, Package, MapPin} from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
}

interface AssignedOrder {
  order_id: number;
  status: string;
  delivery_address: string;
  notes: string;
  customer: {
    company_name: string;
    tel: string;
  };
  items: OrderItem[];
}

export function DriverDashboard() {
  const {token} = useAuth();
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const data = await orderService.getAssignedOrders(token);
        setOrders(data);
      } catch (err) {
        console.error('Error fetching assigned orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // Voisit lisätä pollaavan haun, jos haluat reaaliaikaisuutta
    // const interval = setInterval(fetchOrders, 15000);
    // return () => clearInterval(interval);
  }, [token]);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    if (!token) return;
    try {
      await orderService.updateOrderStatus(orderId, status, token);
      // Päivitä tila paikallisesti onnistuneen kutsun jälkeen
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? {...o, status} : o))
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Ladataan toimituksia...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Omat toimitukset</h1>
      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <div
              key={order.order_id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <h2 className="font-bold text-lg">
                Tilaus #{order.order_id} - {order.customer.company_name}
              </h2>
              <p className="text-gray-600 flex items-center gap-2">
                <MapPin size={14} /> {order.delivery_address}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Status: <span className="font-semibold">{order.status}</span>
              </p>
              <div className="mt-4 flex gap-2">
                {order.status === 'assigned' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.order_id, 'in_progress')
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
                  >
                    <Truck size={16} /> Aloita toimitus
                  </button>
                )}
                {order.status === 'in_progress' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.order_id, 'in_transit')
                    }
                    className="bg-orange-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
                  >
                    <Truck size={16} /> Matkalla
                  </button>
                )}
                {order.status === 'in_transit' && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'done')}
                    className="bg-green-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
                  >
                    <Check size={16} /> Kuittaa toimitetuksi
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Ei sinulle määrättyjä toimituksia tällä hetkellä.</p>
        )}
      </div>
    </div>
  );
}
