import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
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
import {useTheme} from '../contexts/ThemeProvider';
import {orderService} from '../services/orderService';
import {adminService} from '../services/adminService';
import {useToast} from '../contexts/ToastContext';
import {useNavigate, useLocation} from 'react-router';
import {ChangePasswordCard} from '../components/ChangePasswordCard';
import {Map} from '../components/delivery-tracking/Map';

// Tyyppimäärittelyt
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

interface FlexibleTrackingData {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  updated_at?: string;
  driver?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    updated_at?: string;
  };
  destination?: {
    lat?: number;
    lng?: number;
  };
}

interface Alert {
  notification_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  created_at: string;
}

interface Announcement {
  announcement_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  expires_at?: string | null;
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
  const location = useLocation();
  const {showToast} = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Katsotaan onko tultu kellokuvakkeesta (navigoitu state: { tab: 'settings' } kanssa)
  const initialTab =
    location.state &&
    typeof location.state === 'object' &&
    'tab' in location.state
      ? (location.state as {tab: 'orders' | 'settings'}).tab
      : 'orders';

  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>(initialTab);

  // Ilmoitustilat
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [trackingData, setTrackingData] = useState<FlexibleTrackingData | null>(
    null
  );
  const [isModalLoading, setIsModalLoading] = useState(false);

  const {theme, setTheme} = useTheme();
  const isDarkMode =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Hae ilmoitukset ja merkitse luetuksi
  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const data = await adminService.getNotifications();
        const fetchedAlerts: Alert[] = data.notifications || [];
        const fetchedAnns: Announcement[] = data.announcements || [];

        // Hoidetaan luetuksi merkitseminen vain jos ollaan settings-tabissa!
        if (activeTab === 'settings') {
          const seen = JSON.parse(
            localStorage.getItem('seen_notifications_customer') || '[]'
          );
          const currentNew = new Set<string>();
          let hasChanges = false;

          fetchedAlerts.forEach((a) => {
            const id = `notif-${a.notification_id}`;
            if (!seen.includes(id)) {
              currentNew.add(id);
              seen.push(id);
              hasChanges = true;
            }
          });

          fetchedAnns.forEach((a) => {
            const id = `ann-${a.announcement_id}`;
            if (!seen.includes(id)) {
              currentNew.add(id);
              seen.push(id);
              hasChanges = true;
            }
          });

          if (hasChanges && mounted) {
            localStorage.setItem(
              'seen_notifications_customer',
              JSON.stringify(seen)
            );
            window.dispatchEvent(new Event('notifications_seen_customer'));
            setNewItems((prev) => new Set([...prev, ...currentNew]));
          }
        }

        if (mounted) {
          setAlerts(fetchedAlerts);
          setAnnouncements(fetchedAnns);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [activeTab]); // Kutsutaan aina kun välilehti vaihtuu!

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

  // Datan haku (Tilaukset & Statistiikka)
  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    let mounted = true;

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

