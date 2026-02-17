import React, { useEffect, useState } from 'react';
import { Users, Package, UserCheck, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminApi } from '../services/api';

export default function DashboardPage() {
  const [s, setS] = useState(null);

  useEffect(() => {
    adminApi.getDashboard()
      .then(({ data }) => setS(data.data))
      .catch(console.error);
  }, []);

  if (!s) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-[28px] font-bold mb-6 text-dark">Дашборд</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Всего" value={s.totalUsers} icon={Users} />
        <StatCard title="Продавцы" value={s.totalSellers} icon={Users} color="#5C6BC0" />
        <StatCard title="Курьеры" value={s.totalCouriers} icon={UserCheck} color="#4CAF50" />
        <StatCard title="На модерации" value={s.pendingCouriers} icon={Clock} color="#FF9800" />
        <StatCard title="Всего заказов" value={s.totalOrders} icon={Package} color="#9C27B0" />
        <StatCard title="Активные" value={s.activeOrders} icon={Package} color="#FF5722" />
        <StatCard title="Завершённые" value={s.completedOrders} icon={Package} color="#4CAF50" />
      </div>
    </div>
  );
}
