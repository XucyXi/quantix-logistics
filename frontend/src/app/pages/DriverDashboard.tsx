import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {
  Truck,
  Check,
  Package,
  MapPin,
  Clock,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import {orderService} from '../services/orderService';
import {adminService} from '../services/adminService';
import {useOutletContext} from 'react-router';

interface OrderItem {
  name: string;
  quantity: number;
}

interface AssignedOrder {
  order_id: number;
  status:
    | 'pending'
    | 'assigned'
    | 'in_progress'
    | 'ready_for_pickup'
    | 'in_transit'
    | 'done'
    | 'cancelled';
  delivery_address: string;
  notes: string | null;
  customer: {
    company_name: string | null;
    tel: string | null;
  };
  items: OrderItem[];
}

interface Alert {
  notification_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  created_at: string;
}

interface Announcement {
  announcement_id: number;
  title: string;
  content?: string | null;
  created_at: string;
  expires_at?: string | null;
}

export function DriverDashboard() {
  const {orders} = useOutletContext<{orders: AssignedOrder[]}>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newItems, setNewItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const data = await adminService.getNotifications();
        const fetchedAlerts: Alert[] = data.notifications || [];
        const fetchedAnns: Announcement[] = data.announcements || [];

        const seen = JSON.parse(
          localStorage.getItem('seen_notifications_driver') || '[]'
        );
        const currentNew = new Set<string>();
        let hasChanges = false;

        fetchedAlerts.forEach((a) => {
          const id = `notif-${a.notification_id}`;
          if (!seen.includes(id)) {
            currentNew.add(id);
            seen.push(id);
            hasChanges = true;
          }
        });

        fetchedAnns.forEach((a) => {
          const id = `ann-${a.announcement_id}`;
          if (!seen.includes(id)) {
            currentNew.add(id);
            seen.push(id);
            hasChanges = true;
          }
        });

        if (mounted) {
          if (hasChanges) {
            localStorage.setItem(
              'seen_notifications_driver',
              JSON.stringify(seen)
            );
            window.dispatchEvent(new Event('notifications_seen_driver'));
            setNewItems((prev) => new Set([...prev, ...currentNew]));
          }
          setAlerts(fetchedAlerts);
          setAnnouncements(fetchedAnns);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Tilan päivitys epäonnistui.');
    }
  };

  return (
    <div className="p-6">
      {/* ILMOITUKSET OSIO */}
      {(announcements.length > 0 || alerts.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-foreground mb-3 flex items-center gap-2">
            Ilmoitukset
            {newItems.size > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)] animate-pulse">
                {newItems.size} uutta
              </span>
            )}
          </h2>
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2 rounded-xl">
            {announcements.map((announcement) => {
              const isNew = newItems.has(`ann-${announcement.announcement_id}`);
              return (
                <div
                  key={`announcement-${announcement.announcement_id}`}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                    isNew
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                      : 'border-border bg-card'
                  }`}
                >
                  <AlertTriangle
                    size={24}
                    className={`shrink-0 mt-1 ${isNew ? 'text-orange-500' : 'text-indigo-500 dark:text-indigo-400'}`}
                  />
                  <div className="flex-1">
                    <div className="text-foreground font-extrabold text-base mb-1 flex justify-between items-start">
                      {announcement.title}
                      {isNew && (
                        <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                          Uusi
                        </span>
                      )}
                    </div>
                    {announcement.content && (
                      <div className="text-muted-foreground text-sm mb-1 leading-snug">
                        {announcement.content}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {alerts.map((alert) => {
              const isNew = newItems.has(`notif-${alert.notification_id}`);
              const baseBorderClass =
                alert.type === 'warning'
                  ? 'border-amber-200 dark:border-amber-900/50'
                  : 'border-border';

              return (
                <div
                  key={alert.notification_id}
                  className={`flex items-start gap-4 p-4 rounded-xl border bg-card transition-all duration-500 ${
                    isNew
                      ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                      : baseBorderClass
                  }`}
                >
                  <AlertTriangle
                    size={24}
                    className={`shrink-0 mt-1 ${
                      isNew
                        ? 'text-orange-500'
                        : alert.type === 'warning'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-foreground font-extrabold text-base mb-1 flex justify-between items-start">
                      {alert.title}
                      {isNew && (
                        <span className="text-[0.65rem] uppercase tracking-wider bg-orange-500 text-white px-2 py-0.5 rounded-md">
                          Uusi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-foreground m-0">
          Omat toimitukset
        </h1>
      </div>

      <div className="space-y-4">
        {orders.length > 0 ? (
          orders.map((order, i) => (
            <motion.div
              key={order.order_id}
              initial={{opacity: 0, y: 20}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: i * 0.1}}
              className={`bg-card p-6 rounded-2xl shadow-sm border ${
                order.status === 'in_transit'
                  ? 'border-primary'
                  : 'border-border'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-extrabold text-lg text-foreground m-0">
                  Tilaus #{order.order_id}
                  {order.customer?.company_name
                    ? ` - ${order.customer.company_name}`
                    : ''}
                </h2>

                {order.status === 'assigned' ||
                order.status === 'in_progress' ? (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                    <Clock size={12} /> Varastolla
                  </span>
                ) : order.status === 'ready_for_pickup' ? (
                  <span className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-teal-200 dark:border-teal-800">
                    <Package size={12} /> Odottaa noutoa
                  </span>
                ) : order.status === 'in_transit' ? (
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-primary/20">
                    <Truck size={12} /> Matkalla
                  </span>
                ) : null}
              </div>

              <div className="text-sm font-medium text-muted-foreground flex items-start gap-2 mb-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>{order.delivery_address}</span>
              </div>

              {order.notes && (
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg mb-4 text-sm text-orange-800 dark:text-orange-300 italic border border-orange-100 dark:border-orange-900/50 font-medium flex gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  &quot;{order.notes}&quot;
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                {(order.status === 'assigned' ||
                  order.status === 'in_progress') && (
                  <button
                    disabled
                    className="bg-muted text-muted-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-not-allowed"
                  >
                    <Clock size={16} /> Odottaa varastoa...
                  </button>
                )}

                {order.status === 'ready_for_pickup' && (
                  <button
                    onClick={() =>
                      handleUpdateStatus(order.order_id, 'in_transit')
                    }
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Package size={16} /> Noudettu (Aloita ajo)
                  </button>
                )}

                {order.status === 'in_transit' && (
                  <button
                    onClick={() => handleUpdateStatus(order.order_id, 'done')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <Check size={16} /> Kuittaa toimitetuksi
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center p-10 bg-card rounded-3xl border border-border shadow-sm mt-10">
            <Package size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-medium">
              Ei sinulle määrättyjä toimituksia tällä hetkellä.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
