import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, UserCheck, Clock, DollarSign, ShieldAlert, AlertTriangle, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminApi } from '../services/api';

export default function DashboardPage() {
  const nav = useNavigate();
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
            {[...Array(8)].map((_, i) => (
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

      {/* Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Всего пользователей" value={s.totalUsers} icon={Users} />
        <StatCard title="Продавцы" value={s.totalSellers} icon={Users} color="#5C6BC0" />
        <StatCard title="Курьеры" value={s.totalCouriers} icon={UserCheck} color="#4CAF50" />
        <StatCard title="Доход (комиссии)" value={`${(s.totalRevenue || 0).toFixed(0)} сом`} icon={DollarSign} color="#E91E63" />
      </div>

      {/* Order stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard title="Всего заказов" value={s.totalOrders} icon={Package} color="#9C27B0" />
        <StatCard title="Активные" value={s.activeOrders} icon={TrendingUp} color="#FF5722" />
        <StatCard title="Завершённые" value={s.completedOrders} icon={Package} color="#4CAF50" />
        <StatCard title="Заблокированные" value={s.blockedUsers || 0} icon={ShieldAlert} color="#F44336" />
      </div>

      {/* Quick actions */}
      {s.pendingCouriers > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => nav('/moderation')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-700" />
            </div>
            <div>
              <div className="text-base font-bold text-amber-800">{s.pendingCouriers} курьеров ожидают модерации</div>
              <div className="text-sm text-amber-600">Нажмите для проверки документов</div>
            </div>
          </div>
          <span className="badge bg-amber-500 text-white text-lg px-4 py-1.5">{s.pendingCouriers}</span>
        </div>
      )}
    </div>
  );
}
