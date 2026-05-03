import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  X,
  Moon,
  Sun,
  User as UserIcon,
  Bell,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {orderService} from '../services/orderService';
import {useToast} from '../contexts/ToastContext';
import {useNavigate} from 'react-router';
import {ChangePasswordCard} from '../components/ChangePasswordCard';

interface Order {
  order_id: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'in_transit'
    | 'done'
    | 'stuck'
    | 'cancelled';
  delivery_address: string;
  total_price: number | string;
  ordered_at: string;
  item_count: number;
  driver_email?: string;
  notes?: string;
}

interface OrderItem {
  order_item_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product_name?: string; // Jos backend palauttaa nimen
}

interface OrderDetails extends Order {
  items: OrderItem[];
}

interface OrderStats {
  total_orders: number;
  delivered_count: number;
  pending_count: number;
  in_transit_count: number;
  total_spent: number | string;
  average_order_value: number | string;
  delivery_speed_days: number | string;
  success_rate: number | string;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  trend: string;
}) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      className="bg-card rounded-2xl p-6 border border-border shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text', 'bg')}`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-sm font-medium text-muted-foreground mb-1">
        {label}
      </h3>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </motion.div>
  );
}

function OrderCard({
  order,
  index,
  onView,
}: {
  order: Order;
  index: number;
  onView: (id: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'assigned':
      case 'ready_for_pickup':
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
      case 'stuck':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Toimitettu';
      case 'in_transit':
        return 'Matkalla';
      case 'ready_for_pickup':
        return 'Odottaa noutoa';
      case 'in_progress':
        return 'Keräilyssä';
      case 'assigned':
        return 'Kuski määrätty';
      case 'pending':
        return 'Odottaa kuskia';
      case 'stuck':
        return 'Ongelma';
      case 'cancelled':
        return 'Peruutettu';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'assigned':
      case 'ready_for_pickup':
      case 'in_progress':
        return <MapPin className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'stuck':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fi-FI', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{opacity: 0, x: -20}}
      animate={{opacity: 1, x: 0}}
      transition={{delay: index * 0.05}}
      className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              Tilaus #{order.order_id}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(order.ordered_at)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-foreground">{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-foreground">{order.item_count} tuotetta</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {Number(order.total_price).toFixed(2)}€
          </p>
        </div>
        <motion.button
          onClick={() => onView(order.order_id)}
          whileHover={{scale: 1.05}}
          whileTap={{scale: 0.95}}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> Näytä
        </motion.button>
      </div>
    </motion.div>
  );
}

export function CustomerDashboard() {
  const {user, token} = useAuth();
  const navigate = useNavigate();
  const {showToast} = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  // Modaalin tilat
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Teeman tila (Dark mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      document.documentElement.classList.contains('dark') ||
      localStorage.getItem('theme') === 'dark'
    );
  });

  // Teeman vaihto effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const getStatCards = () => [
    {
      label: 'Yhteensä Tilaukset',
      value: stats?.total_orders?.toString() || '0',
      icon: ShoppingBag,
      color: 'text-blue-500',
      trend: `+${stats?.delivered_count || 0} toimitettu`,
    },
    {
      label: 'Toimitettu',
      value: stats?.delivered_count?.toString() || '0',
      icon: CheckCircle,
      color: 'text-green-500',
      trend: `${stats?.success_rate || 0}% onnistumisaste`,
    },
    {
      label: 'Odottaa',
      value: stats?.pending_count?.toString() || '0',
      icon: Clock,
      color: 'text-yellow-500',
      trend: `${stats?.in_transit_count || 0} kuljetuksessa`,
    },
    {
      label: 'Kokonaiskulut',
      value: `€${Number(stats?.total_spent || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-500',
      trend: `Avg €${Number(stats?.average_order_value || 0).toFixed(2)}`,
    },
  ];

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => {
          if (filterStatus === 'pending')
            return [
              'pending',
              'assigned',
              'in_progress',
              'ready_for_pickup',
            ].includes(order.status);
          return order.status === filterStatus;
        });

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setError(null);
        const [ordersRes, statsRes] = await Promise.all([
          orderService.getCustomerOrders(token),
          orderService.getOrderStats(token),
        ]);
        setOrders(ordersRes.orders || []);
        setStats(statsRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Virhe datanhaussa');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [user, token]);

  // Hakee ja avaa tilauksen tiedot modaaliin
  const handleViewOrder = async (orderId: number) => {
    setIsModalLoading(true);
    try {
      const details = await orderService.getOrderById(orderId, token!);
      setSelectedOrder(details);
    } catch {
      showToast('Tilauksen tietojen haku epäonnistui.', 'error');
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div style={{maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem'}}>
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold">
              Tervetuloa, {user?.name || 'Asiakas'}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Seuraa tilauksiasi ja hallitse asiakastiliäsi.
            </p>
          </div>

          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-3 font-medium transition-colors ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Tilaukset
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 font-medium transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Settings className="w-4 h-4" /> Asetukset
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem'}}>
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 border border-destructive/20">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {activeTab === 'orders' ? (
          <>
            <motion.div
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              className="bg-card rounded-xl p-6 border border-border mb-8 shadow-sm"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Yhteenveto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Keskimääräinen tilauksen arvo
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    €{Number(stats?.average_order_value || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Tilausten nopeus
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stats?.delivery_speed_days || '0'} vrk
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keskimäärin kulutuksesta toimitukseen
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Kokonaiskulutus
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    €{Number(stats?.total_spent || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {getStatCards().map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1 text-foreground">
                    Tilausten Historia
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Viimeisimmät tilaukset ja niiden status
                  </p>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Plus className="w-5 h-5" /> Uusi Tilaus
                </button>
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  {label: 'Kaikki', value: 'all'},
                  {label: 'Odottaa toimitusta', value: 'pending'},
                  {label: 'Matkalla', value: 'in_transit'},
                  {label: 'Toimitettu', value: 'done'},
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      filterStatus === filter.value
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loading && orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">
                  Ladataan tilauksia...
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map((order, index) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      index={index}
                      onView={handleViewOrder}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-bold text-foreground mb-2">
                    Ei tilauksia
                  </p>
                  <p className="text-muted-foreground mb-6">
                    Et ole vielä tehnyt tilauksia, tai mikään ei vastaa hakua.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 inline-flex items-center gap-2 shadow-md"
                  >
                    <Plus className="w-5 h-5" /> Siirry tuoteluetteloon
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ASETUKSET VÄLILEHTI */
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Käyttäjätiedot -kortti */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <UserIcon size={20} className="text-primary" /> Tilin tiedot
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Nimi
                  </p>
                  <p className="font-semibold text-foreground text-lg">
                    {user?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Sähköposti
                  </p>
                  <p className="font-semibold text-foreground text-lg">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Salasana kortti */}
            <ChangePasswordCard />

            {/* Ulkoasu -kortti - KORJATTU ALIGNMENT */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    Ulkoasu
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Vaihda sovelluksen värimaailmaa silmille ystävällisemmäksi.
                  </p>
                </div>

                {/* Kytkin (Switch) - Tarkka keskitys ja koko */}
                <div className="flex items-center justify-center shrink-0">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Vaihda teemaa"
                    className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                      isDarkMode ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    >
                      {isDarkMode ? (
                        <Moon size={12} className="text-primary" />
                      ) : (
                        <Sun size={12} className="text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ilmoitusasetukset (Esimerkkinä responsiivisesta listasta) */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Bell size={20} className="text-primary" /> Ilmoitukset
              </h2>
              <div className="space-y-4">
                {[
                  {
                    id: 'email',
                    label: 'Sähköpostitilaus',
                    desc: 'Tulossa: Saa päivitykset tilauksista sähköpostiin.',
                  },
                  {
                    id: 'marketing',
                    label: 'Markkinointiviestit',
                    desc: 'Tulossa: Erikoistarjoukset ja uutiset.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MODAALI: TILAUSKORTTI */}
      <AnimatePresence>
        {(selectedOrder || isModalLoading) && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.95}}
              className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {isModalLoading ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                  Ladataan tilauksen tietoja...
                </div>
              ) : (
                selectedOrder && (
                  <>
                    <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
                      <div>
                        <h2 className="text-xl font-bold text-foreground m-0">
                          Tilaus #{selectedOrder.order_id}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(selectedOrder.ordered_at).toLocaleString(
                            'fi-FI'
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-5 overflow-y-auto flex flex-col gap-6">
                      <div className="bg-input-background border border-border rounded-xl p-4">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                          <MapPin size={14} /> Toimitusosoite
                        </h3>
                        <p className="text-foreground font-medium m-0">
                          {selectedOrder.delivery_address}
                        </p>
                      </div>

                      {selectedOrder.notes && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                          <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                            Lisätiedot
                          </h3>
                          <p className="text-sm text-amber-800 dark:text-amber-200 m-0 italic">
                            &quot;{selectedOrder.notes}&quot;
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-3 border-b border-border pb-2">
                          Tilauksen sisältö
                        </h3>
                        <div className="space-y-3">
                          {selectedOrder.items?.map((item) => (
                            <div
                              key={item.order_item_id}
                              className="flex justify-between items-center text-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground bg-muted px-2 py-1 rounded-md">
                                  {item.quantity}x
                                </span>
                                <span className="text-foreground">
                                  {item.product_name ||
                                    `Tuote #${item.product_id}`}
                                </span>
                              </div>
                              <span className="font-medium text-muted-foreground">
                                {Number(item.unit_price).toFixed(2)}€ / kpl
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-primary/10 border border-primary/20 rounded-xl mt-2">
                        <span className="font-bold text-foreground">
                          Yhteensä
                        </span>
                        <span className="text-2xl font-extrabold text-primary">
                          {Number(selectedOrder.total_price).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
