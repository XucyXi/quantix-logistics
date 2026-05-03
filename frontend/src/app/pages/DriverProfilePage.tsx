import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {User, Truck, Package, Clock, LogOut, Power} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {useNavigate} from 'react-router';
import {orderService} from '../services/orderService';
import {ChangePasswordCard} from '../components/ChangePasswordCard';

interface OrderData {
  status: string;
}

export function DriverProfilePage() {
  const {user, logout} = useAuth();
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(true);
  const [stats, setStats] = useState({active: 0, done: 0});

  useEffect(() => {
    const fetchMyStats = async () => {
      try {
        const data = await orderService.getAssignedOrders();
        setStats({
          active: data.filter((d: OrderData) => d.status !== 'done').length,
          done: data.filter((d: OrderData) => d.status === 'done').length,
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchMyStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleAvailability = async () => {
    const newState = !isActive;
    setIsActive(newState);
    try {
      await orderService.updateAvailability(newState);
    } catch (e) {
      console.error(e);
      setIsActive(!newState);
      alert('Tilan päivitys epäonnistui.');
    }
  };

  const statCards = [
    {
      label: 'Toimituksia ajossa',
      value: stats.active.toString(),
      icon: Truck,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Toimitettu tänään',
      value: stats.done.toString(),
      icon: Package,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Keskim. aika',
      value: '12 min',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Tyytyväisyys',
      value: '98 %',
      icon: User,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          className="bg-card border border-border rounded-3xl p-8 shadow-sm text-center relative"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-900 flex items-center justify-center mx-auto mb-4 text-4xl font-extrabold text-white shadow-lg">
            {user?.name?.charAt(0) || 'K'}
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            {user?.name || 'Kuljettaja'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {user?.email || 'kuljettaja@quantix.fi'}
          </p>

          <button
            onClick={toggleAvailability}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm ${
              isActive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            <Power size={18} />
            {isActive ? 'Olet Päivystyksessä' : 'Olet Vapaalla'}
          </button>
        </motion.div>

        {/* Stats */}
        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-4 pl-2">
            Suorituksesi
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{opacity: 0, scale: 0.95}}
                animate={{opacity: 1, scale: 1}}
                transition={{delay: idx * 0.05}}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}
                >
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div className="text-2xl font-extrabold text-foreground mb-1 leading-none">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Salasanan vaihto */}
        <ChangePasswordCard />

        {/* Logout */}
        <motion.button
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 transition-colors shadow-md mt-8"
        >
          <LogOut size={24} />
          Kirjaudu ulos
        </motion.button>
      </div>
    </div>
  );
}
