import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {Search, MapPin, Package} from 'lucide-react';

interface Route {
  id: string;
  time: string;
  driver: string;
  initials: string;
  area: string;
  truck: string;
  stops: string;
  progress: number;
  status: 'active' | 'done' | 'pending';
}

const routesData: Route[] = [
  {
    id: 'R-2401',
    time: '04:40 - 13:40',
    driver: 'Jukka Leinonen',
    initials: 'JL',
    area: 'Helsinki Pohjois',
    truck: 'FGH-234',
    stops: '5 / 8',
    progress: 62,
    status: 'active',
  },
  {
    id: 'R-2402',
    time: '06:01 - 16:30',
    driver: 'Minna Korhonen',
    initials: 'MK',
    area: 'Espoo',
    truck: 'BCD-891',
    stops: '10 / 10',
    progress: 100,
    status: 'done',
  },
  {
    id: 'R-2403',
    time: '07:15 - 18:01',
    driver: 'Petri Mäkinen',
    initials: 'PM',
    area: 'Vantaa',
    truck: 'LMN-556',
    stops: '3 / 7',
    progress: 43,
    status: 'active',
  },
  {
    id: 'R-2404',
    time: '06:42 - 18:30',
    driver: 'Sara Virtanen',
    initials: 'SV',
    area: 'Järvenpää',
    truck: 'QRS-112',
    stops: '0 / 9',
    progress: 0,
    status: 'pending',
  },
  {
    id: 'R-2405',
    time: '05:16 - 15:30',
    driver: 'Antti Salo',
    initials: 'AS',
    area: 'Tampere',
    truck: 'TUV-778',
    stops: '11 / 11',
    progress: 100,
    status: 'done',
  },
  {
    id: 'R-2406',
    time: '07:18 - 16:01',
    driver: 'Laura Heikkilä',
    initials: 'LH',
    area: 'Turku',
    truck: 'WXY-334',
    stops: '4 / 6',
    progress: 67,
    status: 'active',
  },
  {
    id: 'R-2407',
    time: '07:19 - 16:00',
    driver: 'Mikko Hämäläinen',
    initials: 'MH',
    area: 'Lahti',
    truck: 'ABC-223',
    stops: '0 / 8',
    progress: 0,
    status: 'pending',
  },
  {
    id: 'R-2408',
    time: '06:15 - 16:18',
    driver: 'Tiina Lehtonen',
    initials: 'TL',
    area: 'Helsinki Etelämeri',
    truck: 'BEF-445',
    stops: '6 / 6',
    progress: 100,
    status: 'done',
  },
];

const statusStyles = {
  active: {
    bg: '#dcfce7',
    color: '#16a34a',
    label: 'Aktiivinen',
    badge: '#22c55e',
  },
  done: {bg: '#dbeafe', color: '#2563eb', label: 'Valmis', badge: '#3b82f6'},
  pending: {
    bg: '#fef3c7',
    color: '#d97706',
    label: 'Odottaa',
    badge: '#f59e0b',
  },
};

