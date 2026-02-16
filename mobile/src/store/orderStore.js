import { create } from 'zustand';
import { ordersApi } from '../services/api';

const useOrderStore = create((set, get) => ({
  orders: [], availableOrders: [], currentOrder: null, isLoading: false,
  fetchSellerOrders: async (status) => { set({ isLoading: true }); try { const { data } = await ordersApi.getSellerOrders(status); set({ orders: data.data, isLoading: false }); } catch { set({ isLoading: false }); } },
  createOrder: async (d) => { const { data } = await ordersApi.create(d); set({ orders: [data.data.order, ...get().orders] }); return data.data; },
  fetchAvailableOrders: async () => { set({ isLoading: true }); try { const { data } = await ordersApi.getAvailableOrders(); set({ availableOrders: data.data, isLoading: false }); } catch { set({ isLoading: false }); } },
  fetchCourierOrders: async (status) => { set({ isLoading: true }); try { const { data } = await ordersApi.getCourierOrders(status); set({ orders: data.data, isLoading: false }); } catch { set({ isLoading: false }); } },
  acceptOrder: async (id) => { const { data } = await ordersApi.accept(id); set({ currentOrder: data.data }); return data.data; },
  updateOrderStatus: async (id, status) => { const { data } = await ordersApi.updateStatus(id, status); set({ currentOrder: data.data }); return data.data; },
  confirmDelivery: async (id) => { const { data } = await ordersApi.confirmDelivery(id); set({ currentOrder: data.data }); return data.data; },
  cancelBySeller: async (id, reason) => { const { data } = await ordersApi.cancelBySeller(id, reason); return data.data; },
  setCurrentOrder: (order) => set({ currentOrder: order }),
}));
export default useOrderStore;
