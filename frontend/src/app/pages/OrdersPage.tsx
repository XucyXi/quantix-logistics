import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Truck,
  X,
  MapPin,
  FileText,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';
import {orderService} from '../services/orderService';
import {userService, User as AppUser} from '../services/userService';

interface Order {
  id: number;
  customerName: string;
  store: string;
  items: number;
  total: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'in_transit'
    | 'done'
    | 'stuck'
    | 'cancelled';
  orderedAt: string;
  deliveryAddress: string;
  notes: string | null;
  driverId: number | null;
  driverName: string | null;
}

const statusStyles = {
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
    label: 'Odottaa kuskia',
    icon: Clock,
  },
  assigned: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    color: 'text-indigo-600 dark:text-indigo-400',
    label: 'Kuski määrätty',
    icon: User,
  },
  in_progress: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
    label: 'Keräilyssä',
    icon: Package,
  },
  ready_for_pickup: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    color: 'text-teal-600 dark:text-teal-400',
    label: 'Odottaa noutoa',
    icon: MapPin,
  },
  in_transit: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    color: 'text-purple-600 dark:text-purple-400',
    label: 'Matkalla',
    icon: Truck,
  },
  done: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
    label: 'Toimitettu',
    icon: CheckCircle,
  },
  stuck: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    color: 'text-red-600 dark:text-red-400',
    label: 'Ongelma',
    icon: XCircle,
  },
  cancelled: {
    bg: 'bg-slate-200 dark:bg-slate-800',
    color: 'text-slate-600 dark:text-slate-400',
    label: 'Peruutettu',
    icon: XCircle,
  },
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>(
    'all'
  );
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // Haetaan tilaukset ja kuskit tietokannasta
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rawOrders, allUsers] = await Promise.all([
          orderService.getAllOrdersAdmin(),
          userService.getAllUsers(),
        ]);

        // Suodatetaan käyttäjistä vain kuskit
        setDrivers(allUsers.filter((u) => u.role === 'Kuljettaja'));

        // Mapatataan backendin data frontendin tarvitsemaan muotoon
        const mappedOrders: Order[] = rawOrders.map((o) => ({
          id: o.order_id,
          customerName: o.customerName,
          store: 'Yritysasiakas', // Voidaan hakea profiilista myöhemmin jos tarvis
          items: Number(o.items_count) || 0,
          total: parseFloat(String(o.total_price)),
          status: o.status,
          orderedAt: o.ordered_at,
          deliveryAddress: o.delivery_address,
          notes: o.notes,
          driverId: o.driver_id,
          driverName: o.driverName || null,
        }));

        setOrders(mappedOrders);
      } catch (err) {
        console.error('Virhe tilausten haussa:', err);
        setError('Tilausten lataaminen epäonnistui.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KUSKIN MÄÄRÄÄMINEN
  const handleAssignDriver = async (orderId: number, driverIdStr: string) => {
    const dId = driverIdStr === '' ? null : parseInt(driverIdStr, 10);
    const newStatus: Order['status'] = dId ? 'assigned' : 'pending';

    // Etsitään kuskin nimi näkyviin heti
    const driverName = dId
      ? drivers.find((d) => d.original_id === dId)?.name || null
      : null;

    try {
      // 1. Backend-kutsu (päivittää kannan statuksen ja driver_id:n)
      await orderService.assignDriver(orderId, dId);

      // 2. Päivitetään paikallinen tila
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? {...order, driverId: dId, driverName: driverName, status: newStatus}
          : order
      );
      setOrders(updatedOrders);

      // Päivitetään avattu modaali
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({
          ...viewingOrder,
          driverId: dId,
          driverName: driverName,
          status: newStatus,
        });
      }
    } catch (err) {
      console.error(err);
      alert('Virhe kuskin vaihdossa. Tarkista yhteys.');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (
      !window.confirm(
        'Haluatko varmasti peruuttaa tämän tilauksen? Tätä ei voi perua.'
      )
    )
      return;
    try {
      await orderService.cancelOrder(orderId);
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? {...order, status: 'cancelled' as const} : order
      );
      setOrders(updatedOrders);
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({...viewingOrder, status: 'cancelled'});
      }
    } catch {
      alert('Tilauksen peruuttaminen epäonnistui.');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    active: orders.filter((o) =>
      ['assigned', 'in_progress', 'ready_for_pickup', 'in_transit'].includes(
        o.status
      )
    ).length,
    completed: orders.filter((o) => o.status === 'done').length,
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} klo ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-sans relative">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <h1 className="text-foreground font-extrabold text-2xl mb-2">
          Tilaukset
        </h1>
        <p className="text-muted-foreground text-sm m-0">
          {stats.total} tilausta yhteensä · {stats.completed} toimitettu
        </p>
      </motion.div>

      {/* Tilastokortit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="text-3xl font-extrabold mb-2 leading-none text-foreground">
            {stats.total}
          </div>
          <div className="text-muted-foreground text-sm">Yhteensä</div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="text-3xl font-extrabold mb-2 leading-none text-amber-500">
            {stats.pending}
          </div>
          <div className="text-muted-foreground text-sm">Odottaa kuskia</div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="text-3xl font-extrabold mb-2 leading-none text-blue-500">
            {stats.active}
          </div>
          <div className="text-muted-foreground text-sm">Aktiivisena</div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <div className="text-3xl font-extrabold mb-2 leading-none text-green-500">
            {stats.completed}
          </div>
          <div className="text-muted-foreground text-sm">Toimitettu</div>
        </div>
      </div>

      {/* Hakupalkit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Hae tilausnumero, asiakas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="relative">
          <Filter
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-ring appearance-none"
          >
            <option value="all">Kaikki tilaukset</option>
            <option value="pending">Odottaa kuskia</option>
            <option value="assigned">Kuski määrätty</option>
            <option value="in_progress">Keräilyssä</option>
            <option value="in_transit">Matkalla</option>
            <option value="done">Toimitettu</option>
            <option value="cancelled">Peruutettu</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          Ladataan tilauksia...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex justify-center items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      ) : (
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
        >
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {[
                    'TILAUS',
                    'ASIAKAS',
                    'TUOTTEET',
                    'KULJETTAJA',
                    'TILA',
                    '',
                  ].map((h, idx) => (
                    <th
                      key={idx}
                      className="p-4 text-left text-xs font-bold text-muted-foreground tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => {
                  const st = statusStyles[order.status];
                  const StatusIcon = st.icon;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4 font-bold text-foreground text-sm">
                        #{order.id}
                      </td>
                      <td className="p-4 text-foreground text-sm">
                        {order.customerName}
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">
                          {order.deliveryAddress}
                        </div>
                      </td>
                      <td className="p-4 text-foreground font-semibold text-sm">
                        {order.items} kpl{' '}
                        <span className="text-muted-foreground font-normal ml-1">
                          ({order.total.toFixed(2)} €)
                        </span>
                      </td>

                      <td className="p-4">
                        {order.driverName ? (
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                              {order.driverName.charAt(0)}
                            </div>
                            {order.driverName}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">
                            Ei kuskia
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}
                        >
                          <StatusIcon size={14} /> {st.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                        >
                          <Eye size={16} /> Näytä tiedot
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Ei tilauksia.
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* MODAALI: TILAUSKORTTI */}
      {viewingOrder && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setViewingOrder(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground m-0 flex items-center gap-3">
                  Tilaus #{viewingOrder.id}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyles[viewingOrder.status].bg} ${statusStyles[viewingOrder.status].color}`}
                  >
                    {statusStyles[viewingOrder.status].label}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar size={14} /> Tilaus vastaanotettu:{' '}
                  {formatDate(viewingOrder.orderedAt)}
                </p>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-input-background border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={14} /> Asiakkaan tiedot
                  </h3>
                  <div className="font-semibold text-foreground text-base">
                    {viewingOrder.customerName}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-input-background border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin size={14} /> Toimitusosoite
                  </h3>
                  <div className="text-sm text-foreground font-medium leading-relaxed">
                    {viewingOrder.deliveryAddress}
                  </div>
                </div>
              </div>

              {viewingOrder.notes && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={14} /> Tilauksen lisätiedot / Huomiot
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 m-0 italic">
                    &quot;{viewingOrder.notes}&quot;
                  </p>
                </div>
              )}

              {/* Kuljettajan hallinta */}
              <div className="p-4 rounded-xl border border-border">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck size={14} /> Kuljettajan hallinta
                </h3>
                <div className="flex items-center gap-4">
                  <select
                    value={viewingOrder.driverId || ''}
                    onChange={(e) =>
                      handleAssignDriver(viewingOrder.id, e.target.value)
                    }
                    className="flex-1 p-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground font-medium outline-none focus:ring-2 focus:ring-ring"
                    disabled={
                      viewingOrder.status === 'done' ||
                      viewingOrder.status === 'cancelled' ||
                      viewingOrder.status === 'stuck'
                    }
                  >
                    <option value="">-- Odottaa: Valitse kuljettaja --</option>
                    {drivers.map((driver) => (
                      <option
                        key={driver.original_id}
                        value={driver.original_id}
                      >
                        {driver.name}{' '}
                        {driver.activeOrders
                          ? `(${driver.activeOrders} ajossa)`
                          : '(Vapaana)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-xl">
                <div>
                  <div className="text-sm opacity-80 mb-1">
                    Tuotteita yhteensä
                  </div>
                  <div className="text-xl font-bold">
                    {viewingOrder.items} kpl
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-80 mb-1">Tilauksen arvo</div>
                  <div className="text-2xl font-extrabold">
                    {viewingOrder.total.toFixed(2)} €
                  </div>
                </div>
              </div>

              {/* Peruuta tilaus -nappi alimpana */}
              {viewingOrder.status !== 'done' &&
                viewingOrder.status !== 'cancelled' && (
                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      onClick={() => handleCancelOrder(viewingOrder.id)}
                      className="text-sm font-semibold text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors"
                    >
                      Peruuta tilaus
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
