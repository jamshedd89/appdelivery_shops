import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, DollarSign, LogOut } from 'lucide-react';
const links = [{ to: '/', icon: LayoutDashboard, label: 'Дашборд' }, { to: '/users', icon: Users, label: 'Пользователи' }, { to: '/orders', icon: Package, label: 'Заказы' }, { to: '/transactions', icon: DollarSign, label: 'Финансы' }];
export default function Sidebar() {
  const nav = useNavigate();
  return (
    <aside style={{ width: 260, backgroundColor: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', padding: '24px 16px', minHeight: '100vh', position: 'fixed', left: 0, top: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, paddingLeft: 8 }}><h2 style={{ fontSize: 20, fontWeight: 700 }}>AppDelivery</h2><span style={{ fontSize: 11, background: '#4A90D9', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>Admin</span></div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {links.map(({ to, icon: Icon, label }) => <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, color: isActive ? '#fff' : '#9CA3AF', fontSize: 14, fontWeight: 500, backgroundColor: isActive ? '#4A90D9' : 'transparent' })}><Icon size={20} /><span>{label}</span></NavLink>)}
      </nav>
      <button onClick={() => { localStorage.removeItem('admin_token'); nav('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, color: '#9CA3AF', fontSize: 14, fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}><LogOut size={20} /><span>Выход</span></button>
    </aside>
  );
}
