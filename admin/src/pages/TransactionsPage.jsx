import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
const TL = { deposit: 'Пополнение', withdrawal: 'Вывод', freeze: 'Заморозка', unfreeze: 'Разморозка', commission: 'Комиссия', payment: 'Оплата' };
const TC = { deposit: '#4CAF50', withdrawal: '#F44336', freeze: '#FF9800', unfreeze: '#2196F3', commission: '#9C27B0', payment: '#4A90D9' };
export default function TransactionsPage() {
  const [txs, setTxs] = useState([]); const [total, setTotal] = useState(0); const [tf, setTf] = useState(''); const [ld, setLd] = useState(true);
  const load = async () => { setLd(true); try { const p = {}; if (tf) p.type = tf; const { data } = await adminApi.getTransactions(p); setTxs(data.data.transactions); setTotal(data.data.total); } catch {} finally { setLd(false); } };
  useEffect(() => { load(); }, [tf]);
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Транзакции ({total})</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}><select style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', backgroundColor: '#fff' }} value={tf} onChange={(e) => setTf(e.target.value)}><option value="">Все</option>{Object.entries(TL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['ID','Пользователь','Тип','Сумма','Описание','Заказ','Дата'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>{h}</th>)}</tr></thead>
        <tbody>{txs.map((t) => <tr key={t.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.id}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.user ? `${t.user.first_name} ${t.user.last_name}` : `ID:${t.user_id}`}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}><span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, backgroundColor: (TC[t.type] || '#9E9E9E') + '20', color: TC[t.type] || '#9E9E9E' }}>{TL[t.type] || t.type}</span></td>
          <td style={{ padding: '12px 16px', fontSize: 14, color: parseFloat(t.amount) >= 0 ? '#4CAF50' : '#F44336', fontWeight: 600 }}>{parseFloat(t.amount) >= 0 ? '+' : ''}{parseFloat(t.amount).toFixed(2)} сом</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.description || '—'}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{t.order_id ? `#${t.order_id}` : '—'}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{new Date(t.created_at || t.createdAt).toLocaleString()}</td>
        </tr>)}</tbody></table>
        {ld && <div style={{ padding: 20, textAlign: 'center' }}>Загрузка...</div>}
      </div>
    </div>
  );
}
