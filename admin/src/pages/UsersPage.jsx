import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
const STC = { active: '#4CAF50', pending: '#FF9800', limited: '#FF5722', blocked: '#F44336' };
const STL = { active: 'Активен', pending: 'На модерации', limited: 'Ограничен', blocked: 'Заблокирован' };
export default function UsersPage() {
  const [users, setUsers] = useState([]); const [total, setTotal] = useState(0); const [f, setF] = useState({ role: '', status: '', search: '' }); const [ld, setLd] = useState(true);
  const load = async () => { setLd(true); try { const p = {}; if (f.role) p.role = f.role; if (f.status) p.status = f.status; if (f.search) p.search = f.search; const { data } = await adminApi.getUsers(p); setUsers(data.data.users); setTotal(data.data.total); } catch {} finally { setLd(false); } };
  useEffect(() => { load(); }, [f.role, f.status]);
  const changeSt = async (id, st) => { try { await adminApi.updateUserStatus(id, st); load(); } catch (e) { alert(e.response?.data?.message || 'Error'); } };
  const is = { padding: '10px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', fontFamily: 'inherit' };
  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Пользователи ({total})</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input style={{ ...is, width: 280 }} placeholder="Поиск..." value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select style={{ ...is, backgroundColor: '#fff' }} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="">Все роли</option><option value="seller">Продавцы</option><option value="courier">Курьеры</option></select>
        <select style={{ ...is, backgroundColor: '#fff' }} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="">Все статусы</option><option value="active">Активные</option><option value="pending">На модерации</option><option value="limited">Ограниченные</option><option value="blocked">Заблокированные</option></select>
      </div>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['ID','Имя','Телефон','Роль','Рейтинг','Баланс','Статус','Действия'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>{h}</th>)}</tr></thead>
        <tbody>{users.map((u) => <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.id}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.first_name} {u.last_name}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.phone}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}><span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, backgroundColor: u.role === 'courier' ? '#E3F2FD' : '#F3E5F5', color: u.role === 'courier' ? '#1565C0' : '#7B1FA2' }}>{u.role === 'courier' ? 'Курьер' : 'Продавец'}</span></td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.rating?.toFixed(1)}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}>{parseFloat(u.balance).toFixed(2)}</td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}><span style={{ padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, backgroundColor: (STC[u.status] || '#9E9E9E') + '20', color: STC[u.status] }}>{STL[u.status]}</span></td>
          <td style={{ padding: '12px 16px', fontSize: 14 }}><select style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', backgroundColor: '#fff' }} value={u.status} onChange={(e) => changeSt(u.id, e.target.value)}><option value="active">Активировать</option><option value="pending">На модерацию</option><option value="limited">Ограничить</option><option value="blocked">Заблокировать</option></select></td>
        </tr>)}</tbody></table>
        {ld && <div style={{ padding: 20, textAlign: 'center' }}>Загрузка...</div>}
      </div>
    </div>
  );
}