        if (mounted) {
          setOrders(orderData);
          setStats(statsRes);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Virhe datanhaussa');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, token]);

  // Modaalin avaus
  const handleViewOrder = async (orderId: number) => {
    setIsModalLoading(true);
    setTrackingData(null); // Nollataan aiemmat seurantatiedot
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

  // SEURANTADATAN LIVE-PÄIVITYS (Polling)
  useEffect(() => {
    if (!selectedOrder || selectedOrder.status !== 'in_transit' || !token) {
      return;
    }

    let mounted = true;

    const fetchTracking = async () => {
      try {
        const data = await orderService.getTrackingData(
          selectedOrder.order_id,
          token
        );
        if (mounted) {
          setTrackingData(data as FlexibleTrackingData);
        }
      } catch (err) {
        console.warn('Seurantatiedon haku epäonnistui:', err);
      }
    };

    fetchTracking(); // Hae heti
    const interval = setInterval(fetchTracking, 10000); // Päivitä 10s välein
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedOrder, token]);

  // KARTAN KOORDINAATTIEN PURKAMINEN JOUSTAVASTI
  const driverLat = trackingData
    ? Number(
        trackingData?.driver?.latitude ||
          trackingData?.driver?.lat ||
          trackingData?.latitude ||
          trackingData?.lat
      )
    : NaN;
  const driverLng = trackingData
    ? Number(
        trackingData?.driver?.longitude ||
          trackingData?.driver?.lng ||
          trackingData?.longitude ||
          trackingData?.lng
      )
    : NaN;
  const hasDriverLocation =
    !isNaN(driverLat) && !isNaN(driverLng) && driverLat !== 0;

  const destLat = trackingData
    ? Number(trackingData?.destination?.lat || 0)
    : 0;
  const destLng = trackingData
    ? Number(trackingData?.destination?.lng || 0)
    : 0;
  const hasDestination = !isNaN(destLat) && destLat !== 0;

  const updatedAt =
    trackingData?.driver?.updated_at || trackingData?.updated_at;

  return (
    <section className="min-h-screen bg-background font-sans text-foreground transition-colors duration-300 pb-20">
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
              className={`pb-4 font-bold transition-all text-base px-2 ${activeTab === 'orders' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-white/60 hover:text-white cursor-pointer'}`}
            >
              Tilaukset
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 font-bold transition-all flex items-center gap-2 text-base px-2 ${activeTab === 'settings' ? 'text-orange-500 border-b-4 border-orange-500' : 'text-white/60 hover:text-white cursor-pointer'}`}
            >
              <Settings className="w-4 h-4" /> Asetukset & Ilmoitukset
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
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Oikeasti toimiva Ilmoitukset-osio */}
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-foreground mb-6 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Bell size={24} className="text-primary" />
                </div>
                Tärkeät Ilmoitukset
                {newItems.size > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse ml-auto">
                    {newItems.size} uutta
                  </span>
                )}
              </h2>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {announcements.length === 0 && alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground font-medium bg-muted/20 rounded-2xl border border-border/50">
                    Ei uusia ilmoituksia tällä hetkellä.
                  </div>
                ) : (
                  <>
                    {announcements.map((announcement) => {
                      const isNew = newItems.has(
                        `ann-${announcement.announcement_id}`
                      );
                      return (
                        <div
                          key={`announcement-${announcement.announcement_id}`}
                          className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
                            isNew
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                              : 'border-border bg-card'
                          }`}
                        >
                          <AlertTriangle
                            size={24}
                            className={`shrink-0 mt-0.5 ${isNew ? 'text-orange-500' : 'text-primary'}`}
                          />
                          <div className="flex-1">
                            <div className="text-foreground font-extrabold text-base mb-1 flex justify-between items-start">
                              {announcement.title}
                              {isNew && (
                                <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                                  Uusi
                                </span>
                              )}
                            </div>
                            {announcement.content && (
                              <div className="text-muted-foreground text-sm mb-2 leading-snug">
                                {announcement.content}
                              </div>
                            )}
                            <div className="text-muted-foreground text-xs font-semibold">
                              {new Date(
                                announcement.created_at
                              ).toLocaleDateString('fi-FI')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {alerts.map((alert) => {
                      const isNew = newItems.has(
                        `notif-${alert.notification_id}`
                      );
                      return (
                        <div
                          key={alert.notification_id}
                          className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-500 ${
                            isNew
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                              : alert.type === 'warning'
                                ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20'
                                : 'border-blue-200 bg-blue-50 dark:bg-blue-950/20'
                          }`}
                        >
                          <AlertTriangle
                            size={24}
                            className={`shrink-0 mt-0.5 ${
                              isNew
                                ? 'text-orange-500'
                                : alert.type === 'warning'
                                  ? 'text-amber-500'
                                  : 'text-blue-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="text-foreground font-extrabold text-base mb-1 flex justify-between items-start">
                              {alert.title}
                              {isNew && (
                                <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                                  Uusi
                                </span>
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs font-semibold">
                              {new Date(alert.created_at).toLocaleDateString(
                                'fi-FI'
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

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

            <div className="bg-card border border-border rounded-3xl shadow-sm transition-all hover:shadow-md overflow-hidden">
              <ChangePasswordCard />
            </div>

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
                    onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
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
          </motion.div>
        )}
      </div>

      {/* MODAALI: TILAUSKORTTI JA LIVE-KARTTA */}
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
                    <div className="flex justify-between items-start p-6 border-b border-border bg-muted/20 shrink-0">
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
                      {/* --- KARTTA-OSIO --- */}
                      {selectedOrder.status === 'in_transit' && (
                        <div className="bg-input-background border border-border rounded-2xl p-5 shadow-sm overflow-hidden flex flex-col">
                          <h3 className="text-xs font-extrabold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Truck size={16} /> Live-Seuranta
                          </h3>

                          {hasDriverLocation ? (
                            <>
                              <div className="h-[250px] w-full rounded-xl overflow-hidden border border-border relative z-0">
                                <Map
                                  startCoords={[driverLat, driverLng]}
                                  // Jos määränpäätä ei ole tiedossa, estetään Map:ia reitittämästä 0,0 koordinaatteihin asettamalla endCoords samaan paikkaan
                                  endCoords={
                                    hasDestination
                                      ? [destLat, destLng]
                                      : [driverLat, driverLng]
                                  }
                                  variant="customer"
                                  showRoute={hasDestination}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground text-center mt-3 font-medium flex items-center justify-center gap-1.5">
                                <Clock size={12} /> Päivitetty:{' '}
                                {updatedAt
                                  ? new Date(updatedAt).toLocaleTimeString(
                                      'fi-FI'
                                    )
                                  : 'Nyt'}
                              </p>
                            </>
                          ) : (
                            <div className="h-[250px] w-full rounded-xl border border-border bg-muted/30 flex items-center justify-center flex-col gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                              <span className="text-sm font-bold text-muted-foreground">
                                Etsitään kuljettajan sijaintia...
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      {/* --- KARTTA-OSIO LOPPUU --- */}

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

                      <div className="flex justify-between items-center p-6 bg-gradient-to-br from-[#0f2444] to-[#1e3a5f] rounded-2xl mt-2 shadow-lg text-white shrink-0">
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
