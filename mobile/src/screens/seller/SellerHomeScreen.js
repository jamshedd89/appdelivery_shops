import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { COLORS, SHADOWS } from '../../utils/constants';

export default function SellerHomeScreen({ navigation }) {
  const { orders, isLoading, fetchSellerOrders } = useOrderStore();
  const user = useAuthStore((s) => s.user);
  const load = useCallback(() => fetchSellerOrders(), []);

  useEffect(() => { load(); }, []);
  useEffect(() => navigation.addListener('focus', load), [navigation]);

  const activeCount = orders.filter((o) =>
    !['completed', 'confirmed', 'cancelled_seller', 'cancelled_courier', 'expired'].includes(o.status)
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={COLORS.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Привет,</Text>
            <Text style={styles.name}>{user?.first_name || 'Продавец'}</Text>
          </View>
          <View style={styles.activeWrap}>
            <Text style={styles.activeNum}>{activeCount}</Text>
            <Text style={styles.activeLabel}>Активных</Text>
          </View>
        </View>
        <Button
          title="Создать заявку"
          variant="outline"
          onPress={() => navigation.navigate('CreateOrder')}
          icon={<Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />}
          style={styles.createBtn}
        />
      </LinearGradient>

      {/* Orders list */}
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            showCourier
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="document-text-outline" size={56} color={COLORS.textMuted} />
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
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  activeWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeNum: { fontSize: 22, fontWeight: '800', color: COLORS.white },
  activeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginTop: 2 },
  createBtn: {
    backgroundColor: COLORS.white,
    borderColor: 'transparent',
    borderRadius: 14,
  },
  list: { padding: 20, paddingTop: 20 },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary },
});
