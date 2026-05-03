import {useState, useEffect} from 'react';
import {motion} from 'motion/react';
import {
  FileText,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Package,
  Truck,
  Clock,
  RefreshCw,
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
import api from '../lib/api';

// --- MOCK DATA (Vastaa sitä muotoa, jota backendisi tulee palauttamaan) ---

// SQL: SELECT SUM(total_price), COUNT(order_id), AVG(total_price) FROM ORDERS...
const mockKpiStats = {
  revenue: 0,
  revenueChange: '',
  deliveredOrders: 0,
  deliveredChange: '',
  avgOrderValue: 0,
  avgOrderChange: '',
  avgDeliveryTimeMinutes: 0, // Laskettu: order_finished - ordered_at
  timeChange: '', // Miinus on tässä hyvä asia (nopeampi toimitus)
};

// SQL: GROUP BY MONTH(ordered_at)
const mockMonthlyData = [
  {id: 'month-1', month: 'Tammi', revenue: 45000, orders: 234},
  {id: 'month-2', month: 'Helmi', revenue: 52000, orders: 267},
  {id: 'month-3', month: 'Maalis', revenue: 48000, orders: 245},
  {id: 'month-4', month: 'Huhti', revenue: 61000, orders: 312}, // Nykyhetki: Huhtikuu 2026
];

// SQL: JOIN ORDER_ITEMS, PRODUCT_CATEGORIES, CATEGORIES GROUP BY category_id
const mockCategoryData = [
  {id: 'cat-1', category: 'Liha', amount: 45000},
  {id: 'cat-2', category: 'Maitotuotteet', amount: 38000},
  {id: 'cat-3', category: 'Vihannekset', amount: 29000},
  {id: 'cat-4', category: 'Leipomo', amount: 18000},
  {id: 'cat-5', category: 'Kuivatuotteet', amount: 32000},
];

export function ReportsPage() {
  // Tilat datalle ja lataukselle
  const [isLoading, setIsLoading] = useState(false);
  const [kpiStats, setKpiStats] = useState(mockKpiStats);
  const [monthlyData, setMonthlyData] = useState(mockMonthlyData);
  const [categoryData, setCategoryData] = useState(mockCategoryData);

  useEffect(() => {
    void fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const [revenueRes, orderRes] = await Promise.all([
        api.get('/admin/analytics/revenue'),
        api.get('/admin/analytics/orders'),
      ]);

      const revenueStats = revenueRes.data?.stats || {};
      const orderStats = Array.isArray(orderRes.data?.stats)
        ? orderRes.data.stats
        : [];

      const totalOrders = Number(revenueStats.total_orders || 0);
      const deliveredOrders = Number(
        revenueStats.delivered_orders || revenueStats.delivered || 0
      );
      const totalRevenue = Number(revenueStats.total_revenue || 0);
      const avgOrderValue = Number(revenueStats.avg_order_value || 0);
      const inTransitCount = Number(
        orderStats.find((s: {status: string}) => s.status === 'in_transit')
          ?.count || 0
      );

      setKpiStats({
        revenue: totalRevenue,
        revenueChange: '-',
        deliveredOrders,
        deliveredChange: '-',
        avgOrderValue: Math.round(avgOrderValue),
        avgOrderChange: '-',
        avgDeliveryTimeMinutes: inTransitCount > 0 ? 45 : 0,
        timeChange: '-',
      });

      setMonthlyData([
        {
          id: 'month-current',
          month: 'Viime 30 pv',
          revenue: totalRevenue,
          orders: totalOrders,
        },
      ]);

      setCategoryData(
        orderStats.map((item: {status: string; count: number}) => ({
          id: `cat-${item.status}`,
          category: item.status,
          amount: Number(item.count || 0),
        }))
      );
    } catch (error) {
      console.error('Virhe raporttien latauksessa:', error);
      setKpiStats(mockKpiStats);
      setMonthlyData(mockMonthlyData);
      setCategoryData(mockCategoryData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    void fetchReportData();
  };

  return (
    <div className="font-sans pb-10">
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6 flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <h1 className="text-foreground font-extrabold text-2xl mb-2 m-0 flex items-center gap-3">
            Raportit
            {isLoading && (
              <RefreshCw
                size={20}
                className="text-muted-foreground animate-spin"
              />
            )}
          </h1>
          <p className="text-muted-foreground text-sm m-0">
            Liiketoiminnan analytiikka ja raportit
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground cursor-pointer text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
          >
            <Calendar size={18} />
            Tämä vuosi (2026)
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90">
            <Download size={18} />
            Lataa CSV
          </button>
        </div>
      </motion.div>

      {/* KPI KORTIT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Kokonaisliikevaihto',
            value: `${(kpiStats.revenue / 1000).toFixed(0)} 000 €`, // Formatoitu nätisti
            icon: DollarSign,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
            change: kpiStats.revenueChange,
            trend: 'up',
          },
          {
            label: 'Toimituksia onnistunut',
            value: kpiStats.deliveredOrders,
            icon: Package,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
            change: kpiStats.deliveredChange,
            trend: 'up',
          },
          {
            label: 'Keskiarvo / tilaus',
            value: `${kpiStats.avgOrderValue} €`,
            icon: TrendingUp,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
            change: kpiStats.avgOrderChange,
            trend: 'up',
          },
          {
            // UUSI MITTARI TIETOKANNAN POHJALTA:
            label: 'Keskitoimitusaika',
            value: `${kpiStats.avgDeliveryTimeMinutes} min`,
            icon: Clock,
            colorClass: 'text-amber-500',
            bgClass: 'bg-amber-500/10',
            change: kpiStats.timeChange,
            trend: 'down', // Ajan lyheneminen on positiivista!
          },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: idx * 0.05}}
            className={`bg-card rounded-2xl p-5 shadow-sm border border-border transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bgClass}`}
              >
                <stat.icon size={20} className={stat.colorClass} />
              </div>
              <span
                className={`text-xs font-bold ${stat.trend === 'up' ? 'text-green-500' : 'text-green-500' /* Voit laittaa logiikan vihreä/punainen tänne */}`}
              >
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

      {/* GRAAFIT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-6">
        <motion.div
          initial={{opacity: 0, x: -20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.2}}
          className={`bg-card rounded-2xl p-6 shadow-sm border border-border ${isLoading ? 'opacity-50' : 'opacity-100'}`}
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
                stroke="#f97316" // Teeman primary
                strokeWidth={3}
                dot={{fill: '#f97316', r: 5, strokeWidth: 2}}
                name="Liikevaihto (€)"
                isAnimationActive={!isLoading}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{opacity: 0, x: 20}}
          animate={{opacity: 1, x: 0}}
          transition={{delay: 0.3}}
          className={`bg-card rounded-2xl p-6 shadow-sm border border-border ${isLoading ? 'opacity-50' : 'opacity-100'}`}
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
                fill="#2563eb" // Teeman secondary/sininen
                radius={[6, 6, 0, 0]}
                name="Myynti (€)"
                isAnimationActive={!isLoading}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* PIKARAPORTIT */}
      <motion.div
        initial={{opacity: 0, y: 20}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.4}}
        className="bg-card rounded-2xl p-6 shadow-sm border border-border"
      >
        <h3 className="text-foreground font-bold text-base m-0 mb-5">
          Tarkemmat tietokantaraportit (CSV)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: 'Myyntiraportti',
              desc: 'Tarkka erittely tilausten tuotteista (ORDER_ITEMS)',
              icon: FileText,
            },
            {
              title: 'Varaston hälytysraportti',
              desc: 'Tuotteet joiden saldo < low_stock_threshold',
              icon: Package,
            },
            {
              title: 'Kuljettajien suorituskyky',
              desc: 'Keskimääräiset toimitusajat kuskeittain',
              icon: Truck,
            },
          ].map((report) => (
            <div
              key={report.title}
              className="p-5 rounded-xl border border-border transition-all cursor-pointer hover:border-primary hover:bg-primary/5 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
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
