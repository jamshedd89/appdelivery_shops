export const API_URL = 'http://10.0.2.2:3000/api';
export const SOCKET_URL = 'http://10.0.2.2:3000';
export const ROLES = { SELLER: 'seller', COURIER: 'courier' };
export const ORDER_STATUS = { CREATED: 'created', WAITING: 'waiting', ACCEPTED: 'accepted', ON_WAY_SHOP: 'on_way_shop', AT_SHOP: 'at_shop', ON_WAY_CLIENT: 'on_way_client', DELIVERED: 'delivered', CONFIRMED: 'confirmed', COMPLETED: 'completed', CANCELLED_SELLER: 'cancelled_seller', CANCELLED_COURIER: 'cancelled_courier', EXPIRED: 'expired' };
export const ORDER_STATUS_LABELS = { created: 'Создана', waiting: 'Ожидает курьера', accepted: 'Принята', on_way_shop: 'К магазину', at_shop: 'На месте', on_way_client: 'К клиенту', delivered: 'Доставлено', confirmed: 'Подтверждено', completed: 'Завершено', cancelled_seller: 'Отм. продавцом', cancelled_courier: 'Отм. курьером', expired: 'Истёк' };
export const TRANSPORT_LABELS = { foot: 'Пешком', bicycle: 'Велосипед', moto: 'Мотоцикл', car: 'Автомобиль' };
export const COLORS = { primary: '#4A90D9', secondary: '#5C6BC0', success: '#4CAF50', warning: '#FF9800', danger: '#F44336', background: '#F5F7FA', card: '#FFFFFF', text: '#1A1A2E', textSecondary: '#6B7280', border: '#E5E7EB', white: '#FFFFFF' };
