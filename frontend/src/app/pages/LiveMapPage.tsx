import {useState, useEffect} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Truck, MapPin, Clock, Navigation, Activity} from 'lucide-react';

interface Vehicle {
  id: string;
  driver: string;
  route: string;
  status: 'active' | 'idle' | 'delayed';
  speed: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
}

const initialVehicles: Vehicle[] = [
  {
    id: 'VEH-001',
    driver: 'Jukka Leinonen',
    route: 'Helsinki → Tampere',
    status: 'active',
    speed: 85,
    x: 30,
    y: 40,
    targetX: 50,
    targetY: 60,
    color: '#3b82f6',
  },
  {
    id: 'VEH-002',
    driver: 'Minna Korhonen',
    route: 'Espoo → Turku',
    status: 'active',
    speed: 72,
    x: 25,
    y: 55,
    targetX: 15,
    targetY: 75,
    color: '#22c55e',
  },
  {
    id: 'VEH-003',
    driver: 'Petri Virtanen',
    route: 'Vantaa → Lahti',
    status: 'active',
    speed: 68,
    x: 35,
    y: 35,
    targetX: 55,
    targetY: 45,
    color: '#f97316',
  },
  {
    id: 'VEH-004',
    driver: 'Laura Mäkinen',
    route: 'Tampere → Helsinki',
    status: 'idle',
    speed: 0,
    x: 50,
    y: 60,
    targetX: 50,
    targetY: 60,
    color: '#8b5cf6',
  },
];

export function LiveMapPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles((prev) =>
        prev.map((vehicle) => {
          if (vehicle.status === 'idle') return vehicle;
          const dx = vehicle.targetX - vehicle.x;
          const dy = vehicle.targetY - vehicle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 2) {
            return {
              ...vehicle,
              x: vehicle.targetX,
              y: vehicle.targetY,
              targetX: Math.random() * 80 + 10,
              targetY: Math.random() * 80 + 10,
            };
          }
          const speed = 0.5;
          return {
            ...vehicle,
            x: vehicle.x + (dx / distance) * speed,
            y: vehicle.y + (dy / distance) * speed,
          };
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const statusStyles = {
    active: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      color: 'text-green-600 dark:text-green-400',
      label: 'Aktiivinen',
    },
    idle: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      color: 'text-red-600 dark:text-red-400',
      label: 'Pysähdyksissä',
    },
    delayed: {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      color: 'text-amber-600 dark:text-amber-400',
      label: 'Myöhässä',
    },
  };

  return (
    <div className="font-sans">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <h1 className="text-foreground font-extrabold text-2xl mb-2">
          Reaaliaikainen seuranta
        </h1>
        <p className="text-muted-foreground text-sm m-0">
          Seuraa ajoneuvoja reaaliajassa kartalla
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Aktiivisia',
            value: vehicles.filter((v) => v.status === 'active').length,
            icon: Truck,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
          },
          {
            label: 'Pysähdyksissä',
            value: vehicles.filter((v) => v.status === 'idle').length,
            icon: MapPin,
            colorClass: 'text-red-500',
            bgClass: 'bg-red-500/10',
          },
          {
            label: 'Keskinopeus',
            value: `${Math.round(vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length)} km/h`,
            icon: Navigation,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Reittejä',
            value: vehicles.filter((v) => v.status === 'active').length,
            icon: Activity,
            colorClass: 'text-orange-500',
            bgClass: 'bg-orange-500/10',
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
            <div className="text-muted-foreground text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
          className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="text-foreground font-bold text-base m-0 mb-5">
            Live-kartta
          </h3>
          <div className="relative w-full pt-[75%] bg-muted/30 rounded-xl overflow-hidden border border-border">
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <defs>
                <pattern
                  id="grid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    className="stroke-border"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Roads */}
              <line
                x1="30"
                y1="40"
                x2="50"
                y2="60"
                className="stroke-muted-foreground/30"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
              <line
                x1="25"
                y1="55"
                x2="15"
                y2="75"
                className="stroke-muted-foreground/30"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
              <line
                x1="35"
                y1="35"
                x2="55"
                y2="45"
                className="stroke-muted-foreground/30"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />

              {/* Cities */}
              {[
                {x: 30, y: 40, name: 'HKI'},
                {x: 50, y: 60, name: 'TRE'},
                {x: 15, y: 75, name: 'TKU'},
                {x: 55, y: 45, name: 'LHT'},
              ].map((city) => (
                <g key={city.name}>
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r="1.5"
                    className="fill-muted-foreground opacity-30"
                  />
                  <text
                    x={city.x}
                    y={city.y - 3}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[2.5px] font-semibold"
                  >
                    {city.name}
                  </text>
                </g>
              ))}

              {/* Vehicles */}
              {vehicles.map((vehicle) => (
                <g key={vehicle.id}>
                  {vehicle.status === 'active' && (
                    <motion.circle
                      cx={vehicle.x}
                      cy={vehicle.y}
                      r="3"
                      fill={vehicle.color}
                      opacity="0.3"
                      animate={{r: [3, 6, 3], opacity: [0.3, 0, 0.3]}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <motion.g
                    animate={{x: vehicle.x, y: vehicle.y}}
                    transition={{type: 'spring', stiffness: 50, damping: 10}}
                    className="cursor-pointer"
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="2"
                      fill={vehicle.color}
                      stroke="currentColor"
                      className="stroke-card"
                      strokeWidth="0.5"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="1"
                      fill="currentColor"
                      className="fill-card"
                    />
                  </motion.g>

                  {selectedVehicle === vehicle.id && (
                    <motion.g
                      initial={{opacity: 0, scale: 0.8}}
                      animate={{opacity: 1, scale: 1}}
                      transition={{duration: 0.2}}
                    >
                      <rect
                        x={vehicle.x + 3}
                        y={vehicle.y - 4}
                        width="20"
                        height="6"
                        rx="1"
                        className="fill-card stroke-border"
                        strokeWidth="0.5"
                      />
                      <text
                        x={vehicle.x + 13}
                        y={vehicle.y - 0.5}
                        textAnchor="middle"
                        fill={vehicle.color}
                        className="text-[2px] font-bold"
                      >
                        {vehicle.id}
                      </text>
                    </motion.g>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, x: 20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.3}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border max-h-[600px] overflow-y-auto"
        >
          <h3 className="text-foreground font-bold text-base m-0 mb-5">
            Ajoneuvot ({vehicles.length})
          </h3>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {vehicles.map((vehicle) => {
                const statusStyle = statusStyles[vehicle.status];
                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    whileHover={{scale: 1.02}}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedVehicle === vehicle.id
                        ? 'border-2 border-primary bg-primary/5'
                        : 'border border-border bg-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-muted">
                        <Truck size={18} color={vehicle.color} />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground font-bold text-sm">
                          {vehicle.id}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {vehicle.driver}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {vehicle.route}
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[0.7rem] font-semibold ${statusStyle.bg} ${statusStyle.color}`}
                      >
                        {statusStyle.label}
                      </span>
                      {vehicle.speed > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Navigation size={12} />
                          <span>{vehicle.speed} km/h</span>
                        </div>
                      )}
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
