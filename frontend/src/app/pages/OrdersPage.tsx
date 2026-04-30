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
} from 'lucide-react';
// import api from '../lib/api'; // Ota käyttöön backend-vaiheessa

// Päivitetty interface vastaamaan SQL-taulua (ID numeroksi, lisätty osoite ja notes)
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
    | 'stuck';
  orderedAt: string;
  deliveryAddress: string;
  notes: string | null;
  driverId: number | null;
}

// Mock-kuskit (ID:t nyt numeroita tietokannan mukaan)
const availableDrivers = [
  {id: 1, name: 'Jari Laakso', status: 'active'},
  {id: 2, name: 'Teppo K.', status: 'active'},
  {id: 3, name: 'Sari Virtanen', status: 'inactive'},
];

const initialOrders: Order[] = [
  {
    id: 1001,
    customerName: 'K-Market Kallio',
    store: 'Helsinki',
    items: 24,
    total: 1240.5,
    status: 'done',
    orderedAt: '2026-04-21T08:30:00',
    deliveryAddress: 'Hämeentie 1, 00530 Helsinki',
    notes: 'Toimitus takaovelle.',
    driverId: 1,
  },
  {
    id: 1002,
    customerName: 'S-Market Espoo',
    store: 'Espoo',
    items: 18,
    total: 890.0,
    status: 'in_progress',
    orderedAt: '2026-04-21T09:15:00',
    deliveryAddress: 'Länsiväylä 5, 02100 Espoo',
    notes: null,
    driverId: 2,
  },
  {
    id: 1003,
    customerName: 'Alepa Kamppi',
    store: 'Helsinki',
    items: 12,
    total: 560.75,
    status: 'pending',
    orderedAt: '2026-04-21T10:00:00',
    deliveryAddress: 'Kampinkuja 2, 00100 Helsinki',
    notes: 'Soita kuskille kun olet perillä: 0401234567',
    driverId: null,
  },
];

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
};

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>(
    'all'
  );

  // Uusi tila modaalin hallintaan
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  // KUSKIN MÄÄRÄÄMINEN (Nyt myös päivittää avatun modaalin tilan!)
  const handleAssignDriver = async (orderId: number, driverId: string) => {
    const dId = driverId === '' ? null : parseInt(driverId, 10);

    // Pakotetaan tyyppi oikeaksi lisäämällä ": Order['status']", m
    const newStatus: Order['status'] = dId ? 'assigned' : 'pending';

    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? {...order, driverId: dId, status: newStatus}
        : order
    );

    setOrders(updatedOrders);

    // Jos modaali on auki samalle tilaukselle, päivitetään se heti
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({...viewingOrder, driverId: dId, status: newStatus});
    }

    /* BACKEND INTEGRAATIO:
    try {
      await api.patch(`/orders/${orderId}/driver`, { driver_id: dId });
    } catch(e) {
      console.error(e);
      alert("Virhe kuskin vaihdossa!");
    }
    */
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.store.toLowerCase().includes(searchQuery.toLowerCase());
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

  // Apufunktio päivämäärän muotoiluun (2026-04-21T08:30:00 -> 21.4.2026 klo 08:30)
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
            <option value="in_progress">Keräilyssä</option>
            <option value="in_transit">Matkalla</option>
            <option value="done">Toimitettu</option>
          </select>
        </div>
      </div>

      {/* Päätaulukko */}
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
                const driverName = availableDrivers.find(
                  (d) => d.id === order.driverId
                )?.name;

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
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {order.store}
                      </div>
                    </td>
                    <td className="p-4 text-foreground font-semibold text-sm">
                      {order.items} kpl{' '}
                      <span className="text-muted-foreground font-normal ml-1">
                        ({order.total.toFixed(2)} €)
                      </span>
                    </td>

                    {/* Yksinkertaistettu kuski-näkyvyys taulukossa */}
                    <td className="p-4">
                      {driverName ? (
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">
                            {driverName.charAt(0)}
                          </div>
                          {driverName}
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

                    {/* UUSI NAPPI: Näytä tiedot */}
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
        </div>
      </motion.div>

      {/* MODAALI: TILAUSKORTTI */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-6">
              {/* Asiakas & Osoite */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-input-background border border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User size={14} /> Asiakkaan tiedot
                  </h3>
                  <div className="font-semibold text-foreground text-base">
                    {viewingOrder.customerName}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {viewingOrder.store}
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

              {/* Lisätiedot (Notes) */}
              {viewingOrder.notes && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <FileText size={14} /> Tilauksen lisätiedot / Huomiot
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-200 m-0 italic">
                    "{viewingOrder.notes}"
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
                      viewingOrder.status === 'stuck'
                    }
                  >
                    <option value="">-- Odottaa: Valitse kuljettaja --</option>
                    {availableDrivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}{' '}
                        {driver.status === 'inactive' ? '(Ei vuorossa)' : ''}
                      </option>
                    ))}
                  </select>
                  {viewingOrder.status === 'done' && (
                    <span className="text-xs text-muted-foreground italic">
                      Toimitettua tilausta ei voi muuttaa
                    </span>
                  )}
                </div>
              </div>

              {/* Yhteenveto (Items & Total) */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
