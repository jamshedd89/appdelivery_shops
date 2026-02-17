import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import ModerationPage from './pages/ModerationPage';

function ProtectedRoute({ children }) {
  return localStorage.getItem('admin_token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const loc = useLocation();

  if (loc.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="ml-[260px] flex-1 min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ProtectedRoute>
  );
}
