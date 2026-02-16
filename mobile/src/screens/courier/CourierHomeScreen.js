import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import * as Location from 'expo-location';
import OrderCard from '../../components/OrderCard';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import { connectOrdersSocket } from '../../services/socket';
import { COLORS } from '../../utils/constants';

export default function CourierHomeScreen({ navigation }) {
  const { availableOrders, isLoading, fetchAvailableOrders, acceptOrder } = useOrderStore();
  const [online, setOnline] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Ошибка', 'Нужен доступ к геолокации'); return; }
      const sock = await connectOrdersSocket();
      if (!sock) return;
      const send = async () => { try { const l = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }); sock.emit('courier:location', { latitude: l.coords.latitude, longitude: l.coords.longitude }); } catch {} };
      send(); const iv = setInterval(send, 20000); setOnline(true);
      return () => clearInterval(iv);
    })();
    fetchAvailableOrders();
  }, []);
  useEffect(() => navigation.addListener('focus', fetchAvailableOrders), [navigation]);
  const handleAccept = async (id) => { try { await acceptOrder(id); Alert.alert('Успех', 'Заявка принята!'); navigation.navigate('CourierOrders'); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } };
  return (
    <View style={s.c}>
      <View style={s.h}><Text style={s.t}>Доступные заявки</Text><View style={[s.dot, { backgroundColor: online ? COLORS.success : COLORS.danger }]} /></View>
      <FlatList data={availableOrders} keyExtractor={(i) => String(i.id)} renderItem={({ item }) => <View><OrderCard order={item} onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} /><Button title="Принять" onPress={() => handleAccept(item.id)} style={{ marginBottom: 16, marginHorizontal: 4 }} /></View>} contentContainerStyle={s.l} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAvailableOrders} />} ListEmptyComponent={<Text style={s.e}>Нет заявок поблизости</Text>} />
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background }, h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text }, dot: { width: 12, height: 12, borderRadius: 6 }, l: { padding: 20 }, e: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 16 } });
