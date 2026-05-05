import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Search, MapPin, Package, RefreshCw, AlertCircle} from 'lucide-react';
import {useToast} from '../contexts/ToastContext';
import {orderService} from '../services/orderService';
import {userService} from '../services/userService';

// Päivitetty interface heijastamaan tarkempia tiloja
interface DriverRouteOverview {
  driverId: number;
  driverName: string;
  vehicleInfo: string;
  area: string;
  completedStops: number;
  activeStops: number; // Tilaukset statuksilla assigned, in_progress, ready, in_transit
  totalStops: number;
  status: 'driving' | 'preparing' | 'done';
}

const statusStyles = {
  driving: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
    label: 'Matkalla',
    badge: 'bg-green-500',
  },
  preparing: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
    label: 'Käsittelyssä',
    badge: 'bg-amber-500',
  },
  done: {
    bg: 'bg-slate-100 dark:bg-slate-800/30',
    color: 'text-slate-600 dark:text-slate-400',
    label: 'Vapaa / Valmis',
    badge: 'bg-slate-500',
  },
};

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
  const [routes, setRoutes] = useState<DriverRouteOverview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'driving' | 'preparing' | 'done'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRoutes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [allUsers, allOrders] = await Promise.all([
        userService.getAllUsers(),
        orderService.getAllOrdersAdmin(),
      ]);

      const drivers = allUsers.filter((u) => u.role === 'Kuljettaja');

      const routeData: DriverRouteOverview[] = drivers.map((driver) => {
        const driverOrders = allOrders.filter(
          (o) => o.driver_id === driver.original_id
        );

        const completed = driverOrders.filter(
          (o) => o.status === 'done'
        ).length;
        // Kuinka moni tilaus on varsinaisesti matkalla
        const driving = driverOrders.filter(
          (o) => o.status === 'in_transit'
        ).length;
        // Kuinka moni on yhä varastoprosessissa
        const preparing = driverOrders.filter((o) =>
          ['assigned', 'in_progress', 'ready_for_pickup'].includes(o.status)
        ).length;

        const active = driving + preparing;
        const total = driverOrders.length;

        // Tarkempi statuksen määritys
        let status: 'driving' | 'preparing' | 'done' = 'done';
        if (driving > 0) {
          status = 'driving';
        } else if (preparing > 0) {
          status = 'preparing';
        }

        return {
          driverId: driver.original_id,
          driverName: driver.name,
          vehicleInfo: 'Pakettiauto',
          area: 'Pääkaupunkiseutu',
          completedStops: completed,
          activeStops: active,
          totalStops: total,
          status: status,
        };
      });

      // Järjestetään niin, että ajossa olevat ovat ylimpänä, sitten käsittelyssä, sitten vapaat
      routeData.sort((a, b) => {
        const rank = {driving: 1, preparing: 2, done: 3};
        return rank[a.status] - rank[b.status];
      });

      setRoutes(routeData);
    } catch (err) {
      console.error('Virhe reittien latauksessa:', err);
      setError('Kuljettajien tilanteen lataaminen epäonnistui.');
      showToast('Virhe tietojen latauksessa.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await fetchRoutes();
    if (!error) {
      showToast('Kuljettajien tilanne päivitetty', 'success');
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const matchesFilter =
      activeFilter === 'all' || route.status === activeFilter;
    const matchesSearch =
      route.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.driverId.toString().includes(searchQuery) ||
      route.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.vehicleInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: routes.length,
    driving: routes.filter((r) => r.status === 'driving').length,
    preparing: routes.filter((r) => r.status === 'preparing').length,
    done: routes.filter((r) => r.status === 'done').length,
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
            Kuljettajien tilanne
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
          {counts.all} kuljettajaa järjestelmässä · {counts.driving} parhaillaan
          tiellä
        </p>
      </motion.div>

      {/* Tilastokortit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {(
          [
            {
              key: 'all',
              label: 'Kaikki kuljettajat',
              colorClass: 'text-foreground',
            },
            {key: 'driving', label: 'Matkalla', colorClass: 'text-green-500'},
            {
              key: 'preparing',
              label: 'Käsittelyssä',
              colorClass: 'text-amber-500',
            },
            {
              key: 'done',
              label: 'Vapaana / Valmis',
              colorClass: 'text-slate-500',
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

      {error && (
        <div className="mb-6 text-center py-5 text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex justify-center items-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Päätaulukko */}
      {!error && (
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
                    'KUSKI ID',
                    'KULJETTAJA',
                    'ALUE',
                    'AJONEUVO',
                    'TYÖLISTALLA',
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
                    const progressPercentage =
                      route.totalStops > 0
                        ? Math.round(
                            (route.completedStops / route.totalStops) * 100
                          )
                        : 100;

                    return (
                      <motion.tr
                        key={route.driverId}
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{delay: i * 0.02}}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-foreground text-sm">
                            D-{String(route.driverId).padStart(3, '0')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ${route.status === 'driving' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                            >
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
                          {route.activeStops > 0 ? (
                            <span
                              className={
                                route.status === 'driving'
                                  ? 'text-green-600'
                                  : 'text-amber-600'
                              }
                            >
                              {route.activeStops} toimitusta
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              0 toimitusta
                            </span>
                          )}
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
                              {progressPercentage}% valmiina (
                              {route.completedStops}/{route.totalStops})
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

          {filteredRoutes.length === 0 && !isLoading && (
            <div className="p-12 text-center text-muted-foreground">
              <Package size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium m-0">
                Ei kuljettajia löytynyt hakuehdoilla.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
