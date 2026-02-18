import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

const STATUS_BADGE = {
  created: { label: 'Поиск...', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  waiting: { label: 'Поиск...', bg: '#f1f5f9', color: '#64748b', dot: '#94a3b8' },
  accepted: { label: 'Принята', bg: COLORS.primaryGhost, color: COLORS.primary, dot: COLORS.primary },
  on_way_shop: { label: 'В пути', bg: COLORS.primaryGhost, color: COLORS.primary, dot: COLORS.primary },
  at_shop: { label: 'На месте', bg: '#dbeafe', color: '#2563eb', dot: '#2563eb' },
  on_way_client: { label: 'К клиенту', bg: '#ede9fe', color: '#7c3aed', dot: '#7c3aed' },
  delivered: { label: 'Доставлено', bg: '#dbeafe', color: '#2563eb', dot: '#2563eb' },
  confirmed: { label: 'Подтверждено', bg: '#d1fae5', color: '#059669', dot: '#059669' },
  completed: { label: 'Завершено', bg: '#d1fae5', color: '#059669', dot: '#059669' },
  cancelled_seller: { label: 'Отменено', bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
  cancelled_courier: { label: 'Отменено', bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
  expired: { label: 'Истёк', bg: '#fee2e2', color: '#dc2626', dot: '#dc2626' },
};

export default function SellerHomeScreen({ navigation }) {
  const { orders, isLoading, fetchSellerOrders } = useOrderStore();
  const user = useAuthStore((s) => s.user);
  const load = useCallback(() => fetchSellerOrders(), []);

  useEffect(() => { load(); }, []);
  useEffect(() => navigation.addListener('focus', load), [navigation]);

  const activeOrders = orders.filter((o) =>
    !['completed', 'confirmed', 'cancelled_seller', 'cancelled_courier', 'expired'].includes(o.status)
  );

  const balance = parseFloat(user?.balance || 0).toFixed(2);

  const renderHeader = () => (
    <View>
      {/* Profile bar */}
      <View style={styles.profileBar}>
        <View style={styles.profileLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.first_name || 'П')[0]}</Text>
          </View>
          <View>
            <Text style={styles.greetSmall}>С возвращением,</Text>
            <Text style={styles.profileName}>{user?.first_name} {user?.last_name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Текущий баланс</Text>
          <Text style={styles.balanceValue}>{balance} сом</Text>
          {parseFloat(balance) < 100 && (
            <View style={styles.lowBalanceRow}>
              <Ionicons name="information-circle" size={14} color={COLORS.primary} />
              <Text style={styles.lowBalanceText}>Низкий баланс</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.topUpBtn}>
          <Text style={styles.topUpText}>Пополнить</Text>
        </TouchableOpacity>
      </View>

      {/* Create delivery button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate('CreateOrder')}
        activeOpacity={0.9}
      >
        <Ionicons name="add-circle" size={22} color={COLORS.dark} />
        <Text style={styles.createBtnText}>Создать новую доставку</Text>
      </TouchableOpacity>

      {/* Active deliveries header */}
      {orders.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Активные доставки</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeOrders.length} заказов</Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            activeOpacity={0.7}
          >
            <View style={styles.orderCardTop}>
              <View>
                <Text style={styles.orderId}>ЗАКАЗ #{item.id}</Text>
                <Text style={styles.orderAddress} numberOfLines={1}>
                  {item.items?.[0]?.delivery_address || 'Адрес доставки'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BADGE[item.status]?.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_BADGE[item.status]?.dot }]} />
                <Text style={[styles.statusText, { color: STATUS_BADGE[item.status]?.color }]}>
                  {STATUS_BADGE[item.status]?.label}
                </Text>
              </View>
            </View>

            {item.courier ? (
              <View style={styles.courierRow}>
                <View style={styles.courierAvatar}>
                  <Text style={styles.courierAvatarText}>{item.courier.first_name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courierName}>{item.courier.first_name} {item.courier.last_name}</Text>
                  <View style={styles.courierMeta}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.courierRating}>{item.courier.rating?.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.orderPrice}>{item.delivery_cost} сом</Text>
              </View>
            ) : (
              <View style={styles.searchingRow}>
                <View style={styles.searchIcon}>
                  <Ionicons name="search" size={18} color={COLORS.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.searchingText}>Ищем ближайшего курьера</Text>
                  <View style={styles.progressBar}>
                    <View style={styles.progressFill} />
                  </View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.primary} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Нет заявок</Text>
            <Text style={styles.emptyDesc}>Создайте первую заявку на доставку</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingHorizontal: 20, paddingBottom: 20 },

  profileBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingBottom: 16,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primaryGhost, borderWidth: 2,
    borderColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  greetSmall: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.white, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },

  balanceCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 16,
  },
  balanceLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  balanceValue: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 4 },
  lowBalanceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6,
  },
  lowBalanceText: { fontSize: 10, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  topUpBtn: {
    backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 9999, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  topUpText: { fontWeight: '700', fontSize: 14, color: COLORS.dark },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 9999,
    marginBottom: 24, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
  },
  createBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.dark },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  countBadge: {
    backgroundColor: COLORS.primaryGhost, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 9999,
  },
  countBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  orderCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  orderAddress: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2, maxWidth: 200 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },

  courierRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, backgroundColor: COLORS.background, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  courierAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  courierAvatarText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  courierName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  courierMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  courierRating: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  orderPrice: { fontSize: 18, fontWeight: '800', color: COLORS.text },

  searchingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, backgroundColor: COLORS.background, borderRadius: 12,
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.border,
  },
  searchIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.borderLight,
    justifyContent: 'center', alignItems: 'center',
  },
  searchingText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  progressBar: {
    height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2,
    marginTop: 8, overflow: 'hidden',
  },
  progressFill: {
    width: '33%', height: '100%', backgroundColor: COLORS.primary, borderRadius: 2,
  },

  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary },
});
