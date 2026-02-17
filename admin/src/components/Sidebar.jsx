import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Package, DollarSign, LogOut } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/users', icon: Users, label: 'Пользователи' },
  { to: '/orders', icon: Package, label: 'Заказы' },
  { to: '/transactions', icon: DollarSign, label: 'Финансы' },
];

export default function Sidebar() {
  const nav = useNavigate();

  return (
    <aside className="w-[260px] bg-dark text-white flex flex-col px-4 py-6 min-h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 pl-2">
        <h2 className="text-xl font-bold">AppDelivery</h2>
        <span className="text-[11px] bg-primary-500 px-2 py-0.5 rounded-md font-semibold">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('admin_token');
          nav('/login');
        }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full bg-transparent border-none cursor-pointer"
      >
        <LogOut size={20} />
        <span>Выход</span>
      </button>
    </aside>
  );
}
