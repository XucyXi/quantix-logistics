import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {orderService} from '../services/orderService';
import {OrderTrackingMap} from '../components/OrderTrackingMap';
import {OrderItem} from '../../types/logistics';

interface Order {
  order_id: number;
  status: string;
  delivery_address: string;
  total_price: number;
  ordered_at: string;
  items: OrderItem[];
}

export function OrderDetailPage() {
  const {id} = useParams<{id: string}>();
  const {token} = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    const orderId = Number(id);
    if (Number.isNaN(orderId)) {
      console.error('Invalid order id:', id);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await orderService.getOrderById(orderId, token);
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return <div className="p-6">Ladataan tilauksen tietoja...</div>;
  if (!order) return <div className="p-6">Tilausta ei löytynyt.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tilaus #{order.order_id}</h1>
      <p>Status: {order.status}</p>
      <p>Osoite: {order.delivery_address}</p>
      <div className="mt-4 h-96 bg-gray-200 rounded-lg">
        <OrderTrackingMap orderId={order.order_id} token={token} />
      </div>
    </div>
  );
}
