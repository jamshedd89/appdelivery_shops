import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

const TYPE_LABELS = {
  deposit: 'Пополнение', withdrawal: 'Вывод', freeze: 'Заморозка',
  unfreeze: 'Разморозка', commission: 'Комиссия', payment: 'Оплата',
};

const TYPE_COLORS = {
  deposit: 'bg-green-100 text-green-700',
  withdrawal: 'bg-red-100 text-red-700',
  freeze: 'bg-amber-100 text-amber-700',
  unfreeze: 'bg-blue-100 text-blue-700',
  commission: 'bg-purple-100 text-purple-700',
  payment: 'bg-sky-100 text-sky-700',
};

export default function TransactionsPage() {
  const [txs, setTxs] = useState([]);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const { data } = await adminApi.getTransactions(params);
      setTxs(data.data.transactions);
      setTotal(data.data.total);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [typeFilter]);

  const headers = ['ID', 'Пользователь', 'Тип', 'Сумма', 'Описание', 'Заказ', 'Дата'];

  return (
    <div className="p-8">
      <h1 className="text-[28px] font-bold mb-5 text-dark">
        Транзакции <span className="text-lg font-normal text-gray-400">({total})</span>
      </h1>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <select
          className="filter-input"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Все типы</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
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
            {txs.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                <td className="table-cell">{t.id}</td>
                <td className="table-cell">
                  {t.user ? `${t.user.first_name} ${t.user.last_name}` : `ID:${t.user_id}`}
                </td>
                <td className="table-cell">
                  <span className={`badge ${TYPE_COLORS[t.type] || 'bg-gray-100 text-gray-600'}`}>
                    {TYPE_LABELS[t.type] || t.type}
                  </span>
                </td>
                <td className={`table-cell font-semibold ${parseFloat(t.amount) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toFixed(2)} сом
                </td>
                <td className="table-cell text-gray-500">{t.description || '—'}</td>
                <td className="table-cell">
                  {t.order_id ? <span className="text-primary-500 font-medium">#{t.order_id}</span> : '—'}
                </td>
                <td className="table-cell text-gray-500">
                  {new Date(t.created_at || t.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-5 text-center text-gray-400 text-sm">Загрузка...</div>
        )}
        {!loading && txs.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">Транзакции не найдены</div>
        )}
      </div>
    </div>
  );
}
