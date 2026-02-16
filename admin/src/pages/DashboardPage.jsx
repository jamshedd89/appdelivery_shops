import React, { useEffect, useState } from 'react';
import { Users, Package, UserCheck, Clock } from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminApi } from '../services/api';
export default function DashboardPage() {
  const [s, setS] = useState(null);
  useEffect(() => { adminApi.getDashboard().then(({ data }) => setS(data.data)).catch(console.error); }, []);
  if (!s) return <div style={{ padding: 32 }}>Загрузка...</div>;
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Дашборд</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
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
