import {motion} from 'motion/react';
import {MapPin, Navigation, Truck} from 'lucide-react';

export function DriverMapPage() {
  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f1f5f9',
        minHeight: '100vh',
      }}
    >
      {/* Map placeholder */}
      <div
        style={{
          position: 'relative',
          height: 'calc(100vh - 200px)',
          backgroundColor: '#e2e8f0',
          backgroundImage:
            'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Truck size={64} color="#f97316" />
          </motion.div>
          <p
            style={{
              marginTop: '1rem',
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#0f2444',
            }}
          >
            Karttanäkymä tulossa pian
          </p>
          <p
            style={{fontSize: '0.95rem', color: '#64748b', marginTop: '0.5rem'}}
          >
            GPS-seuranta ja reittinavigointi
          </p>
        </div>
      </div>

      {/* Bottom info card */}
      <div style={{padding: '1.5rem'}}>
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: '1.5rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MapPin size={28} color="white" />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#0f2444',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Lidl Hakaniemi
              </h3>
              <p style={{fontSize: '0.95rem', color: '#64748b', margin: 0}}>
                Seuraava pysäkki
              </p>
            </div>
          </div>

          <div style={{display: 'flex', gap: '0.75rem'}}>
            <button
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '1rem',
                minHeight: '56px',
                borderRadius: 14,
                backgroundColor: '#3b82f6',
                color: 'white',
                fontSize: '1.05rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              }}
            >
              <Navigation size={20} />
              Aloita navigointi
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
