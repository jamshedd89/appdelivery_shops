import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  limited: 'bg-orange-100 text-orange-700',
  blocked: 'bg-red-100 text-red-700',
};
const STATUS_LABELS = {
  active: 'Активен',
  pending: 'На модерации',
  limited: 'Ограничен',
  blocked: 'Заблокирован',
};

export default function UsersPage() {
  const nav = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const { data } = await adminApi.getUsers(params);
      setUsers(data.data.users);
      setTotal(data.data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filters.role, filters.status]);

  const changeStatus = async (id, status) => {
    try {
      await adminApi.updateUserStatus(id, status);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const headers = ['ID', 'Имя', 'Телефон', 'Роль', 'Рейтинг', 'Баланс', 'Штрафы', 'Статус', 'Действия'];

  return (
    <div className="p-8">
      <h1 className="text-[28px] font-bold mb-5 text-dark">
        Пользователи <span className="text-lg font-normal text-gray-400">({total})</span>
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          className="filter-input w-72"
          placeholder="Поиск по имени или телефону..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <select
          className="filter-input"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Все роли</option>
          <option value="seller">Продавцы</option>
          <option value="courier">Курьеры</option>
        </select>
        <select
          className="filter-input"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="pending">На модерации</option>
          <option value="limited">Ограниченные</option>
          <option value="blocked">Заблокированные</option>
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
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => nav(`/users/${u.id}`)}>
                <td className="table-cell">{u.id}</td>
                <td className="table-cell font-medium text-primary-500 hover:underline">{u.first_name} {u.last_name}</td>
                <td className="table-cell text-gray-500">{u.phone}</td>
                <td className="table-cell">
                  <span className={`badge ${u.role === 'courier' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {u.role === 'courier' ? 'Курьер' : 'Продавец'}
                  </span>
                </td>
                <td className="table-cell">{u.rating?.toFixed(1)}</td>
                <td className="table-cell font-medium">{parseFloat(u.balance).toFixed(2)}</td>
                <td className="table-cell text-xs">
                  {u.role === 'courier' && u.courierProfile ? (
                    <div className="space-y-0.5">
                      <div>Счёт: <span className="font-semibold">{u.courierProfile.rating_score}</span></div>
                      <div>Опоздания: <span className={`font-semibold ${u.courierProfile.late_count >= 3 ? 'text-red-600' : ''}`}>{u.courierProfile.late_count}</span></div>
                      <div>Отмены: <span className={`font-semibold ${u.courierProfile.consecutive_cancels >= 3 ? 'text-red-600' : ''}`}>{u.courierProfile.cancel_count} ({u.courierProfile.consecutive_cancels})</span></div>
                    </div>
                  ) : u.role === 'seller' && u.extra_commission_rate > 0 ? (
                    <span className="badge bg-red-100 text-red-700">+{(u.extra_commission_rate * 100).toFixed(0)}% ком.</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="table-cell">
                  <span className={`badge ${STATUS_COLORS[u.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[u.status]}
                  </span>
                </td>
                <td className="table-cell">
                  <select
                    className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[13px] font-sans bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                    value={u.status}
                    onChange={(e) => changeStatus(u.id, e.target.value)}
                  >
                    <option value="active">Активировать</option>
                    <option value="pending">На модерацию</option>
                    <option value="limited">Ограничить</option>
                    <option value="blocked">Заблокировать</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-5 text-center text-gray-400 text-sm">Загрузка...</div>
        )}
        {!loading && users.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">Пользователи не найдены</div>
        )}
      </div>
    </div>
  );
}