export function RoutesPage() {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'active' | 'done' | 'pending'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoutes = routesData.filter((route) => {
    const matchesFilter =
      activeFilter === 'all' || route.status === activeFilter;
    const matchesSearch =
      route.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.truck.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: routesData.length,
    active: routesData.filter((r) => r.status === 'active').length,
    done: routesData.filter((r) => r.status === 'done').length,
    pending: routesData.filter((r) => r.status === 'pending').length,
  };

  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        style={{marginBottom: '1.5rem'}}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h1
            style={{
              color: '#0f2444',
              fontWeight: 800,
              fontSize: '1.4rem',
              margin: 0,
            }}
          >
            Reittien hallinta
          </h1>
          <button
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#f97316',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#ea580c')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#f97316')
            }
          >
            Päivitä
          </button>
        </div>
        <p style={{color: '#64748b', fontSize: '0.85rem', margin: 0}}>
          {counts.all} reittiä tänään · {counts.done} valmista
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {(
          [
            {key: 'all', label: 'Kaikki reitit', color: '#0f2444'},
            {key: 'active', label: 'Aktiivisia', color: '#22c55e'},
            {key: 'done', label: 'Valmiita', color: '#3b82f6'},
            {key: 'pending', label: 'Odottaa', color: '#f59e0b'},
          ] as const
        ).map((item, idx) => (
          <motion.div
            key={item.key}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            whileHover={{y: -2}}
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: '1.25rem',
              boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
              border:
                activeFilter === item.key
                  ? `2px solid ${item.color}`
                  : '1px solid #f1f5f9',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onClick={() => setActiveFilter(item.key)}
          >
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: item.color,
                lineHeight: 1,
                marginBottom: '0.5rem',
              }}
            >
              {counts[item.key]}
            </div>
            <div style={{color: '#64748b', fontSize: '0.85rem'}}>
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.3}}
        style={{marginBottom: '1.5rem'}}
      >
        <div style={{position: 'relative'}}>
          <Search
            size={18}
            color="#94a3b8"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Hae reittinumero, kuljettajaa, alue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              borderRadius: 10,
              border: '1.5px solid #e2e8f0',
              fontSize: '0.9rem',
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              transition: 'border 0.2s',
              boxSizing: 'border-box',
              backgroundColor: 'white',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#f97316')}
            onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.4}}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: '1rem 1.5rem',
          marginBottom: '1rem',
          display: 'flex',
          gap: '0.75rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
        }}
      >
        {[
          {key: 'all', label: 'Kaikki'},
          {key: 'active', label: 'Aktiiviset'},
          {key: 'done', label: 'Valmis'},
          {key: 'pending', label: 'Odottaa'},
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as typeof activeFilter)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              border: 'none',
              backgroundColor:
                activeFilter === tab.key ? '#0f2444' : 'transparent',
              color: activeFilter === tab.key ? 'white' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: activeFilter === tab.key ? 600 : 500,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Routes Table */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.5}}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f1f5f9',
          overflow: 'hidden',
        }}
      >
        <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '800px',
            }}
          >
            <thead>
              <tr style={{backgroundColor: '#f8fafc'}}>
                {[
                  'REITTI',
                  'KULJETTAJA',
                  'ALUE',
                  'AJONEUVO',
                  'PYSÄHDYKSET',
                  'EDISTYMINEN',
                  'TILA',
                ].map((h, idx) => (
                  <th
                    key={`header-${idx}`}
                    style={{
                      padding: '1rem 1.25rem',
                      textAlign: 'left',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#94a3b8',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredRoutes.map((route, i) => {
                  const st = statusStyles[route.status];
                  return (
                    <motion.tr
                      key={route.id}
                      initial={{opacity: 0}}
                      animate={{opacity: 1}}
                      exit={{opacity: 0}}
                      transition={{delay: i * 0.02}}
                      style={{
                        borderTop: '1px solid #f1f5f9',
                        backgroundColor: 'white',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <td style={{padding: '1rem 1.25rem'}}>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#0f2444',
                              fontSize: '0.9rem',
                            }}
                          >
                            {route.id}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: '#94a3b8',
                              marginTop: '0.125rem',
                            }}
                          >
                            {route.time}
                          </div>
                        </div>
                      </td>
                      <td style={{padding: '1rem 1.25rem'}}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: '#0f2444',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {route.initials}
                          </div>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              color: '#374151',
                              fontWeight: 500,
                            }}
                          >
                            {route.driver}
                          </span>
                        </div>
                      </td>
                      <td style={{padding: '1rem 1.25rem'}}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}
                        >
                          <MapPin size={14} color="#94a3b8" />
                          {route.area}
                        </span>
                      </td>
                      <td style={{padding: '1rem 1.25rem'}}>
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            fontSize: '0.85rem',
                            color: '#64748b',
                          }}
                        >
                          <Package size={14} color="#94a3b8" />
                          {route.truck}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '1rem 1.25rem',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: 600,
                        }}
                      >
                        {route.stops}
                        <span style={{color: '#94a3b8', fontWeight: 400}}>
                          {' '}
                          paikkoja
                        </span>
                      </td>
                      <td style={{padding: '1rem 1.25rem', minWidth: 140}}>
                        <div>
                          <div
                            style={{
                              backgroundColor: '#f1f5f9',
                              borderRadius: 8,
                              height: 8,
                              overflow: 'hidden',
                              marginBottom: '0.375rem',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${route.progress}%`,
                                backgroundColor: st.badge,
                                borderRadius: 8,
                                transition: 'width 0.3s',
                              }}
                            />
                          </div>
                          <span style={{fontSize: '0.75rem', color: '#64748b'}}>
                            {route.progress}%
                          </span>
                        </div>
                      </td>
                      <td style={{padding: '1rem 1.25rem'}}>
                        <span
                          style={{
                            padding: '0.375rem 0.875rem',
                            borderRadius: 20,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            backgroundColor: st.bg,
                            color: st.color,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {st.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredRoutes.length === 0 && (
          <div style={{padding: '3rem', textAlign: 'center'}}>
            <p style={{color: '#94a3b8', fontSize: '0.9rem'}}>
              Ei reittejä löytynyt hakuehdoilla.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
