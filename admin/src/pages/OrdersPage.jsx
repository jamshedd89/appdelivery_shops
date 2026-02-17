import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

const STATUS_LABELS = {
  created: 'Создана', waiting: 'Ожидает', accepted: 'Принята',
  on_way_shop: 'К магазину', at_shop: 'На месте', on_way_client: 'К клиенту',
  delivered: 'Доставлено', confirmed: 'Подтверждено', completed: 'Завершено',
  cancelled_seller: 'Отм. продавцом', cancelled_courier: 'Отм. курьером', expired: 'Истёк',
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  confirmed: 'bg-green-100 text-green-700',
  delivered: 'bg-blue-100 text-blue-700',
  cancelled_seller: 'bg-red-100 text-red-700',
  cancelled_courier: 'bg-red-100 text-red-700',
  expired: 'bg-red-100 text-red-700',
  waiting: 'bg-amber-100 text-amber-700',
  accepted: 'bg-amber-100 text-amber-700',
  created: 'bg-gray-100 text-gray-600',
  on_way_shop: 'bg-blue-100 text-blue-700',
  at_shop: 'bg-blue-100 text-blue-700',
  on_way_client: 'bg-blue-100 text-blue-700',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminApi.getOrders(params);
      setOrders(data.data.orders);
      setTotal(data.data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const headers = ['ID', 'Продавец', 'Курьер', 'Стоимость', 'Комиссия', 'Товаров', 'Статус', 'Дата'];

  return (
    <div className="p-8">
      <h1 className="text-[28px] font-bold mb-5 text-dark">
        Заказы <span className="text-lg font-normal text-gray-400">({total})</span>
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          className="filter-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h} className="table-header">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="table-cell font-medium">#{o.id}</td>
                <td className="table-cell">
                  {o.seller ? `${o.seller.first_name} ${o.seller.last_name}` : '—'}
                </td>
                <td className="table-cell">
                  {o.courier ? `${o.courier.first_name} ${o.courier.last_name}` : '—'}
                </td>
                <td className="table-cell font-medium">{o.delivery_cost} сом</td>
                <td className="table-cell text-gray-500">{o.commission} сом</td>
                <td className="table-cell">{o.items?.length || 0}</td>
                <td className="table-cell">
                  <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </td>
                <td className="table-cell text-gray-500">
                  {new Date(o.created_at || o.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-5 text-center text-gray-400 text-sm">Загрузка...</div>
        )}
        {!loading && orders.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">Заказы не найдены</div>
        )}
      </div>
    </div>
  );
}
