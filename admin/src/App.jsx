import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import TransactionsPage from './pages/TransactionsPage';

function ProtectedRoute({ children }) { return localStorage.getItem('admin_token') ? children : <Navigate to="/login" replace />; }

export default function App() {
  const loc = useLocation();
  if (loc.pathname === '/login') return <Routes><Route path="/login" element={<LoginPage />} /></Routes>;
  return (
    <ProtectedRoute>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}
