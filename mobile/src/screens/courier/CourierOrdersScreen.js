import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import OrderCard from '../../components/OrderCard';
import useOrderStore from '../../store/orderStore';
import { COLORS } from '../../utils/constants';

export default function CourierOrdersScreen({ navigation }) {
  const { orders, isLoading, fetchCourierOrders } = useOrderStore();
  const load = useCallback(() => fetchCourierOrders(), []);
  useEffect(() => { load(); }, []);
  useEffect(() => navigation.addListener('focus', load), [navigation]);
  return (
    <View style={s.c}>
      <Text style={s.t}>Мои доставки</Text>
      <FlatList data={orders} keyExtractor={(i) => String(i.id)} renderItem={({ item }) => <OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />} contentContainerStyle={s.l} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />} ListEmptyComponent={<Text style={s.e}>Нет доставок</Text>} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text, paddingHorizontal: 20, paddingTop: 16 }, l: { padding: 20 }, e: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 16 } });
