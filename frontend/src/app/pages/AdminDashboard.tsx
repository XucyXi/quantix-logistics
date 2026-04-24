import {useState} from 'react';
import {motion, useMotionValue, useTransform, PanInfo} from 'motion/react';
import {
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  MapPin,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const statCards = [
  {label: 'Reittejä', value: '12', icon: Truck, color: 'text-blue-500'},
  {label: 'Toimitettu', value: '284', icon: Package, color: 'text-green-500'},
  {label: 'Hälytykset', value: '4', icon: AlertTriangle, color: 'text-red-500'},
];

const initialRoutes = [
  {
    id: 'R-2401',
    driver: 'Jukka Leinonen',
    truck: 'FGH-234',
    stops: 8,
    done: 6,
    status: 'active',
    area: 'Helsinki P',
  },
  {
    id: 'R-2404',
    driver: 'Sara Virtanen',
    truck: 'QRS-112',
    stops: 9,
    done: 0,
    status: 'pending',
    area: 'Järvenpää',
  },
  {
    id: 'R-2406',
    driver: 'Laura Heikkilä',
    truck: 'WXY-334',
    stops: 6,
    done: 4,
    status: 'active',
    area: 'Turku',
  },
];

const alerts = [
  {
    type: 'warning',
    msg: 'R-2404 lähtö myöhässä 15 min – Järvenpää reitti',
    time: '9:45',
  },
  {type: 'info', msg: 'Uusi tilaus: K-Market Lahti – 48 boksia', time: '9:32'},
];

interface SwipeCardProps {
  route: (typeof initialRoutes)[0];
  onApprove: (id: string) => void;
}

function SwipeableRouteCard({route, onApprove}: SwipeCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['var(--color-destructive)', 'var(--color-card)', '#16a34a']
  );

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onApprove(route.id);
      x.set(0);
    } else {
      x.set(0);
    }
  };

  return (
    <motion.div className="relative mb-4 touch-pan-y">
      <motion.div
        className="absolute inset-0 rounded-2xl flex items-center justify-between px-6"
        style={{background}}
      >
        <div className="text-white font-extrabold text-lg">✕ Peruuta</div>
        <div className="flex items-center gap-2 text-white font-extrabold text-lg">
          Vahvista <CheckCircle size={26} />
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{left: 0, right: 0}}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{x}}
        className="bg-card rounded-2xl p-6 shadow-sm border border-border relative cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between mb-4">
          <h3 className="text-2xl font-extrabold text-foreground m-0">
            {route.id}
          </h3>
          <span
            className={`px-3.5 py-1.5 rounded-full text-sm font-extrabold ${
              route.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            }`}
          >
            {route.status === 'active' ? 'AJOSSA' : 'ODOTTAA'}
          </span>
        </div>
        <div className="flex flex-col gap-3 text-muted-foreground text-base font-semibold">
          <div className="flex items-center gap-3">
            <Truck size={22} className="text-muted-foreground" /> {route.driver}{' '}
            ({route.truck})
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={22} className="text-muted-foreground" /> {route.area}
          </div>
          <div className="flex items-center gap-3">
            <Package size={22} className="text-muted-foreground" /> {route.done}{' '}
            / {route.stops} paikkaa hoidettu
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminDashboard() {
  const [routes, setRoutes] = useState(initialRoutes);

  const handleApprove = (id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="font-sans min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-blue-900 dark:from-sidebar dark:to-background p-8 text-primary-foreground rounded-b-3xl shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-extrabold m-0 mb-1">Ajokeskus</h1>
            <p className="text-primary-foreground/70 m-0 text-lg">
              Tilannekatsaus
            </p>
          </div>
          <button className="w-14 h-14 rounded-2xl bg-white/10 border-none text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
            <RefreshCw size={28} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/10 rounded-2xl p-5 text-center backdrop-blur-sm"
            >
              <div className="text-3xl font-extrabold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-foreground mb-4">
          Huomiota vaativat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-5 p-6 rounded-2xl border-2 ${
                alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/50'
              }`}
            >
              <AlertTriangle
                size={36}
                className={`shrink-0 ${
                  alert.type === 'warning'
                    ? 'text-amber-600 dark:text-amber-500'
                    : 'text-blue-600 dark:text-blue-500'
                }`}
              />
              <div className="flex-1">
                <div className="text-foreground font-extrabold text-lg mb-1">
                  {alert.msg}
                </div>
                <div className="text-muted-foreground text-sm font-semibold">
                  Tänään klo {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-4">
          Avoimet reitit ({routes.length})
        </h2>
        {routes.length > 0 ? (
          routes.map((r) => (
            <SwipeableRouteCard
              key={r.id}
              route={r}
              onApprove={handleApprove}
            />
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle
              size={64}
              className="mx-auto mb-4 opacity-50 text-green-500"
            />
            <p className="text-xl font-bold">Kaikki reitit vahvistettu!</p>
          </div>
        )}

        <h2 className="text-2xl font-extrabold text-foreground mt-10 mb-4">
          Pikatoiminnot
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center justify-between p-7 bg-card border-2 border-border rounded-2xl text-xl font-extrabold text-foreground hover:bg-accent hover:border-primary transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package
                  size={28}
                  className="text-amber-600 dark:text-amber-500"
                />
              </div>
              Uusi pikatilaus
            </div>
            <ArrowRight
              size={28}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </button>
          <button className="flex items-center justify-between p-7 bg-card border-2 border-border rounded-2xl text-xl font-extrabold text-foreground hover:bg-accent hover:border-primary transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck
                  size={28}
                  className="text-green-600 dark:text-green-500"
                />
              </div>
              Hallitse kuljettajia
            </div>
            <ArrowRight
              size={28}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
