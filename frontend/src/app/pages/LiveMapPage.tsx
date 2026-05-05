import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  Activity,
  Loader2,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {orderService} from '../services/orderService';
import {
  AdminMap,
  ActiveDelivery,
} from '../components/delivery-tracking/AdminMap';

export function LiveMapPage() {
  const {token} = useAuth();
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Kellon päivitys viiveiden laskentaa varten (ajetaan vain kerran mountatessa)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Haetaan aktiiviset ajot backendistä turvallisesti
  useEffect(() => {
    if (!token) return;

    let mounted = true;

    const fetchLocations = async () => {
      try {
        const res = await orderService.getAllActiveTracking(token);
        if (res.success && mounted) {
          setDeliveries(res.data);
        }
      } catch (err) {
        console.error('Virhe sijaintien haussa', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLocations();
    // Päivitetään tiedot 10 sekunnin välein
    const interval = setInterval(fetchLocations, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [token]);

  // Lasketaan tilastot: Oletetaan että yli 60s ilman päivitystä = viive/pysähdys
  const activeCount = deliveries.filter((d) => {
    if (!d.updated_at) return false;
    return now - new Date(d.updated_at).getTime() < 60000;
  }).length;

  const idleCount = deliveries.length - activeCount;

  return (
    <div className="font-sans pb-10">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6 flex justify-between items-end"
      >
        <div>
          <h1 className="text-foreground font-extrabold text-2xl mb-2">
            Reaaliaikainen seuranta
          </h1>
          <p className="text-muted-foreground text-sm m-0">
            Seuraa aktiivisia toimituksia ja kuljettajia kartalla
          </p>
        </div>

        {/* Nappi, joka poistaa valinnan ja näyttää kaikki kuskit */}
        {selectedId !== null && (
          <button
            onClick={() => setSelectedId(null)}
            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-bold text-sm transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <MapPin size={16} /> Näytä kaikki
          </button>
        )}
      </motion.div>

      {/* TILASTOKORTIT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Liikkeellä (Alle 1m)',
            value: activeCount,
            icon: Truck,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
          },
          {
            label: 'Pysähdyksissä / Viive',
            value: idleCount,
            icon: Clock,
            colorClass: 'text-amber-500',
            bgClass: 'bg-amber-500/10',
          },
          {
            label: 'Seurattavia reittejä',
            value: deliveries.length,
            icon: Navigation,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Aktiivisia Kuskeja',
            value: new Set(deliveries.map((d) => d.driver_id)).size,
            icon: Activity,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border"
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgClass}`}
              >
                <stat.icon size={20} className={stat.colorClass} />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-foreground leading-none mb-1.5">
              {stat.value}
            </div>
            <div className="text-muted-foreground text-xs font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        {/* KARTTA */}
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
          className="lg:col-span-2 bg-card rounded-2xl p-1 shadow-sm border border-border overflow-hidden relative z-0"
        >
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50 mb-4" />
              <p className="font-bold text-muted-foreground">
                Ladataan karttadataa...
              </p>
            </div>
          ) : (
            <AdminMap deliveries={deliveries} selectedId={selectedId} />
          )}
        </motion.div>

        {/* LISTA TOIMITUKSISTA */}
        <motion.div
          initial={{opacity: 0, x: 20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.3}}
          className="bg-card rounded-2xl p-5 shadow-sm border border-border overflow-y-auto"
        >
          <h3 className="text-foreground font-bold text-base m-0 mb-5 flex justify-between items-center">
            <span>Toimitukset ({deliveries.length})</span>
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </h3>

          <div className="flex flex-col gap-3">
            {!loading && deliveries.length === 0 && (
              <div className="text-center py-10 text-muted-foreground font-medium">
                Ei aktiivisia toimituksia juuri nyt.
              </div>
            )}

            <AnimatePresence>
              {deliveries.map((del) => {
                const secondsSinceUpdate = del.updated_at
                  ? Math.floor(
                      (now - new Date(del.updated_at).getTime()) / 1000
                    )
                  : 0;
                const isDelayed = secondsSinceUpdate > 60;

                return (
                  <motion.div
                    key={del.order_id}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    onClick={() => setSelectedId(del.order_id)}
                    whileHover={{scale: 1.02}}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedId === del.order_id
                        ? 'border-2 border-primary bg-primary/5 shadow-md'
                        : 'border border-border bg-transparent hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDelayed ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}
                      >
                        <Truck size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="text-foreground font-extrabold text-sm flex justify-between">
                          <span>Tilaus #{del.order_id}</span>
                          <span className="text-xs text-muted-foreground font-semibold">
                            Kuski #{del.driver_id || '?'}
                          </span>
                        </div>
                        <div
                          className="text-muted-foreground text-xs truncate mt-0.5 font-medium"
                          title={del.delivery_address}
                        >
                          {del.delivery_address}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-wider ${
                          isDelayed
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {isDelayed ? 'Viive' : 'Aktiivinen'}
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs font-semibold">
                        <Clock size={12} />
                        <span>Päivitetty {secondsSinceUpdate}s sitten</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
