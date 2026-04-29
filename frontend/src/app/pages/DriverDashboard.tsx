import {useEffect, useState} from 'react';
import {motion, useMotionValue, useTransform, PanInfo} from 'motion/react';
import {
  MapPin,
  CheckCircle,
  Clock,
  Package,
  Navigation,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import {useAuth} from '../contexts/AuthContext';
import {DeliveryTracking, Order} from '../../types/logistics';
import {useOutletContext} from 'react-router';

interface DeliveryCardProps {
  delivery: Order;
  index: number;
  status: string;
  onComplete: () => void;
}

function DeliveryCard({
  delivery,
  index,
  status,
  onComplete,
}: DeliveryCardProps) {
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-200, 0, 200],
    ['#dc2626', '#ffffff', '#16a34a']
  );
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 100 && status !== 'done') {
      onComplete();
      x.set(0);
    } else if (info.offset.x < -100) {
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const isDone = status === 'done';
  const isActive = status === 'active';

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{delay: index * 0.1}}
      style={{
        position: 'relative',
        marginBottom: '1rem',
        touchAction: 'pan-y',
      }}
    >
      {!isDone && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontWeight: 700,
            }}
          >
            <span style={{fontSize: '1.2rem'}}>✕</span>
            <span>Hylkää</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontWeight: 700,
            }}
          >
            <span>Toimitettu</span>
            <CheckCircle size={24} />
          </div>
        </motion.div>
      )}

      {/* Card */}
      <motion.div
        drag={!isDone ? 'x' : false}
        dragConstraints={{left: 0, right: 0}}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{
          x,
          scale,
          backgroundColor: 'white',
          borderRadius: 20,
          padding: '1.5rem',
          boxShadow: isActive
            ? '0 8px 24px rgba(249,115,22,0.2)'
            : '0 2px 12px rgba(0,0,0,0.08)',
          border: isActive
            ? '3px solid #f97316'
            : isDone
              ? '2px solid #16a34a'
              : '2px solid #e2e8f0',
          position: 'relative',
          cursor: !isDone ? 'grab' : 'default',
        }}
        whileTap={!isDone ? {cursor: 'grabbing'} : {}}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div style={{flex: 1}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isDone
                    ? '#dcfce7'
                    : isActive
                      ? '#fff7ed'
                      : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isDone ? '#16a34a' : isActive ? '#f97316' : '#64748b',
                }}
              >
                {isDone ? '✓' : index + 1}
              </div>
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#0f2444',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Tilaus #{delivery.order_id}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#64748b',
                    margin: 0,
                    marginTop: '0.25rem',
                  }}
                >
                  {delivery?.boxes} boksia
                </p>
              </div>
            </div>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 12,
              backgroundColor: isDone
                ? '#dcfce7'
                : isActive
                  ? '#fff7ed'
                  : '#fef3c7',
              color: isDone ? '#16a34a' : isActive ? '#f97316' : '#d97706',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {isDone ? 'VALMIS' : isActive ? 'AKTIIVINEN' : 'ODOTTAA'}
          </div>
        </div>

        {/* Info */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <MapPin size={20} color="#94a3b8" style={{flexShrink: 0}} />
            <span style={{fontSize: '1rem', color: '#374151'}}>
              {delivery?.delivery_address}
            </span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Clock size={20} color="#94a3b8" style={{flexShrink: 0}} />
            <span style={{fontSize: '1rem', color: '#374151', fontWeight: 600}}>
              <span>
                {delivery.scheduled_delivery
                  ? `ETA ${new Date(delivery.scheduled_delivery).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`
                  : 'Ei aikataulua'}
              </span>{' '}
            </span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <User size={20} color="#94a3b8" style={{flexShrink: 0}} />
            <span style={{fontSize: '1rem', color: '#374151'}}>
              {delivery?.contact}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${delivery?.phone}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              minHeight: '56px',
              borderRadius: 14,
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Phone size={20} />
            Soita
          </a>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(delivery?.delivery_address)}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              minHeight: '56px',
              borderRadius: 14,
              backgroundColor: '#0f2444',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <Navigation size={20} />
            Navigoi
          </a>
        </div>

        {!isDone && (
          <motion.div
            whileTap={{scale: 0.98}}
            style={{
              marginTop: '1rem',
            }}
          >
            <button
              onClick={onComplete}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1.25rem',
                minHeight: '60px',
                borderRadius: 14,
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
              }}
            >
              <CheckCircle size={24} />
              MERKITSE TOIMITETUKSI
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function DriverDashboard() {
  const {orders, deliveries} = useOutletContext<{
    orders: Order[];
    deliveries: DeliveryTracking[];
  }>();

  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(deliveries?.map((d) => [d.order_id, d.status]))
  );

  const done = Object.values(statuses).filter((s) => s === 'done').length;
  const total = deliveries.length;
  const pct = Math.round((done / total) * 100) || 0;

  const markDone = (id: number) => {
    setStatuses((prev) => ({...prev, [id]: 'done'}));
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          padding: '1.5rem',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Truck size={24} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Hei, {user?.name?.split(' ')[0] || 'Kuljettaja'}!
            </h1>
            <p style={{fontSize: '0.95rem', margin: 0, opacity: 0.8}}>
              Reitti R-2403
            </p>
          </div>
        </div>

        {/* Progress */}
        <div style={{marginTop: '1.5rem'}}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{fontSize: '1.1rem', fontWeight: 700}}>
              {done} / {total} Toimitettu
            </span>
            <span
              style={{fontSize: '1.5rem', fontWeight: 800, color: '#f97316'}}
            >
              {pct}%
            </span>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              height: 12,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{width: 0}}
              animate={{width: `${pct}%`}}
              transition={{duration: 0.8, ease: 'easeOut'}}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
                borderRadius: 12,
              }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3" style={{marginTop: '1.25rem'}}>
          {[
            {label: 'Jäljellä', value: total - done},
            {
              label: 'Boksia',
              value: deliveries?.reduce((s, d) => s + d?.boxes, 0),
            },
            {label: 'ETA', value: '12:30'},
          ]?.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{fontSize: '1.5rem', fontWeight: 800, lineHeight: 1}}>
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  opacity: 0.8,
                  marginTop: '0.25rem',
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliveries */}
      <div style={{padding: '1.5rem'}}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0f2444',
            marginBottom: '1rem',
          }}
        >
          Toimitukset tänään
        </h2>
        {orders?.map((delivery, i) => (
          <DeliveryCard
            key={delivery?.order_id}
            delivery={delivery}
            index={i}
            status={statuses[delivery?.order_id]}
            onComplete={() => markDone(delivery?.order_id)}
          />
        ))}
      </div>
    </div>
  );
}
