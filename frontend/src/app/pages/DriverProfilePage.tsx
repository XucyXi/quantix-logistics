import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {
  User,
  Truck,
  Package,
  Clock,
  LogOut,
  Power,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {useNavigate} from 'react-router';
import {orderService} from '../services/orderService';
import {authService} from '../services/authService';
import {ChangePasswordCard} from '../components/ChangePasswordCard';
import {useTheme} from '../contexts/ThemeProvider';

interface OrderData {
  status: string;
}

export function DriverProfilePage() {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const {theme, setTheme} = useTheme();

  const [isActive, setIsActive] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [vehicleInfoSaving, setVehicleInfoSaving] = useState(false);
  const [stats, setStats] = useState({active: 0, done: 0});

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role !== 'driver') return;

      try {
        const response = await authService.getProfile();

        const profileData =
          response?.data?.profile || response?.profile || response || {};

        setVehicleInfo(profileData.vehicle_info || '');
        setIsActive(Boolean(profileData.is_active_driver));
      } catch (e) {
        console.error('Driver profile load failed:', e);
      }
    };

    fetchProfile();
  }, [user]);

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

  const saveVehicleInfo = async (event: React.FormEvent) => {
    event.preventDefault();
    setVehicleInfoSaving(true);

    try {
      await authService.updateDriverProfile(vehicleInfo);
      alert('Ajoneuvotiedot tallennettu.');
    } catch (e) {
      console.error('Ajoneuvotietojen tallennus epäonnistui:', e);
      alert('Ajoneuvotietojen tallennus epäonnistui.');
    } finally {
      setVehicleInfoSaving(false);
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
    <div className="p-6 font-sans">
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
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-muted text-muted-foreground border border-border'
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

        {/* Ulkoasu / Teema Toggle */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.05}}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">Ulkoasu</h2>
          <div className="flex gap-2 bg-muted p-1.5 rounded-2xl">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                theme === 'light'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sun size={18} /> Vaalea
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Moon size={18} /> Tumma
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                theme === 'system'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Monitor size={18} /> Auto
            </button>
          </div>
        </motion.div>

        {/* Ajoneuvotiedot */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1}}
          className="bg-card border border-border rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-foreground mb-4">
            Ajoneuvotiedot
          </h2>
          <form onSubmit={saveVehicleInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Ajoneuvo
              </label>
              <input
                type="text"
                value={vehicleInfo}
                onChange={(e) => setVehicleInfo(e.target.value)}
                placeholder="Esim. Mercedes Sprinter (XYZ-123)"
                className="w-full p-3 rounded-2xl bg-muted border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tässä voit päivittää ajoneuvon tiedot, jotka näkyvät myös
                admin-paneelissa.
              </p>
            </div>
            <button
              type="submit"
              disabled={vehicleInfoSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            >
              {vehicleInfoSaving ? 'Tallennetaan...' : 'Tallenna tiedot'}
            </button>
          </form>
        </motion.div>

        {/* Salasanan vaihto */}
        <ChangePasswordCard />

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
