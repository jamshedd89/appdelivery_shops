import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { SOCKET_URL } from '../utils/constants';
let ordersSocket = null;
export async function connectOrdersSocket() {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token || ordersSocket?.connected) return ordersSocket;
  ordersSocket = io(`${SOCKET_URL}/orders`, { auth: { token }, transports: ['websocket'], reconnection: true, reconnectionDelay: 3000 });
  return ordersSocket;
}
export function getOrdersSocket() { return ordersSocket; }
export function disconnectOrdersSocket() { if (ordersSocket) { ordersSocket.disconnect(); ordersSocket = null; } }
