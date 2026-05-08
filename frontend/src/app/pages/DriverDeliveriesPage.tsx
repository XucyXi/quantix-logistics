import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {CheckCircle, Clock, MapPin, Truck} from 'lucide-react';
import {orderService} from '../services/orderService';

interface Delivery {
  order_id: number;
  status: string;
  delivery_address: string;
  customer: {company_name: string | null};
  items: {quantity: number}[];
}

export function DriverDeliveriesPage() {
  const [filter, setFilter] = useState<'all' | 'in_transit' | 'pending'>('all');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const data = await orderService.getAssignedOrders();
        setDeliveries(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'in_transit') return d.status === 'in_transit';
    if (filter === 'pending')
      return ['assigned', 'in_progress', 'ready_for_pickup'].includes(d.status);
    return true;
  });

  const stats = {
    total: deliveries.length,
    in_transit: deliveries.filter((d) => d.status === 'in_transit').length,
    pending: deliveries.filter((d) =>
      ['assigned', 'in_progress', 'ready_for_pickup'].includes(d.status)
    ).length,
  };

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Ladataan toimituksia...
      </div>
    );

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-extrabold text-foreground mb-4">
        Kaikki työtehtävät
      </h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {label: 'Yhteensä', value: stats.total, color: 'text-foreground'},
          {
            label: 'Matkalla',
            value: stats.in_transit,
            color: 'text-purple-500',
          },
          {label: 'Odottaa', value: stats.pending, color: 'text-orange-500'},
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            className="bg-card rounded-2xl p-5 text-center shadow-sm border border-border"
          >
            <div
              className={`text-3xl font-extrabold mb-2 leading-none ${stat.color}`}
            >
              {stat.value}
            </div>
            <div className="text-muted-foreground text-xs font-bold">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {[
          {label: 'Kaikki', value: 'all' as const},
          {label: 'Matkalla', value: 'in_transit' as const},
          {label: 'Odottaa (Varasto)', value: 'pending' as const},
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
              filter === f.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground border border-border hover:bg-accent'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {filteredDeliveries.map((delivery, i) => {
            const isTransit = delivery.status === 'in_transit';
            const totalBoxes = delivery.items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            return (
              <motion.div
                key={delivery.order_id}
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, height: 0}}
                transition={{delay: i * 0.03}}
                className={`bg-card rounded-2xl p-5 shadow-sm border ${
                  isTransit ? 'border-primary' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isTransit
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isTransit ? <Truck size={24} /> : <Clock size={24} />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-extrabold text-foreground m-0 leading-snug">
                        Tilaus #{delivery.order_id}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
                        <MapPin size={14} />{' '}
                        <span>{delivery.delivery_address}</span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          <strong className="text-foreground">
                            {totalBoxes}
                          </strong>{' '}
                          kpl tuotteita
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${
                      isTransit
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isTransit ? 'MATKALLA' : 'ODOTTAA'}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">
            Ei toimituksia valitulla suodattimella.
          </p>
        </div>
      )}
    </div>
  );
}
