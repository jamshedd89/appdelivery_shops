import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api';
export default function LoginPage() {
  const [phone, setPhone] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const nav = useNavigate();
  const handleSubmit = async (e) => { e.preventDefault(); setError(''); setLoading(true); try { const { data } = await adminApi.login(phone, password); localStorage.setItem('admin_token', data.data.accessToken); nav('/'); } catch (err) { setError(err.response?.data?.message || 'Login failed'); } finally { setLoading(false); } };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <form style={{ backgroundColor: '#fff', borderRadius: 20, padding: 40, width: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} onSubmit={handleSubmit}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>AppDelivery Admin</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Войдите в панель управления</p>
        {error && <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <input style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, marginBottom: 12, outline: 'none', fontFamily: 'inherit' }} placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, marginBottom: 12, outline: 'none', fontFamily: 'inherit' }} type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button style={{ width: '100%', padding: '12px 16px', backgroundColor: '#4A90D9', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} disabled={loading}>{loading ? 'Вход...' : 'Войти'}</button>
      </form>
    </div>
  );
}
