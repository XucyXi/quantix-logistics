import {motion} from 'motion/react';
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Truck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthlyData = [
  {id: 'month-1', month: 'Tammi', revenue: 45000, orders: 234},
  {id: 'month-2', month: 'Helmi', revenue: 52000, orders: 267},
  {id: 'month-3', month: 'Maalis', revenue: 48000, orders: 245},
  {id: 'month-4', month: 'Huhti', revenue: 61000, orders: 312},
];

const categoryData = [
  {id: 'cat-1', category: 'Liha', amount: 45000},
  {id: 'cat-2', category: 'Maitotuotteet', amount: 38000},
  {id: 'cat-3', category: 'Vihannekset', amount: 29000},
  {id: 'cat-4', category: 'Leipä', amount: 18000},
  {id: 'cat-5', category: 'Juomat', amount: 32000},
];

export function ReportsPage() {
  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      {/* Header */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              color: '#0f2444',
              fontWeight: 800,
              fontSize: '1.4rem',
              marginBottom: '0.5rem',
            }}
          >
            Raportit
          </h1>
          <p style={{color: '#64748b', fontSize: '0.85rem', margin: 0}}>
            Liiketoiminnan analytiikka ja raportit
          </p>
        </div>
        <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              backgroundColor: 'white',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f97316';
              e.currentTarget.style.color = '#f97316';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <Calendar size={18} />
            Valitse aikaväli
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: 10,
              border: 'none',
              backgroundColor: '#f97316',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
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
            <Download size={18} />
            Lataa raportti
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {[
          {
            label: 'Kokonaisliikevaihto',
            value: '206 000 €',
            icon: DollarSign,
            color: '#16a34a',
            change: '+12.5%',
          },
          {
            label: 'Tilauksia yhteensä',
            value: '1 058',
            icon: Package,
            color: '#2563eb',
            change: '+8.3%',
          },
          {
            label: 'Toimituksia',
            value: '892',
            icon: Truck,
            color: '#f97316',
            change: '+15.2%',
          },
          {
            label: 'Keskiarvo / tilaus',
            value: '195 €',
            icon: TrendingUp,
            color: '#8b5cf6',
            change: '+3.8%',
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
              <span
                style={{fontSize: '0.75rem', fontWeight: 700, color: '#16a34a'}}
              >
                {stat.change}
              </span>
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

      {/* Charts */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
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
            Kuukausittainen liikevaihto
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{fontSize: 12, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{fontSize: 12, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.8rem',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Line
                key="line-revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{fill: '#f97316', r: 5, strokeWidth: 2, stroke: '#fff'}}
                name="Liikevaihto (€)"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

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
            Myynti kategorioittain
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{fontSize: 11, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{fontSize: 11, fill: '#94a3b8'}}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '0.8rem',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Bar
                key="bar-category"
                dataKey="amount"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                name="Myynti (€)"
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Quick Reports */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.4}}
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
          Pika-raportit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Myyntiraportti',
              desc: 'Kokonaisvaltainen myyntiraportti kaikista tilauksista',
              icon: FileText,
            },
            {
              title: 'Varastoraportti',
              desc: 'Tuotteiden varastotilanne ja täydennystarve',
              icon: Package,
            },
            {
              title: 'Toimitusraportti',
              desc: 'Toimitusaikojen ja -tehokkuuden analyysi',
              icon: Truck,
            },
          ].map((report, idx) => (
            <div
              key={report.title}
              style={{
                padding: '1.25rem',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.backgroundColor = '#fff7ed';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <report.icon size={20} color="#f97316" />
                </div>
                <h4
                  style={{
                    color: '#0f2444',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    margin: 0,
                  }}
                >
                  {report.title}
                </h4>
              </div>
              <p
                style={{
                  color: '#64748b',
                  fontSize: '0.85rem',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {report.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
