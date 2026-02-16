import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import Input from '../../components/Input';
import useAuthStore from '../../store/authStore';
import { balanceApi } from '../../services/api';
import { COLORS, TRANSPORT_LABELS } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuthStore();
  const [bal, setBal] = useState(null);
  const [depAmt, setDepAmt] = useState('');
  const [showDep, setShowDep] = useState(false);
  useEffect(() => { loadBal(); refreshProfile(); }, []);
  const loadBal = async () => { try { const { data } = await balanceApi.get(); setBal(data.data); } catch {} };
  const doDep = async () => { if (!depAmt || +depAmt <= 0) { Alert.alert('Ошибка', 'Введите сумму'); return; } try { await balanceApi.deposit(+depAmt); Alert.alert('Успех', 'Пополнено!'); setDepAmt(''); setShowDep(false); loadBal(); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } };
  const doLogout = () => Alert.alert('Выход', 'Уверены?', [{ text: 'Отмена', style: 'cancel' }, { text: 'Выйти', onPress: logout, style: 'destructive' }]);
  if (!user) return null;
  const isCourier = user.role === 'courier';
  return (
    <ScrollView style={s.c} contentContainerStyle={s.cc}>
      <View style={s.av}><View style={s.avi}><Ionicons name={isCourier ? 'bicycle' : 'storefront'} size={40} color={COLORS.white} /></View><Text style={s.name}>{user.first_name} {user.last_name}</Text><Text style={s.role}>{isCourier ? 'Курьер' : 'Продавец'}</Text><StarRating rating={Math.round(user.rating || 5)} size={20} /></View>
      <View style={s.card}><Text style={s.sec}>Баланс</Text>{bal && <><View style={s.br}><Text style={s.bl}>Доступно</Text><Text style={s.bv}>{bal.available?.toFixed(2)} сом</Text></View><View style={s.br}><Text style={s.bl}>Заморожено</Text><Text style={[s.bv, { color: COLORS.warning }]}>{bal.frozen_balance?.toFixed(2)} сом</Text></View></>}<Button title={showDep ? 'Скрыть' : 'Пополнить'} variant="outline" onPress={() => setShowDep(!showDep)} style={{ marginTop: 12 }} />{showDep && <View style={{ marginTop: 12 }}><Input placeholder="Сумма" keyboardType="decimal-pad" value={depAmt} onChangeText={setDepAmt} /><Button title="Пополнить" onPress={doDep} /></View>}</View>
      <View style={s.card}><Text style={s.sec}>Информация</Text><IR icon="call-outline" text={user.phone} /><IR icon="star-outline" text={`Рейтинг: ${(user.rating || 5).toFixed(1)}`} />{isCourier && user.courierProfile && <><IR icon="car-outline" text={TRANSPORT_LABELS[user.courierProfile.transport_type]} /><IR icon="trending-up-outline" text={`Скор: ${user.courierProfile.rating_score}/100`} /></>}{!isCourier && user.sellerProfile?.addresses?.[0] && <IR icon="location-outline" text={user.sellerProfile.addresses[0].address_text} />}</View>
      <Button title="Выйти" variant="danger" onPress={doLogout} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}
function IR({ icon, text }) { return <View style={s.ir}><Ionicons name={icon} size={18} color={COLORS.textSecondary} /><Text style={s.it}>{text}</Text></View>; }
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background }, cc: { padding: 20, paddingBottom: 40 }, av: { alignItems: 'center', marginBottom: 24 }, avi: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }, name: { fontSize: 22, fontWeight: '700', color: COLORS.text }, role: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 }, card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16 }, sec: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 12 }, br: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, bl: { fontSize: 14, color: COLORS.textSecondary }, bv: { fontSize: 16, fontWeight: '600', color: COLORS.text }, ir: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }, it: { fontSize: 14, color: COLORS.textSecondary } });
