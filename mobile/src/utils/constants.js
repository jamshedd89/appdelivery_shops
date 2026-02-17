export const API_URL = 'http://192.168.223.74:3000/api';
export const SOCKET_URL = 'http://192.168.223.74:3000';

export const ROLES = { SELLER: 'seller', COURIER: 'courier' };

export const ORDER_STATUS = {
  CREATED: 'created', WAITING: 'waiting', ACCEPTED: 'accepted',
  ON_WAY_SHOP: 'on_way_shop', AT_SHOP: 'at_shop', ON_WAY_CLIENT: 'on_way_client',
  DELIVERED: 'delivered', CONFIRMED: 'confirmed', COMPLETED: 'completed',
  CANCELLED_SELLER: 'cancelled_seller', CANCELLED_COURIER: 'cancelled_courier', EXPIRED: 'expired',
};

export const ORDER_STATUS_LABELS = {
  created: 'Создана', waiting: 'Ожидает курьера', accepted: 'Принята',
  on_way_shop: 'К магазину', at_shop: 'На месте', on_way_client: 'К клиенту',
  delivered: 'Доставлено', confirmed: 'Подтверждено', completed: 'Завершено',
  cancelled_seller: 'Отм. продавцом', cancelled_courier: 'Отм. курьером', expired: 'Истёк',
};

export const TRANSPORT_LABELS = {
  foot: 'Пешком', bicycle: 'Велосипед', moto: 'Мотоцикл', car: 'Автомобиль',
};

export const TRANSPORT_ICONS = {
  foot: 'walk-outline', bicycle: 'bicycle-outline', moto: 'speedometer-outline', car: 'car-sport-outline',
};

export const COLORS = {
  primary: '#4A6CF7',
  primaryDark: '#3B5DE7',
  primaryLight: '#6B8CFF',
  primaryGhost: '#EEF2FF',

  secondary: '#7C3AED',
  secondaryLight: '#A78BFA',

  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  background: '#F8FAFC',
  card: '#FFFFFF',
  cardAlt: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  white: '#FFFFFF',
  black: '#000000',

  gradient: {
    primary: ['#4A6CF7', '#7C3AED'],
    dark: ['#1E293B', '#0F172A'],
    success: ['#10B981', '#059669'],
    warm: ['#F59E0B', '#EF4444'],
  },

  shadow: {
    color: '#4A6CF7',
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
  },
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const FONTS = {
  h1: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  body: { fontSize: 15, fontWeight: '400', color: COLORS.text, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  caption: { fontSize: 13, fontWeight: '400', color: COLORS.textSecondary },
  captionBold: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  small: { fontSize: 11, fontWeight: '500', color: COLORS.textMuted },
};
