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
  Settings,
  X,
  Moon,
  Sun,
  User as UserIcon,
  Bell,
  Loader2,
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
  product_name?: string;
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
  value: string | number;
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
          className={`p-3 rounded-xl bg-opacity-10 ${color.replace('text', 'bg')} border border-${color.split('-')[1]}-200/50`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </h3>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-3xl font-extrabold text-foreground leading-none">
          {value}
        </p>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{trend}</p>
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
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/30';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/30';
      case 'assigned':
      case 'ready_for_pickup':
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/30';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/30';
      case 'cancelled':
      case 'stuck':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/30';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
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
        return <CheckCircle className="w-5 h-5" />;
      case 'in_transit':
        return <Truck className="w-5 h-5" />;
      case 'assigned':
      case 'ready_for_pickup':
      case 'in_progress':
        return <MapPin className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
      case 'stuck':
        return <AlertCircle className="w-5 h-5" />;
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
      className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all shadow-sm hover:shadow-md flex flex-col"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-xl border ${getStatusColor(order.status)}`}
          >
            {getStatusIcon(order.status)}
          </div>
          <div>
            <p className="font-extrabold text-lg text-foreground leading-none mb-1">
              Tilaus #{order.order_id}
            </p>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(order.ordered_at)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-3 mb-6 text-sm flex-1">
        <div className="flex items-start gap-3 text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
          <span className="text-foreground font-medium">
            {order.delivery_address}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground px-3">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <span className="text-foreground font-bold">
            {order.item_count} tuotetta
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-border mt-auto">
        <div>
          <p className="text-2xl font-extrabold text-foreground">
            {Number(order.total_price).toFixed(2).replace('.', ',')} €
          </p>
        </div>
        <button
          onClick={() => onView(order.order_id)}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Eye className="w-4 h-4" /> Näytä tiedot
        </button>
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
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: 'text-blue-500',
      trend: `+${stats?.delivered_count || 0} toimitettu`,
    },
    {
      label: 'Toimitettu',
      value: stats?.delivered_count || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      trend: `${stats?.success_rate || 0}% onnistumisaste`,
    },
    {
      label: 'Odottaa toimitusta',
      value:
        Number(stats?.pending_count || 0) +
        Number(stats?.in_transit_count || 0),
      icon: Clock,
      color: 'text-orange-500',
      trend: `${stats?.in_transit_count || 0} kuljetuksessa`,
    },
    {
      label: 'Kokonaiskulut',
      value: `${Number(stats?.total_spent || 0)
        .toFixed(2)
        .replace('.', ',')} €`,
      icon: DollarSign,
      color: 'text-purple-500',
      trend: `Avg ${Number(stats?.average_order_value || 0)
        .toFixed(2)
        .replace('.', ',')} €`,
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
          orderService.getCustomerOrders({}, token),
          orderService.getOrderStats(token),
        ]);

        const orderData = Array.isArray(ordersRes)
          ? ordersRes
          : ordersRes.orders || [];

        setOrders(orderData);
        setStats(statsRes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Virhe datanhaussa');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [user, token]);

  const handleViewOrder = async (orderId: number) => {
    setIsModalLoading(true);
    try {
      const details = await orderService.getOrderById(
        orderId,
        token || undefined
      );
      setSelectedOrder(details);
    } catch {
      showToast('Tilauksen tietojen haku epäonnistui.', 'error');
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f2444] to-[#1e3a5f] pt-12 pb-2 px-6 shadow-md border-b border-white/10 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2">
              Tervetuloa, {user?.name || 'Asiakas'}!
            </h1>
            <p className="text-white/70 font-medium text-lg">
              Seuraa tilauksiasi ja hallitse asiakastiliäsi.
            </p>
          </div>

          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 font-bold transition-all text-base px-2 ${activeTab === 'orders' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-white/60 hover:text-white'}`}
            >
              Tilaukset
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 font-bold transition-all flex items-center gap-2 text-base px-2 ${activeTab === 'settings' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-white/60 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" /> Asetukset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-200 font-bold shadow-sm">
            <AlertCircle size={24} className="shrink-0" />
            <div>
              <p>Tietojen lataus epäonnistui</p>
              <p className="text-sm font-medium text-red-500/80">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' ? (
          <>
            {/* Tilastokortit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              {getStatCards().map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-foreground mb-1">
                    Tilaushistoria
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">
                    Viimeisimmät tilaukset ja niiden tila
                  </p>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer w-full md:w-auto"
                >
                  <Plus className="w-5 h-5" /> Uusi Tilaus
                </button>
              </div>

              {/* Filtterit */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                {[
                  {label: 'Kaikki', value: 'all'},
                  {label: 'Odottaa toimitusta', value: 'pending'},
                  {label: 'Matkalla', value: 'in_transit'},
                  {label: 'Toimitettu', value: 'done'},
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer border ${
                      filterStatus === filter.value
                        ? 'bg-[#0f2444] text-white border-[#0f2444] shadow-md dark:bg-primary dark:text-primary-foreground dark:border-primary'
                        : 'bg-card border-border text-muted-foreground hover:bg-muted shadow-sm'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {loading && orders.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
                  <p className="font-bold text-lg">Ladataan tilauksia...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                <div className="text-center py-24 bg-card rounded-3xl border border-border shadow-sm">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-foreground mb-2">
                    Ei tilauksia
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg">
                    Et ole vielä tehnyt tilauksia, tai mikään tilaus ei vastaa
                    valittua suodatinta.
                  </p>
                  <button
                    onClick={() => navigate('/products')}
                    className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 inline-flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
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
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Käyttäjätiedot -kortti */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
              <h2 className="text-2xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon size={24} className="text-primary" />
                </div>
                Tilin tiedot
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-muted/20 p-6 rounded-2xl border border-border/50">
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                    Nimi
                  </p>
                  <p className="font-bold text-foreground text-xl">
                    {user?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
                    Sähköposti
                  </p>
                  <p className="font-bold text-foreground text-xl">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Salasana kortti */}
            <div className="bg-card border border-border rounded-3xl shadow-sm transition-all hover:shadow-md overflow-hidden">
              <ChangePasswordCard />
            </div>

            {/* Ulkoasu -kortti */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground mb-2">
                    Ulkoasu (Teema)
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium max-w-md">
                    Vaihda sovelluksen värimaailmaa vaalean ja tumman teeman
                    välillä silmille ystävällisemmäksi.
                  </p>
                </div>

                <div className="flex items-center justify-center shrink-0">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Vaihda teemaa"
                    className={`relative inline-flex h-9 w-16 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/30 ${
                      isDarkMode ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transform ring-0 transition duration-300 ease-in-out ${
                        isDarkMode ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    >
                      {isDarkMode ? (
                        <Moon size={14} className="text-primary" />
                      ) : (
                        <Sun size={14} className="text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ilmoitusasetukset */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm opacity-60">
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell size={24} className="text-primary" />
                </div>
                Ilmoitukset (Tulossa)
              </h2>
              <div className="space-y-5 bg-muted/20 p-6 rounded-2xl border border-border/50">
                {[
                  {
                    id: 'email',
                    label: 'Sähköpostitilaus',
                    desc: 'Saa päivitykset tilauksista sähköpostiin.',
                  },
                  {
                    id: 'marketing',
                    label: 'Markkinointiviestit',
                    desc: 'Erikoistarjoukset ja uutiset.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-foreground text-base">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      disabled
                      defaultChecked
                      className="w-6 h-6 rounded-md border-border text-primary focus:ring-primary mt-1 cursor-not-allowed"
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
              initial={{opacity: 0, scale: 0.95, y: 20}}
              animate={{opacity: 1, scale: 1, y: 0}}
              exit={{opacity: 0, scale: 0.95, y: 20}}
              className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {isModalLoading ? (
                <div className="p-20 text-center flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                  <p className="font-bold text-lg text-foreground">
                    Ladataan tilauksen tietoja...
                  </p>
                </div>
              ) : (
                selectedOrder && (
                  <>
                    <div className="flex justify-between items-start p-6 border-b border-border bg-muted/20">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-2xl font-extrabold text-foreground m-0">
                            Tilaus #{selectedOrder.order_id}
                          </h2>
                          <span className="text-xs font-bold bg-background border border-border px-2 py-1 rounded-md text-muted-foreground">
                            {new Date(
                              selectedOrder.ordered_at
                            ).toLocaleDateString('fi-FI')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {new Date(
                            selectedOrder.ordered_at
                          ).toLocaleTimeString('fi-FI', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="p-2 bg-background border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors hover:bg-muted cursor-pointer shadow-sm"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="p-6 overflow-y-auto flex flex-col gap-6">
                      <div className="bg-input-background border border-border rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MapPin size={16} /> Toimitusosoite
                        </h3>
                        <p className="text-foreground font-bold text-lg m-0">
                          {selectedOrder.delivery_address}
                        </p>
                      </div>

                      {selectedOrder.notes && (
                        <div className="bg-orange-50 border border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30 rounded-2xl p-5 shadow-sm">
                          <h3 className="text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertCircle size={16} /> Lisätiedot / Ohjeet
                          </h3>
                          <p className="text-base text-orange-800 dark:text-orange-200 m-0 italic font-medium">
                            &quot;{selectedOrder.notes}&quot;
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-extrabold text-foreground mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-border pb-2">
                          <ShoppingBag size={16} className="text-primary" />{' '}
                          Tilauksen sisältö
                        </h3>
                        <div className="space-y-3 bg-muted/20 p-4 rounded-2xl border border-border">
                          {selectedOrder.items?.map((item) => (
                            <div
                              key={item.order_item_id}
                              className="flex justify-between items-center bg-background p-3 rounded-xl border border-border/50 shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <span className="font-extrabold text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-sm">
                                  {item.quantity}x
                                </span>
                                <span className="font-bold text-foreground text-sm">
                                  {item.product_name ||
                                    `Tuote #${item.product_id}`}
                                </span>
                              </div>
                              <span className="font-bold text-muted-foreground text-sm">
                                {Number(item.unit_price)
                                  .toFixed(2)
                                  .replace('.', ',')}{' '}
                                € / kpl
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-6 bg-gradient-to-br from-[#0f2444] to-[#1e3a5f] rounded-2xl mt-2 shadow-lg text-white">
                        <span className="font-bold uppercase tracking-wider text-sm text-white/80">
                          Yhteensä
                        </span>
                        <span className="text-3xl font-extrabold">
                          {Number(selectedOrder.total_price)
                            .toFixed(2)
                            .replace('.', ',')}{' '}
                          €
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
