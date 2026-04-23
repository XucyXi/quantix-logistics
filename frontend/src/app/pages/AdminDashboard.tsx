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

// Yksinkertaistetut PWA-tilastot
const statCards = [
  {label: 'Reittejä', value: '12', icon: Truck, color: '#3b82f6'},
  {label: 'Toimitettu', value: '284', icon: Package, color: '#22c55e'},
  {label: 'Hälytykset', value: '4', icon: AlertTriangle, color: '#ef4444'},
];

// Yksinkertaistettu mock data
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

// Uusi Swipe-liuku Ylläpidon reittien nopeaan kuittaamiseen
function SwipeableRouteCard({route, onApprove}: SwipeCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, 0, 150],
    ['#ef4444', '#ffffff', '#16a34a']
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
    <motion.div
      style={{position: 'relative', marginBottom: '1rem', touchAction: 'pan-y'}}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
        }}
      >
        <div style={{color: 'white', fontWeight: 800, fontSize: '1.1rem'}}>
          ✕ Peruuta
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
          }}
        >
          Vahvista <CheckCircle size={26} />
        </div>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{left: 0, right: 0}}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{
          x,
          backgroundColor: 'white',
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          border: '2px solid #e2e8f0',
          position: 'relative',
          cursor: 'grab',
        }}
        whileTap={{cursor: 'grabbing'}}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h3
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#0f2444',
              margin: 0,
            }}
          >
            {route.id}
          </h3>
          <span
            style={{
              backgroundColor:
                route.status === 'active' ? '#dcfce7' : '#fef3c7',
              color: route.status === 'active' ? '#16a34a' : '#d97706',
              padding: '0.375rem 0.875rem',
              borderRadius: 14,
              fontSize: '0.9rem',
              fontWeight: 800,
            }}
          >
            {route.status === 'active' ? 'AJOSSA' : 'ODOTTAA'}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: '#475569',
            fontSize: '1.05rem',
            fontWeight: 600,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Truck size={22} color="#94a3b8" /> {route.driver} ({route.truck})
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <MapPin size={22} color="#94a3b8" /> {route.area}
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Package size={22} color="#94a3b8" /> {route.done} / {route.stops}{' '}
            paikkaa hoidettu
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
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
        paddingBottom: '5rem',
      }}
    >
      {/* PWA Mobiili Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          padding: '2rem 1.5rem',
          color: 'white',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                margin: '0 0 0.25rem 0',
              }}
            >
              Ajokeskus
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                margin: 0,
                fontSize: '1.1rem',
              }}
            >
              Tilannekatsaus
            </p>
          </div>
          <button
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RefreshCw size={28} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '1.25rem 1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  marginBottom: '0.25rem',
                }}
              >
                {stat.value}
              </div>
              <div style={{fontSize: '0.9rem', opacity: 0.8}}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding: '1.5rem'}}>
        {/* Hälytykset erittäin isoilla korteilla */}
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#0f2444',
            marginBottom: '1rem',
          }}
        >
          Huomiota vaativat
        </h2>
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                backgroundColor:
                  alert.type === 'warning' ? '#fffbeb' : '#eff6ff',
                border: `2px solid ${alert.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                borderRadius: 20,
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
              }}
            >
              <AlertTriangle
                size={36}
                color={alert.type === 'warning' ? '#d97706' : '#3b82f6'}
                style={{flexShrink: 0}}
              />
              <div style={{flex: 1}}>
                <div
                  style={{
                    color: '#0f2444',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  {alert.msg}
                </div>
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}
                >
                  Tänään klo {alert.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reitit Swipe-korteilla (Ylläpidon kuittaukset) */}
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#0f2444',
            marginBottom: '1rem',
          }}
        >
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
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              color: '#94a3b8',
            }}
          >
            <CheckCircle
              size={64}
              color="#22c55e"
              style={{margin: '0 auto 1rem', opacity: 0.5}}
            />
            <p style={{fontSize: '1.2rem', fontWeight: 700}}>
              Kaikki reitit vahvistettu!
            </p>
          </div>
        )}

        {/* Isot PWA Pikatoimintonapit */}
        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#0f2444',
            marginTop: '2.5rem',
            marginBottom: '1rem',
          }}
        >
          Pikatoiminnot
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.75rem',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 20,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f2444',
            }}
          >
            <div
              style={{display: 'flex', alignItems: 'center', gap: '1.25rem'}}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Package size={28} color="#d97706" />
              </div>
              Uusi pikatilaus
            </div>
            <ArrowRight size={28} color="#94a3b8" />
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.75rem',
              backgroundColor: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: 20,
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0f2444',
            }}
          >
            <div
              style={{display: 'flex', alignItems: 'center', gap: '1.25rem'}}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Truck size={28} color="#16a34a" />
              </div>
              Hallitse kuljettajia
            </div>
            <ArrowRight size={28} color="#94a3b8" />
          </button>
        </div>
      </div>
    </div>
  );
}
