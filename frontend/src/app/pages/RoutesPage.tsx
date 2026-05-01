import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Search, MapPin, Package, RefreshCw} from 'lucide-react';
import api from '../lib/api';
import {useToast} from '../contexts/ToastContext';
import {useAuth} from '../contexts/AuthContext';

// Mukailee dynaamista koostetta (SQL: SELECT driver, COUNT(orders) jne.)
interface RouteOverview {
  routeId: number; // Esim. päiväkohtainen reitti-ID tai kuskin shift-ID
  shiftTime: string;
  driverName: string;
  area: string;
  vehicleInfo: string;
  completedStops: number; // Paljonko tilauksia on statuksella 'done'
  totalStops: number; // Kaikki kuskille määrätyt tilaukset tänään
  status: 'active' | 'done' | 'pending';
}

const mockRoutesData: RouteOverview[] = [
  {
    routeId: 101,
    shiftTime: '04:40 - 13:40',
    driverName: 'Jari Laakso',
    area: 'Helsinki Pohjois',
    vehicleInfo: 'FGH-234',
    completedStops: 5,
    totalStops: 8,
    status: 'active',
  },
  {
    routeId: 102,
    shiftTime: '06:01 - 16:30',
    driverName: 'Minna Korhonen',
    area: 'Espoo',
    vehicleInfo: 'BCD-891',
    completedStops: 10,
    totalStops: 10,
    status: 'done',
  },
  {
    routeId: 103,
    shiftTime: '07:15 - 18:01',
    driverName: 'Petri Mäkinen',
    area: 'Vantaa',
    vehicleInfo: 'LMN-556',
    completedStops: 3,
    totalStops: 7,
    status: 'active',
  },
  {
    routeId: 104,
    shiftTime: '06:42 - 18:30',
    driverName: 'Sara Virtanen',
    area: 'Järvenpää',
    vehicleInfo: 'QRS-112',
    completedStops: 0,
    totalStops: 9,
    status: 'pending',
  },
  {
    routeId: 105,
    shiftTime: '05:16 - 15:30',
    driverName: 'Antti Salo',
    area: 'Tampere',
    vehicleInfo: 'TUV-778',
    completedStops: 11,
    totalStops: 11,
    status: 'done',
  },
  {
    routeId: 106,
    shiftTime: '07:18 - 16:01',
    driverName: 'Laura Heikkilä',
    area: 'Turku',
    vehicleInfo: 'WXY-334',
    completedStops: 4,
    totalStops: 6,
    status: 'active',
  },
  {
    routeId: 107,
    shiftTime: '07:19 - 16:00',
    driverName: 'Mikko Hämäläinen',
    area: 'Lahti',
    vehicleInfo: 'ABC-223',
    completedStops: 0,
    totalStops: 8,
    status: 'pending',
  },
];

const statusStyles = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
    label: 'Ajossa',
    badge: 'bg-green-500',
  },
  done: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
    label: 'Valmis',
    badge: 'bg-blue-500',
  },
  pending: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
    label: 'Odottaa',
    badge: 'bg-amber-500',
  },
};

