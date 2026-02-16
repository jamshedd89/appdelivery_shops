import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/constants';

const api = axios.create({ baseURL: API_URL, timeout: 15000, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((r) => r, async (error) => {
  const orig = error.config;
  if (error.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const rt = await SecureStore.getItemAsync('refreshToken');
      if (rt) { const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: rt }); await SecureStore.setItemAsync('accessToken', data.data.accessToken); await SecureStore.setItemAsync('refreshToken', data.data.refreshToken); orig.headers.Authorization = `Bearer ${data.data.accessToken}`; return api(orig); }
    } catch { await SecureStore.deleteItemAsync('accessToken'); await SecureStore.deleteItemAsync('refreshToken'); }
  }
  return Promise.reject(error);
});

export const authApi = {
  sendCode: (phone) => api.post('/auth/send-code', { phone }),
  verifyCode: (phone, code) => api.post('/auth/verify-code', { phone, code }),
  registerSeller: (data) => api.post('/auth/register/seller', data),
  registerCourier: (data) => api.post('/auth/register/courier', data),
  login: (phone, password) => api.post('/auth/login', { phone, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getSellerOrders: (status) => api.get('/orders/seller', { params: { status } }),
  getAvailableOrders: () => api.get('/orders/available'),
  getCourierOrders: (status) => api.get('/orders/courier', { params: { status } }),
  getById: (id) => api.get(`/orders/${id}`),
  accept: (id) => api.post(`/orders/${id}/accept`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelBySeller: (id, reason) => api.post(`/orders/${id}/cancel-seller`, { reason }),
  cancelByCourier: (id, reason) => api.post(`/orders/${id}/cancel-courier`, { reason }),
  confirmDelivery: (id) => api.post(`/orders/${id}/confirm`),
};

export const balanceApi = {
  get: () => api.get('/balance'),
  deposit: (amount) => api.post('/balance/deposit', { amount }),
  withdraw: (amount) => api.post('/balance/withdraw', { amount }),
  getTransactions: (limit, offset) => api.get('/balance/transactions', { params: { limit, offset } }),
};

export const reviewsApi = {
  create: (orderId, data) => api.post(`/reviews/order/${orderId}`, data),
  getMy: () => api.get('/reviews/my'),
  getForUser: (userId) => api.get(`/reviews/user/${userId}`),
};

export default api;
