import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OrderCard from '../../components/OrderCard';
import useAuthStore from '../../store/authStore';
import { ordersApi } from '../../services/api';
import { COLORS, ORDER_STATUS_LABELS, SHADOWS } from '../../utils/constants';

const FILTER_TABS = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
  { key: 'cancelled', label: 'Отменённые' },
];

const ACTIVE_STATUSES = ['created', 'waiting', 'accepted', 'on_way_shop', 'at_shop', 'on_way_client', 'delivered'];
const COMPLETED_STATUSES = ['confirmed', 'completed'];
const CANCELLED_STATUSES = ['cancelled_seller', 'cancelled_courier', 'expired'];

export default function OrderHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const loadOrders = async () => {
    try {
      const isSeller = user?.role === 'seller';
      const { data } = isSeller
        ? await ordersApi.getSellerOrders()
        : await ordersApi.getCourierOrders();
      setOrders(data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadOrders(); }, []);
  useEffect(() => navigation.addListener('focus', loadOrders), [navigation]);
  const onRefresh = useCallback(() => { setRefreshing(true); loadOrders(); }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ACTIVE_STATUSES.includes(o.status);
    if (activeTab === 'completed') return COMPLETED_STATUSES.includes(o.status);
    if (activeTab === 'cancelled') return CANCELLED_STATUSES.includes(o.status);
    return true;
  });

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
    completed: orders.filter((o) => COMPLETED_STATUSES.includes(o.status)).length,
    cancelled: orders.filter((o) => CANCELLED_STATUSES.includes(o.status)).length,
  };

  if (loading) return (
    <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>История заказов</Text>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatPill label="Всего" value={stats.total} color={COLORS.text} />
        <StatPill label="Активные" value={stats.active} color="#3B82F6" />
        <StatPill label="Завершено" value={stats.completed} color={COLORS.success} />
        <StatPill label="Отменено" value={stats.cancelled} color={COLORS.danger} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={56} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Нет заказов</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'all' ? 'Заказы появятся здесь' : `Нет заказов в категории "${FILTER_TABS.find((t) => t.key === activeTab)?.label}"`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function StatPill({ label, value, color }) {
  return (
    <View style={styles.statPill}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.small,
  },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14,
  },
  statPill: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 14,
    paddingVertical: 12, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, marginTop: 2, textTransform: 'uppercase' },

  tabsRow: {
    flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 14,
  },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.cardAlt,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.dark },

  list: { paddingHorizontal: 20, paddingBottom: 40 },

  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, textAlign: 'center' },
});