// Apufunktio nimikirjaimille (esim. "Jari Laakso" -> "JL")
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export function RoutesPage() {
  const {showToast} = useToast();
  const {token} = useAuth();
  const [routes, setRoutes] = useState<RouteOverview[]>(mockRoutesData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'done' | 'pending'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    void fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchRoutes = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/analytics/orders');
      const stats: Array<{status: string; count: number}> =
        res.data?.stats || res.data || [];

      if (!Array.isArray(stats) || stats.length === 0) {
        setRoutes(mockRoutesData);
        return;
      }

      const mapped = stats.map((item, idx) => {
        const status =
          item.status === 'done'
            ? 'done'
            : item.status === 'assigned' || item.status === 'in_transit'
              ? 'active'
              : 'pending';
        const totalStops = Number(item.count || 0);
        const completedStops = status === 'done' ? totalStops : 0;
        return {
          routeId: 700 + idx,
          shiftTime: 'N/A',
          driverName: `Status: ${item.status}`,
          area: 'System aggregate',
          vehicleInfo: 'N/A',
          completedStops,
          totalStops,
          status,
        } as RouteOverview;
      });

      setRoutes(mapped);
    } catch (error) {
      setRoutes(mockRoutesData);
      showToast('Virhe reittien latauksessa, näytetään varadata.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchRoutes();
    setIsLoading(false);
    showToast('Reitit päivitetty', 'success');
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesFilter =
      activeFilter === 'all' || route.status === activeFilter;
    const matchesSearch =
      route.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.routeId.toString().includes(searchQuery) ||
      route.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: routes.length,
    active: routes.filter((r) => r.status === 'active').length,
    done: routes.filter((r) => r.status === 'done').length,
    pending: routes.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="font-sans pb-10">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-foreground font-extrabold text-2xl m-0">
            Päivän reitit
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Päivitä
          </button>
        </div>
        <p className="text-muted-foreground text-sm m-0">
          {counts.all} reittiä tänään · {counts.done} valmista
        </p>
      </motion.div>

      {/* Tilastokortit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {(
          [
            {key: 'all', label: 'Kaikki reitit', colorClass: 'text-foreground'},
            {key: 'active', label: 'Ajossa', colorClass: 'text-green-500'},
            {key: 'done', label: 'Valmiina', colorClass: 'text-blue-500'},
            {
              key: 'pending',
              label: 'Odottaa lähtöä',
              colorClass: 'text-amber-500',
            },
          ] as const
        ).map((item, idx) => (
          <motion.div
            key={item.key}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            whileHover={{y: -2}}
            onClick={() => setActiveFilter(item.key)}
            className={`bg-card rounded-2xl p-5 shadow-sm border cursor-pointer transition-all ${
              activeFilter === item.key
                ? 'border-primary ring-1 ring-primary/50'
                : 'border-border'
            }`}
          >
            <div
              className={`text-3xl font-extrabold leading-none mb-2 ${item.colorClass}`}
            >
              {counts[item.key]}
            </div>
            <div className="text-muted-foreground text-sm font-medium">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hakupalkki */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.3}}
        className="mb-6"
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Hae kuskia, aluetta tai ajoneuvoa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
          />
        </div>
      </motion.div>

      {/* Päätaulukko */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.4}}
        className={`bg-card rounded-2xl shadow-sm border border-border overflow-hidden transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  'REITTI ID',
                  'KULJETTAJA',
                  'ALUE',
                  'AJONEUVO',
                  'PYSÄHDYKSET',
                  'EDISTYMINEN',
                  'TILA',
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
              <AnimatePresence>
                {filteredRoutes.map((route, i) => {
                  const st = statusStyles[route.status];
                  // LASKETAAN PROSENTTI FRONTENDISSÄ:
                  const progressPercentage =
                    route.totalStops > 0
                      ? Math.round(
                          (route.completedStops / route.totalStops) * 100
                        )
                      : 0;

                  return (
                    <motion.tr
                      key={route.routeId}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{delay: i * 0.02}}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-foreground text-sm">
                          #{route.routeId}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {route.shiftTime}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* LASKETAAN NIMIKIRJAIMET LENNKOSTA */}
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {getInitials(route.driverName)}
                          </div>
                          <span className="text-sm text-foreground font-semibold">
                            {route.driverName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                          <MapPin size={14} /> {route.area}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                          <Package size={14} /> {route.vehicleInfo}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground font-bold">
                        {route.completedStops}{' '}
                        <span className="text-muted-foreground font-medium mx-1">
                          /
                        </span>{' '}
                        {route.totalStops}
                      </td>
                      <td className="p-4 min-w-[140px]">
                        <div>
                          <div className="bg-muted rounded-full h-2.5 overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${st.badge}`}
                              style={{width: `${progressPercentage}%`}}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {progressPercentage}% valmiina
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span
                          className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${st.bg} ${st.color}`}
                        >
                          {st.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Tyhjä tila */}
        {filteredRoutes.length === 0 && !isLoading && (
          <div className="p-12 text-center text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium m-0">
              Ei reittejä löytynyt hakuehdoilla.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
