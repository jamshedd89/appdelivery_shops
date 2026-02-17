import axios from 'axios';
const api = axios.create({ baseURL: '/api', timeout: 15000 });
api.interceptors.request.use((c) => { const t = localStorage.getItem('admin_token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
api.interceptors.response.use((r) => r, (e) => { if (e.response?.status === 401) { localStorage.removeItem('admin_token'); window.location.href = '/login'; } return Promise.reject(e); });
export const adminApi = {
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (p) => api.get('/admin/users', { params: p }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  getOrders: (p) => api.get('/admin/orders', { params: p }),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  getOrderMessages: (id) => api.get(`/admin/orders/${id}/messages`),
  getTransactions: (p) => api.get('/admin/transactions', { params: p }),
};
export default api;
