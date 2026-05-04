import {useState, useEffect, ReactNode} from 'react';
import {useAuth} from '../contexts/AuthContext';
import {adminService} from '../services/adminService';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
}

function StatCard({label, value, icon}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className="bg-blue-100 p-3 rounded-full mr-4">{icon}</div>
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function AdminAnalytics() {
  const {token} = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const data = await adminService.getAnalytics();
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchStats();
  }, [token]);

  if (!stats) {
    return <div className="p-6">Ladataan analytiikkaa...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Analytiikka (30 pv)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Liikevaihto"
          value={`€${Number(stats.total_revenue).toFixed(2)}`}
          icon={<></>}
        />
        <StatCard
          label="Tilauksia yhteensä"
          value={stats.total_orders}
          icon={<></>}
        />
        <StatCard
          label="Toimitettuja tilauksia"
          value={stats.delivered}
          icon={<></>}
        />
        <StatCard
          label="Tilauksen keskiarvo"
          value={`€${Number(stats.avg_order_value).toFixed(2)}`}
          icon={<></>}
        />
      </div>
    </div>
  );
}
