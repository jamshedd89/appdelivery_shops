import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Package, UserCheck, DollarSign, ShieldAlert, AlertTriangle, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminApi } from '../services/api';

export default function DashboardPage() {
  const nav = useNavigate();
  const [s, setS] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTx, setRecentTx] = useState([]);

  useEffect(() => {
    adminApi.getDashboard().then(({ data }) => setS(data.data)).catch(console.error);
    adminApi.getOrders(5, 0).then(({ data }) => setRecentOrders(data.data.orders || [])).catch(() => {});
    adminApi.getTransactions(5, 0).then(({ data }) => setRecentTx(data.data.transactions || [])).catch(() => {});
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

  const statusColors = {
    created: 'bg-gray-100 text-gray-700',
    waiting: 'bg-amber-100 text-amber-700',
    accepted: 'bg-blue-100 text-blue-700',
    on_way_shop: 'bg-blue-100 text-blue-700',
    at_shop: 'bg-indigo-100 text-indigo-700',
    on_way_client: 'bg-cyan-100 text-cyan-700',
    delivered: 'bg-green-100 text-green-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled_seller: 'bg-red-100 text-red-700',
    cancelled_courier: 'bg-red-100 text-red-700',
    expired: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    created: 'Создана', waiting: 'Ожидает', accepted: 'Принята',
    on_way_shop: 'К магазину', at_shop: 'На месте', on_way_client: 'К клиенту',
    delivered: 'Доставлено', confirmed: 'Подтверждено', completed: 'Завершено',
    cancelled_seller: 'Отм. прод.', cancelled_courier: 'Отм. кур.', expired: 'Истёк',
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[28px] font-bold text-dark">Дашборд</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Activity size={16} />
          <span>Обновлено только что</span>
        </div>
      </div>

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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors mb-6" onClick={() => nav('/moderation')}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-700" />
            </div>
            <div>
              <div className="text-base font-bold text-amber-800">{s.pendingCouriers} курьеров ожидают модерации</div>
              <div className="text-sm text-amber-600">Нажмите для проверки документов</div>
            </div>
          </div>
          <span className="bg-amber-500 text-white text-lg px-4 py-1.5 rounded-xl font-bold">{s.pendingCouriers}</span>
        </div>
      )}

      {/* Recent data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">Последние заказы</h2>
            <button onClick={() => nav('/orders')} className="text-sm text-primary-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">Все заказы →</button>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => nav(`/orders/${o.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Package size={16} className="text-primary-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-dark">Заказ #{o.id}</span>
                    <div className="text-xs text-gray-500">{o.seller?.first_name} {o.seller?.last_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold">{o.delivery_cost} сом</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет заказов</div>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-dark">Последние транзакции</h2>
            <button onClick={() => nav('/transactions')} className="text-sm text-primary-600 font-semibold hover:underline bg-transparent border-none cursor-pointer">Все транзакции →</button>
          </div>
          <div className="space-y-3">
            {recentTx.map((tx) => {
              const isPositive = parseFloat(tx.amount) > 0;
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                      {isPositive ? <ArrowDownRight size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-red-600" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-dark block max-w-[200px] truncate">{tx.description}</span>
                      <div className="text-xs text-gray-500">{tx.user?.first_name} {tx.user?.last_name}</div>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} сом
                  </span>
                </div>
              );
            })}
            {recentTx.length === 0 && <div className="text-sm text-gray-400 text-center py-4">Нет транзакций</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
