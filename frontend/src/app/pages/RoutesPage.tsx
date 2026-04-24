import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Search, MapPin, Package} from 'lucide-react';

interface Route {
  id: string;
  time: string;
  driver: string;
  initials: string;
  area: string;
  truck: string;
  stops: string;
  progress: number;
  status: 'active' | 'done' | 'pending';
}

const routesData: Route[] = [
  {
    id: 'R-2401',
    time: '04:40 - 13:40',
    driver: 'Jukka Leinonen',
    initials: 'JL',
    area: 'Helsinki Pohjois',
    truck: 'FGH-234',
    stops: '5 / 8',
    progress: 62,
    status: 'active',
  },
  {
    id: 'R-2402',
    time: '06:01 - 16:30',
    driver: 'Minna Korhonen',
    initials: 'MK',
    area: 'Espoo',
    truck: 'BCD-891',
    stops: '10 / 10',
    progress: 100,
    status: 'done',
  },
  {
    id: 'R-2403',
    time: '07:15 - 18:01',
    driver: 'Petri Mäkinen',
    initials: 'PM',
    area: 'Vantaa',
    truck: 'LMN-556',
    stops: '3 / 7',
    progress: 43,
    status: 'active',
  },
  {
    id: 'R-2404',
    time: '06:42 - 18:30',
    driver: 'Sara Virtanen',
    initials: 'SV',
    area: 'Järvenpää',
    truck: 'QRS-112',
    stops: '0 / 9',
    progress: 0,
    status: 'pending',
  },
  {
    id: 'R-2405',
    time: '05:16 - 15:30',
    driver: 'Antti Salo',
    initials: 'AS',
    area: 'Tampere',
    truck: 'TUV-778',
    stops: '11 / 11',
    progress: 100,
    status: 'done',
  },
  {
    id: 'R-2406',
    time: '07:18 - 16:01',
    driver: 'Laura Heikkilä',
    initials: 'LH',
    area: 'Turku',
    truck: 'WXY-334',
    stops: '4 / 6',
    progress: 67,
    status: 'active',
  },
  {
    id: 'R-2407',
    time: '07:19 - 16:00',
    driver: 'Mikko Hämäläinen',
    initials: 'MH',
    area: 'Lahti',
    truck: 'ABC-223',
    stops: '0 / 8',
    progress: 0,
    status: 'pending',
  },
  {
    id: 'R-2408',
    time: '06:15 - 16:18',
    driver: 'Tiina Lehtonen',
    initials: 'TL',
    area: 'Helsinki Etelämeri',
    truck: 'BEF-445',
    stops: '6 / 6',
    progress: 100,
    status: 'done',
  },
];

const statusStyles = {
  active: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    color: 'text-green-600 dark:text-green-400',
    label: 'Aktiivinen',
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

export function RoutesPage() {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'done' | 'pending'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = routesData.filter((route) => {
    const matchesFilter =
      activeFilter === 'all' || route.status === activeFilter;
    const matchesSearch =
      route.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.truck.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: routesData.length,
    active: routesData.filter((r) => r.status === 'active').length,
    done: routesData.filter((r) => r.status === 'done').length,
    pending: routesData.filter((r) => r.status === 'pending').length,
  };

  return (
    <div className="font-sans">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-foreground font-extrabold text-2xl m-0">
            Reittien hallinta
          </h1>
          <button className="px-4 py-2 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90">
            Päivitä
          </button>
        </div>
        <p className="text-muted-foreground text-sm m-0">
          {counts.all} reittiä tänään · {counts.done} valmista
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {(
          [
            {key: 'all', label: 'Kaikki reitit', colorClass: 'text-foreground'},
            {key: 'active', label: 'Aktiivisia', colorClass: 'text-green-500'},
            {key: 'done', label: 'Valmiita', colorClass: 'text-blue-500'},
            {key: 'pending', label: 'Odottaa', colorClass: 'text-amber-500'},
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
            <div className="text-muted-foreground text-sm">{item.label}</div>
          </motion.div>
        ))}
      </div>

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
            placeholder="Hae reittinumero, kuljettajaa, alue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 rounded-xl border-2 border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.4}}
        className="bg-card rounded-2xl p-4 mb-4 flex gap-3 shadow-sm border border-border"
      >
        {[
          {key: 'all', label: 'Kaikki'},
          {key: 'active', label: 'Aktiiviset'},
          {key: 'done', label: 'Valmis'},
          {key: 'pending', label: 'Odottaa'},
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
            className={`px-5 py-2 rounded-lg border-none cursor-pointer text-sm font-semibold transition-all ${
              activeFilter === tab.key
                ? 'bg-foreground text-background'
                : 'bg-transparent text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.5}}
        className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {[
                  'REITTI',
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
                  return (
                    <motion.tr
                      key={route.id}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{delay: i * 0.02}}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-bold text-foreground text-sm">
                            {route.id}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {route.time}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                            {route.initials}
                          </div>
                          <span className="text-sm text-foreground font-medium">
                            {route.driver}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin size={14} /> {route.area}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Package size={14} /> {route.truck}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground font-semibold">
                        {route.stops}{' '}
                        <span className="text-muted-foreground font-normal">
                          paikkoja
                        </span>
                      </td>
                      <td className="p-4 min-w-[140px]">
                        <div>
                          <div className="bg-muted rounded-lg h-2 overflow-hidden mb-1.5">
                            <div
                              className={`h-full rounded-lg transition-all duration-300 ${st.badge}`}
                              style={{width: `${route.progress}%`}}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {route.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${st.bg} ${st.color}`}
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
        {filteredRoutes.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Ei reittejä löytynyt hakuehdoilla.
          </div>
        )}
      </motion.div>
    </div>
  );
}
