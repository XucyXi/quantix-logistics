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
    color: '#2563eb',
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
    color: '#16a34a',
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
            // Saavutettu kohde, valitse uusi satunnainen kohde
            return {
              ...vehicle,
              x: vehicle.targetX,
              y: vehicle.targetY,
              targetX: Math.random() * 80 + 10,
              targetY: Math.random() * 80 + 10,
            };
          }

          // Liiku kohti tavoitetta
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
    active: {bg: '#dcfce7', color: '#16a34a', label: 'Aktiivinen'},
    idle: {bg: '#fee2e2', color: '#dc2626', label: 'Pysähdyksissä'},
    delayed: {bg: '#fef3c7', color: '#d97706', label: 'Myöhässä'},
  };

  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        style={{marginBottom: '1.5rem'}}
      >
        <h1
          style={{
            color: '#0f2444',
            fontWeight: 800,
            fontSize: '1.4rem',
            marginBottom: '0.5rem',
          }}
        >
          Reaaliaikainen seuranta
        </h1>
        <p style={{color: '#64748b', fontSize: '0.85rem', margin: 0}}>
          Seuraa ajoneuvoja reaaliajassa kartalla
        </p>
      </motion.div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {[
          {
            label: 'Aktiivisia ajoneuvoja',
            value: vehicles.filter((v) => v.status === 'active').length,
            icon: Truck,
            color: '#16a34a',
          },
          {
            label: 'Pysähdyksissä',
            value: vehicles.filter((v) => v.status === 'idle').length,
            icon: MapPin,
            color: '#dc2626',
          },
          {
            label: 'Keskimääräinen nopeus',
            value: `${Math.round(vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length)} km/h`,
            icon: Navigation,
            color: '#2563eb',
          },
          {
            label: 'Aktiivisia reittejä',
            value: vehicles.filter((v) => v.status === 'active').length,
            icon: Activity,
            color: '#f97316',
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: '1.25rem',
              boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <stat.icon size={20} color={stat.color} />
              </div>
            </div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#0f2444',
                lineHeight: 1,
                marginBottom: '0.375rem',
              }}
            >
              {stat.value}
            </div>
            <div style={{color: '#64748b', fontSize: '0.8rem'}}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Map and Vehicle List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
          className="lg:col-span-2"
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
          }}
        >
          <h3
            style={{
              color: '#0f2444',
              fontWeight: 700,
              fontSize: '0.95rem',
              margin: 0,
              marginBottom: '1.25rem',
            }}
          >
            Live-kartta
          </h3>

          {/* SVG Map */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '75%',
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              viewBox="0 0 100 100"
            >
              {/* Grid lines */}
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
                    stroke="#e2e8f0"
                    strokeWidth="0.2"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Roads/Routes */}
              <line
                x1="30"
                y1="40"
                x2="50"
                y2="60"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
              <line
                x1="25"
                y1="55"
                x2="15"
                y2="75"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />
              <line
                x1="35"
                y1="35"
                x2="55"
                y2="45"
                stroke="#cbd5e1"
                strokeWidth="0.5"
                strokeDasharray="1,1"
              />

              {/* Cities/Waypoints */}
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
                    fill="#64748b"
                    opacity="0.3"
                  />
                  <text
                    x={city.x}
                    y={city.y - 3}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="2.5"
                    fontWeight="600"
                  >
                    {city.name}
                  </text>
                </g>
              ))}

              {/* Vehicles */}
              {vehicles.map((vehicle) => (
                <g key={vehicle.id}>
                  {/* Pulse effect for active vehicles */}
                  {vehicle.status === 'active' && (
                    <motion.circle
                      cx={vehicle.x}
                      cy={vehicle.y}
                      r="3"
                      fill={vehicle.color}
                      opacity="0.3"
                      animate={{
                        r: [3, 6, 3],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}

                  {/* Vehicle marker */}
                  <motion.g
                    animate={{
                      x: vehicle.x,
                      y: vehicle.y,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 50,
                      damping: 10,
                    }}
                    style={{cursor: 'pointer'}}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <circle
                      cx="0"
                      cy="0"
                      r="2"
                      fill={vehicle.color}
                      stroke="white"
                      strokeWidth="0.5"
                    />
                    <circle cx="0" cy="0" r="1" fill="white" />
                  </motion.g>

                  {/* Label when selected */}
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
                        fill="white"
                        stroke={vehicle.color}
                        strokeWidth="0.3"
                      />
                      <text
                        x={vehicle.x + 13}
                        y={vehicle.y - 0.5}
                        textAnchor="middle"
                        fill={vehicle.color}
                        fontSize="2"
                        fontWeight="700"
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

        {/* Vehicle List */}
        <motion.div
          initial={{opacity: 0, x: 20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.3}}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f1f5f9',
            maxHeight: '600px',
            overflowY: 'auto',
          }}
        >
          <h3
            style={{
              color: '#0f2444',
              fontWeight: 700,
              fontSize: '0.95rem',
              margin: 0,
              marginBottom: '1.25rem',
            }}
          >
            Ajoneuvot ({vehicles.length})
          </h3>

          <div
            style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}
          >
            <AnimatePresence>
              {vehicles.map((vehicle) => {
                const statusStyle = statusStyles[vehicle.status];
                return (
                  <motion.div
                    key={vehicle.id}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    style={{
                      padding: '1rem',
                      borderRadius: 12,
                      border:
                        selectedVehicle === vehicle.id
                          ? `2px solid ${vehicle.color}`
                          : '1px solid #e2e8f0',
                      backgroundColor:
                        selectedVehicle === vehicle.id
                          ? `${vehicle.color}08`
                          : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                    whileHover={{scale: 1.02}}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          backgroundColor: `${vehicle.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Truck size={18} color={vehicle.color} />
                      </div>
                      <div style={{flex: 1}}>
                        <div
                          style={{
                            color: '#0f2444',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          }}
                        >
                          {vehicle.id}
                        </div>
                        <div style={{color: '#64748b', fontSize: '0.75rem'}}>
                          {vehicle.driver}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#64748b',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {vehicle.route}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: 12,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {statusStyle.label}
                      </span>
                      {vehicle.speed > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#64748b',
                            fontSize: '0.75rem',
                          }}
                        >
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
