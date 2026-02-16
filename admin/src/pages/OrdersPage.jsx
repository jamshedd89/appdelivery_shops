import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
const SL = { created: 'Создана', waiting: 'Ожидает', accepted: 'Принята', on_way_shop: 'К магазину', at_shop: 'На месте', on_way_client: 'К клиенту', delivered: 'Доставлено', confirmed: 'Подтверждено', completed: 'Завершено', cancelled_seller: 'Отм. продавцом', cancelled_courier: 'Отм. курьером', expired: 'Истёк' };
const SC = { completed: '#4CAF50', confirmed: '#4CAF50', delivered: '#2196F3', cancelled_seller: '#F44336', cancelled_courier: '#F44336', expired: '#F44336', waiting: '#FF9800', accepted: '#FF9800', created: '#9E9E9E', on_way_shop: '#2196F3', at_shop: '#2196F3', on_way_client: '#2196F3' };
export default function OrdersPage() {
  const [orders, setOrders] = useState([]); const [total, setTotal] = useState(0); const [sf, setSf] = useState(''); const [ld, setLd] = useState(true);
  const load = async () => { setLd(true); try { const p = {}; if (sf) p.status = sf; const { data } = await adminApi.getOrders(p); setOrders(data.data.orders); setTotal(data.data.total); } catch {} finally { setLd(false); } };
  useEffect(() => { load(); }, [sf]);
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Заказы ({total})</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}><select style={{ padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', backgroundColor: '#fff' }} value={sf} onChange={(e) => setSf(e.target.value)}><option value="">Все</option>{Object.entries(SL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['ID','Продавец','Курьер','Стоимость','Комиссия','Товаров','Статус','Дата'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>{h}</th>)}</tr></thead>
        <tbody>{orders.map((o) => <tr key={o.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>#{o.id}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.seller ? `${o.seller.first_name} ${o.seller.last_name}` : '—'}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.courier ? `${o.courier.first_name} ${o.courier.last_name}` : '—'}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.delivery_cost} сом</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.commission} сом</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{o.items?.length || 0}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}><span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, backgroundColor: (SC[o.status] || '#9E9E9E') + '20', color: SC[o.status] || '#9E9E9E' }}>{SL[o.status] || o.status}</span></td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{new Date(o.created_at || o.createdAt).toLocaleString()}</td>
        </tr>)}</tbody></table>
        {ld && <div style={{ padding: 20, textAlign: 'center' }}>Загрузка...</div>}
      </div>
    </div>
  );
}
