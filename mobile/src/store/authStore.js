import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../services/api';

const useAuthStore = create((set) => ({
  user: null, isAuthenticated: false, isLoading: true,
  initialize: async () => {
    try { const t = await SecureStore.getItemAsync('accessToken'); if (t) { const { data } = await authApi.getProfile(); set({ user: data.data, isAuthenticated: true, isLoading: false }); } else set({ isLoading: false }); }
    catch { await SecureStore.deleteItemAsync('accessToken'); await SecureStore.deleteItemAsync('refreshToken'); set({ user: null, isAuthenticated: false, isLoading: false }); }
  },
  login: async (phone, password) => { const { data } = await authApi.login(phone, password); const { user, accessToken, refreshToken } = data.data; await SecureStore.setItemAsync('accessToken', accessToken); await SecureStore.setItemAsync('refreshToken', refreshToken); set({ user, isAuthenticated: true }); return user; },
  registerSeller: async (formData) => { const { data } = await authApi.registerSeller(formData); const { user, accessToken, refreshToken } = data.data; await SecureStore.setItemAsync('accessToken', accessToken); await SecureStore.setItemAsync('refreshToken', refreshToken); set({ user, isAuthenticated: true }); return user; },
  registerCourier: async (formData) => { const { data } = await authApi.registerCourier(formData); const { user, accessToken, refreshToken } = data.data; await SecureStore.setItemAsync('accessToken', accessToken); await SecureStore.setItemAsync('refreshToken', refreshToken); set({ user, isAuthenticated: true }); return user; },
  logout: async () => { await SecureStore.deleteItemAsync('accessToken'); await SecureStore.deleteItemAsync('refreshToken'); set({ user: null, isAuthenticated: false }); },
  refreshProfile: async () => { try { const { data } = await authApi.getProfile(); set({ user: data.data }); } catch {} },
}));
export default useAuthStore;
