import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';
import useOrderStore from '../../store/orderStore';
import { COLORS } from '../../utils/constants';

export default function CourierOrdersScreen({ navigation }) {
  const { orders, isLoading, fetchCourierOrders } = useOrderStore();
  const load = useCallback(() => fetchCourierOrders(), []);
  useEffect(() => { load(); }, []);
  useEffect(() => navigation.addListener('focus', load), [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мои доставки</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{orders.length}</Text>
        </View>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="cube-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Нет доставок</Text>
            <Text style={styles.emptyDesc}>Примите заявку во вкладке "Заявки"</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: COLORS.primaryGhost,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  list: { padding: 20 },
  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary },
});
