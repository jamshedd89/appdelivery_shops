import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await adminApi.login(phone, password);
      localStorage.setItem('admin_token', data.data.accessToken);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form
        className="bg-white rounded-2xl p-10 w-[420px] shadow-xl shadow-black/5"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-1 text-dark">AppDelivery Admin</h1>
        <p className="text-sm text-gray-500 mb-6">Войдите в панель управления</p>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}

        <input
          className="filter-input w-full mb-3"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="filter-input w-full mb-4"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white border-none rounded-xl text-[15px] font-semibold cursor-pointer font-sans transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
