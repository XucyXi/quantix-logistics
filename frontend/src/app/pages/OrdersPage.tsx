import {useState} from 'react';
import {motion} from 'motion/react';
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  store: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  time: string;
}

const ordersData: Order[] = [
  {
    id: 'TIL-2024-001',
    customerName: 'K-Market Kallio',
    store: 'Helsinki',
    items: 24,
    total: 1240.5,
    status: 'completed',
    date: '2026-04-21',
    time: '08:30',
  },
  {
    id: 'TIL-2024-002',
    customerName: 'S-Market Espoo',
    store: 'Espoo',
    items: 18,
    total: 890.0,
    status: 'processing',
    date: '2026-04-21',
    time: '09:15',
  },
  {
    id: 'TIL-2024-003',
    customerName: 'Alepa Kamppi',
    store: 'Helsinki',
    items: 12,
    total: 560.75,
    status: 'pending',
    date: '2026-04-21',
    time: '10:00',
  },
  {
    id: 'TIL-2024-004',
    customerName: 'Lidl Vantaa',
    store: 'Vantaa',
    items: 32,
    total: 1890.25,
    status: 'completed',
    date: '2026-04-21',
    time: '07:45',
  },
  {
    id: 'TIL-2024-005',
    customerName: 'K-Citymarket',
    store: 'Tampere',
    items: 45,
    total: 2340.0,
    status: 'processing',
    date: '2026-04-21',
    time: '08:00',
  },
  {
    id: 'TIL-2024-006',
    customerName: 'Prisma Turku',
    store: 'Turku',
    items: 28,
    total: 1450.5,
    status: 'cancelled',
    date: '2026-04-20',
    time: '16:30',
  },
];

const statusStyles = {
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
    label: 'Odottaa',
    icon: Clock,
  },
  processing: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
    label: 'Käsittelyssä',
    icon: Package,
  },
  completed: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
    label: 'Valmis',
    icon: CheckCircle,
  },
  cancelled: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    color: 'text-red-600 dark:text-red-400',
    label: 'Peruttu',
    icon: XCircle,
  },
};

export function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>(
    'all'
  );

  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.store.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: ordersData.length,
    pending: ordersData.filter((o) => o.status === 'pending').length,
    processing: ordersData.filter((o) => o.status === 'processing').length,
    completed: ordersData.filter((o) => o.status === 'completed').length,
  };

  return (
    <div className="font-sans">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <h1 className="text-foreground font-extrabold text-2xl mb-2">
          Tilaukset
        </h1>
        <p className="text-muted-foreground text-sm m-0">
          {stats.total} tilausta yhteensä · {stats.completed} valmista
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Yhteensä',
            value: stats.total,
            colorClass: 'text-foreground',
          },
          {
            label: 'Odottaa',
            value: stats.pending,
            colorClass: 'text-amber-500',
          },
          {
            label: 'Käsittelyssä',
            value: stats.processing,
            colorClass: 'text-blue-500',
          },
          {
            label: 'Valmiit',
            value: stats.completed,
            colorClass: 'text-green-500',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border"
          >
            <div
              className={`text-3xl font-extrabold mb-2 leading-none ${stat.colorClass}`}
            >
              {stat.value}
            </div>
            <div className="text-muted-foreground text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>

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
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border-2 border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
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
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border-2 border-border bg-input-background text-foreground text-sm outline-none cursor-pointer transition-colors focus:border-primary appearance-none"
          >
            <option value="all">Kaikki tilaukset</option>
            <option value="pending">Odottaa</option>
            <option value="processing">Käsittelyssä</option>
            <option value="completed">Valmis</option>
            <option value="cancelled">Peruttu</option>
          </select>
        </div>
      </div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.3}}
        className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  'TILAUSNUMERO',
                  'ASIAKAS',
                  'KAUPPA',
                  'TUOTTEET',
                  'SUMMA',
                  'PÄIVÄMÄÄRÄ',
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
                      {order.id}
                    </td>
                    <td className="p-4 text-foreground text-sm">
                      {order.customerName}
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {order.store}
                    </td>
                    <td className="p-4 text-foreground font-semibold text-sm">
                      {order.items} kpl
                    </td>
                    <td className="p-4 text-foreground font-bold text-sm">
                      {order.total.toFixed(2)} €
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {order.date}
                      <br />
                      <span className="text-xs opacity-70">{order.time}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${st.bg} ${st.color}`}
                      >
                        <StatusIcon size={14} /> {st.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Ei tilauksia löytynyt hakuehdoilla.
          </div>
        )}
      </motion.div>
    </div>
  );
}
