import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';
import { ordersApi, reviewsApi } from '../../services/api';
import { COLORS, ORDER_STATUS_LABELS, ORDER_STATUS, TRANSPORT_LABELS } from '../../utils/constants';

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { updateOrderStatus, confirmDelivery, cancelBySeller } = useOrderStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(0);
  const load = async () => { try { const { data } = await ordersApi.getById(orderId); setOrder(data.data); } catch { Alert.alert('Ошибка', 'Не удалось загрузить'); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [orderId]);
  const doStatus = async (s) => { try { setOrder(await updateOrderStatus(orderId, s)); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } };
  const doConfirm = async () => { try { setOrder(await confirmDelivery(orderId)); Alert.alert('Успех', 'Подтверждено!'); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } };
  const doCancel = () => Alert.alert('Отмена', 'Подтвердите', [{ text: 'Нет', style: 'cancel' }, { text: 'Да', onPress: async () => { try { await cancelBySeller(orderId, 'Отменено'); load(); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } } }]);
  const doReview = async () => { if (!stars) { Alert.alert('Ошибка', 'Выберите оценку'); return; } try { await reviewsApi.create(orderId, { stars }); Alert.alert('Спасибо', 'Отзыв отправлен!'); setStars(0); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } };
  if (loading || !order) return <View style={st.ctr}><Text>Загрузка...</Text></View>;
  const isSeller = user?.role === 'seller', isCourier = user?.role === 'courier';
  const sc = order.status === 'completed' || order.status === 'confirmed' ? COLORS.success : order.status.startsWith('cancelled') || order.status === 'expired' ? COLORS.danger : COLORS.warning;
  return (
    <ScrollView style={st.c} contentContainerStyle={st.cc}>
      <View style={st.sc}><Text style={[st.sl, { color: sc }]}>{ORDER_STATUS_LABELS[order.status]}</Text><Text style={st.oid}>Заказ #{order.id}</Text></View>
      <View style={st.card}><Text style={st.sec}>Детали</Text><IR icon="cash-outline" text={`Доставка: ${order.delivery_cost} сом`} /><IR icon="pricetag-outline" text={`Комиссия: ${order.commission} сом`} />{order.sellerAddress && <IR icon="location-outline" text={order.sellerAddress.address_text} />}</View>
      <View style={st.card}><Text style={st.sec}>Товары ({order.items?.length})</Text>{order.items?.map((it, i) => <View key={it.id} style={st.ir}><Text style={st.in}>{i + 1}.</Text><View style={{ flex: 1 }}><Text style={st.id}>{it.description}</Text><Text style={st.ia}>{it.delivery_address}</Text></View></View>)}</View>
      {order.courier && <View style={st.card}><Text style={st.sec}>Курьер</Text><IR icon="person-outline" text={`${order.courier.first_name} ${order.courier.last_name}`} />{order.courier.courierProfile && <IR icon="car-outline" text={TRANSPORT_LABELS[order.courier.courierProfile.transport_type]} />}<IR icon="star-outline" text={`Рейтинг: ${order.courier.rating?.toFixed(1)}`} /></View>}
      {isCourier && order.status === ORDER_STATUS.ACCEPTED && <Button title="В пути к магазину" onPress={() => doStatus(ORDER_STATUS.ON_WAY_SHOP)} style={st.ab} />}
      {isCourier && order.status === ORDER_STATUS.ON_WAY_SHOP && <Button title="Я на месте" onPress={() => doStatus(ORDER_STATUS.AT_SHOP)} style={st.ab} />}
      {isCourier && order.status === ORDER_STATUS.AT_SHOP && <Button title="Еду к клиенту" onPress={() => doStatus(ORDER_STATUS.ON_WAY_CLIENT)} style={st.ab} />}
      {isCourier && order.status === ORDER_STATUS.ON_WAY_CLIENT && <Button title="Доставлено" onPress={() => doStatus(ORDER_STATUS.DELIVERED)} style={st.ab} />}
      {isSeller && order.status === ORDER_STATUS.DELIVERED && <Button title="Подтвердить доставку" onPress={doConfirm} style={st.ab} />}
      {isSeller && !['completed', 'confirmed', 'cancelled_seller', 'cancelled_courier', 'expired'].includes(order.status) && <Button title="Отменить" variant="danger" onPress={doCancel} style={st.ab} />}
      {(order.status === 'confirmed' || order.status === 'completed') && <View style={st.card}><Text style={st.sec}>Оставить отзыв</Text><StarRating rating={stars} interactive size={32} onRate={setStars} /><Button title="Отправить" onPress={doReview} style={{ marginTop: 12 }} disabled={!stars} /></View>}
    </ScrollView>
  );
}
function IR({ icon, text }) { return <View style={st.infoRow}><Ionicons name={icon} size={18} color={COLORS.textSecondary} /><Text style={st.infoText}>{text}</Text></View>; }
const st = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background }, cc: { padding: 20, paddingBottom: 40 }, ctr: { flex: 1, justifyContent: 'center', alignItems: 'center' }, sc: { backgroundColor: COLORS.card, borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' }, sl: { fontSize: 18, fontWeight: '700' }, oid: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }, card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 }, sec: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }, infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, infoText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 }, ir: { flexDirection: 'row', marginBottom: 10, gap: 8 }, in: { fontSize: 14, fontWeight: '600', color: COLORS.primary }, id: { fontSize: 14, fontWeight: '500', color: COLORS.text }, ia: { fontSize: 13, color: COLORS.textSecondary }, ab: { marginBottom: 12 } });
