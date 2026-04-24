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
    <div className="font-sans">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6 flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <h1 className="text-foreground font-extrabold text-2xl mb-2 m-0">
            Raportit
          </h1>
          <p className="text-muted-foreground text-sm m-0">
            Liiketoiminnan analytiikka ja raportit
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card text-muted-foreground cursor-pointer text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
            <Calendar size={18} />
            Valitse aikaväli
          </button>
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90">
            <Download size={18} />
            Lataa raportti
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Kokonaisliikevaihto',
            value: '206 000 €',
            icon: DollarSign,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
            change: '+12.5%',
          },
          {
            label: 'Tilauksia yhteensä',
            value: '1 058',
            icon: Package,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
            change: '+8.3%',
          },
          {
            label: 'Toimituksia',
            value: '892',
            icon: Truck,
            colorClass: 'text-orange-500',
            bgClass: 'bg-orange-500/10',
            change: '+15.2%',
          },
          {
            label: 'Keskiarvo / tilaus',
            value: '195 €',
            icon: TrendingUp,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
            change: '+3.8%',
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
              <span className="text-xs font-bold text-green-500">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-foreground leading-none mb-1.5">
              {stat.value}
            </div>
            <div className="text-muted-foreground text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-6">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="text-foreground font-bold text-base m-0 mb-5">
            Kuukausittainen liikevaihto
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.2}
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
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={3}
                dot={{fill: '#f97316', r: 5, strokeWidth: 2}}
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
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <h3 className="text-foreground font-bold text-base m-0 mb-5">
            Myynti kategorioittain
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                strokeOpacity={0.2}
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
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-card)',
                  color: 'var(--color-foreground)',
                }}
              />
              <Bar
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

      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.4}}
        className="bg-card rounded-2xl p-6 shadow-sm border border-border"
      >
        <h3 className="text-foreground font-bold text-base m-0 mb-5">
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
          ].map((report) => (
            <div
              key={report.title}
              className="p-5 rounded-xl border border-border transition-all cursor-pointer hover:border-primary hover:bg-primary/5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <report.icon size={20} className="text-primary" />
                </div>
                <h4 className="text-foreground font-bold text-sm m-0">
                  {report.title}
                </h4>
              </div>
              <p className="text-muted-foreground text-xs m-0 leading-relaxed">
                {report.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
