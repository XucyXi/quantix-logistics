import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
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
  Bell,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';

interface Order {
  order_id: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'in_transit'
    | 'done'
    | 'stuck';
  delivery_address: string;
  total_price: number;
  ordered_at: string;
  item_count: number;
  driver_email?: string;
}

const statCards = [
  {
    label: 'Yhteensä Tilaukset',
    value: '24',
    icon: ShoppingBag,
    color: 'text-blue-500',
    trend: '+3 tämän kuukauden aikana',
  },
  {
    label: 'Toimitettu',
    value: '22',
    icon: CheckCircle,
    color: 'text-green-500',
    trend: '91.7% onnistumisaste',
  },
  {
    label: 'Odottaa',
    value: '2',
    icon: Clock,
    color: 'text-yellow-500',
    trend: 'Keskimäärin 2.3 päivää',
  },
  {
    label: 'Kokonaiskulut',
    value: '€2,450',
    icon: DollarSign,
    color: 'text-purple-500',
    trend: '-5% edelliseen kuukauteen',
  },
];

const recentOrders: Order[] = [
  {
    order_id: 1,
    status: 'done',
    delivery_address: 'Hämeentie 3, 00530 Helsinki',
    total_price: 450.25,
    ordered_at: '2026-04-28T09:30:00Z',
    item_count: 3,
    driver_email: 'driver1@example.com',
  },
  {
    order_id: 2,
    status: 'in_transit',
    delivery_address: 'Leppävaarankatu 2, 02600 Espoo',
    total_price: 890.0,
    ordered_at: '2026-04-29T10:15:00Z',
    item_count: 5,
    driver_email: 'driver2@example.com',
  },
  {
    order_id: 3,
    status: 'assigned',
    delivery_address: 'Kauppakeskus Ainoa, 01600 Vantaa',
    total_price: 560.75,
    ordered_at: '2026-04-29T14:00:00Z',
    item_count: 2,
    driver_email: 'driver3@example.com',
  },
  {
    order_id: 4,
    status: 'pending',
    delivery_address: 'Aleksanterinkatu 12, 33100 Tampere',
    total_price: 1240.5,
    ordered_at: '2026-04-29T15:45:00Z',
    item_count: 8,
  },
];

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: any;
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
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <p className="text-xs text-muted-foreground">{trend}</p>
    </motion.div>
  );
}

function OrderCard({order, index}: {order: Order; index: number}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'stuck':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'done':
        return 'Toimitettu';
      case 'in_transit':
        return 'Kuljetus käynnissä';
      case 'assigned':
        return 'Määritetty kuljettajalle';
      case 'pending':
        return 'Odottaa prosessointia';
      case 'stuck':
        return 'Ongelmia';
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
        return <MapPin className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'stuck':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fi-FI', {
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
      transition={{delay: index * 0.1}}
      className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
          </div>
          <div>
            <p className="font-semibold text-sm">Tilaus #{order.order_id}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {formatDate(order.ordered_at)}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{order.delivery_address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShoppingBag className="w-4 h-4" />
          <span>{order.item_count} tuotetta</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <p className="text-2xl font-bold">{order.total_price.toFixed(2)}€</p>
        </div>
        <motion.button
          whileHover={{scale: 1.05}}
          whileTap={{scale: 0.95}}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Näytä
        </motion.button>
      </div>
    </motion.div>
  );
}

export function CustomerDashboard() {
  const {user} = useAuth();
  const [orders, setOrders] = useState<Order[]>(recentOrders);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');
  // Suodata tilaukset
  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  return (
    <section className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div style={{maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem'}}>
          <div className="mb-6">
            <h1 className="text-4xl font-bold">
              Tervetuloa, {user?.name || 'Asiakas'}! 👋 • Seuraa tilauksiasi ja
              kuljetuksia reaaliajassa
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-border">
            <motion.button
              onClick={() => setActiveTab('orders')}
              whileHover={{color: 'var(--primary)'}}
              className={`pb-3 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tilaukset
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('settings')}
              whileHover={{color: 'var(--primary)'}}
              className={`pb-3 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-4 h-4" />
              Asetukset
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem'}}>
        {activeTab === 'orders' ? (
          <>
            {/* Quick Stats (Yhteenveto) - Siirretty alkuun */}
            <motion.div
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              className="bg-card rounded-xl p-6 border border-border mb-8"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Yhteenveto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Keskimääräinen tilauksen arvo
                  </p>
                  <p className="text-2xl font-bold">€451.25</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tilausten nopeus
                  </p>
                  <p className="text-2xl font-bold">8.4 vrk</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keskimäärin kulutuksesta toimittamiseen
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Kuukauden menot
                  </p>
                  <p className="text-2xl font-bold">€2,450</p>
                  <p className="text-xs text-green-600 mt-1">
                    ↓ 5% edelliseen kuukauteen
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Recent Orders Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Tilausten Historia
                  </h2>
                  <p className="text-muted-foreground">
                    Viimeisimmät tilaukset ja niiden status
                  </p>
                </div>
                <motion.button
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Uusi Tilaus
                </motion.button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-6 flex-wrap">
                {[
                  {label: 'Kaikki', value: 'all'},
                  {label: 'Odottaa', value: 'pending'},
                  {label: 'Kuljetus', value: 'in_transit'},
                  {label: 'Toimitettu', value: 'done'},
                ].map((filter) => (
                  <motion.button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      filterStatus === filter.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border text-foreground hover:border-primary/50'
                    }`}
                  >
                    {filter.label}
                  </motion.button>
                ))}
              </div>

              {/* Orders List */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Ladataan tilauksia...</p>
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="grid gap-4">
                  {filteredOrders.map((order, index) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    Ei tilauksia tällä suodattimella
                  </p>
                  <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Luo Uusi Tilaus
                  </motion.button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Settings Tab */
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Settings */}
              <div className="lg:col-span-2">
                {/* Account Information */}
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  className="bg-card rounded-xl p-6 border border-border mb-6"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Tilin Tiedot
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Koko Nimi
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        disabled
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Sähköposti
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Puhelinnumero
                      </label>
                      <input
                        type="tel"
                        placeholder="+358 50 123 4567"
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border hover:border-primary/50"
                      />
                    </div>
                    <motion.button
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                    >
                      Tallenna Muutokset
                    </motion.button>
                  </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.1}}
                  className="bg-card rounded-xl p-6 border border-border mb-6"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Ilmoitukset
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Tilauksen Päivitykset</p>
                        <p className="text-sm text-muted-foreground">
                          Saa ilmoitus tilauksen statuksen muuttuessa
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="font-medium">Toimitus Ilmoitukset</p>
                        <p className="text-sm text-muted-foreground">
                          Saa ilmoitus kun kuljettaja on lähellä
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="font-medium">Sähköposti Päivitykset</p>
                        <p className="text-sm text-muted-foreground">
                          Saa sähköpostitse tärkeät ilmoitukset
                        </p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded" />
                    </div>
                  </div>
                </motion.div>

                {/* Privacy & Security */}
                <motion.div
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  transition={{delay: 0.2}}
                  className="bg-card rounded-xl p-6 border border-border"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Turvallisuus
                  </h3>
                  <div className="space-y-4">
                    <motion.button
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-primary/50 font-medium"
                    >
                      Vaihda Salasana
                    </motion.button>
                    <motion.button
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground hover:border-primary/50 font-medium"
                    >
                      Näytä Aktiiviset Istunnot
                    </motion.button>
                    <motion.button
                      whileHover={{scale: 1.02}}
                      whileTap={{scale: 0.98}}
                      className="w-full px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 font-medium"
                    >
                      Poista Tili
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
