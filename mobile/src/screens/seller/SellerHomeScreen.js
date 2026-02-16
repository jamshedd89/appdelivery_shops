import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import OrderCard from '../../components/OrderCard';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import { COLORS } from '../../utils/constants';

export default function SellerHomeScreen({ navigation }) {
  const { orders, isLoading, fetchSellerOrders } = useOrderStore();
  const load = useCallback(() => fetchSellerOrders(), []);
  useEffect(() => { load(); }, []);
  useEffect(() => navigation.addListener('focus', load), [navigation]);
  return (
    <View style={s.c}>
      <View style={s.h}><Text style={s.t}>Мои заявки</Text><Button title="+ Создать" onPress={() => navigation.navigate('CreateOrder')} style={{ paddingVertical: 10, paddingHorizontal: 16 }} /></View>
      <FlatList data={orders} keyExtractor={(i) => String(i.id)} renderItem={({ item }) => <OrderCard order={item} showCourier onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} />} contentContainerStyle={s.l} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />} ListEmptyComponent={<Text style={s.e}>Нет заявок. Создайте первую!</Text>} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background }, h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text }, l: { padding: 20 }, e: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 16 } });
