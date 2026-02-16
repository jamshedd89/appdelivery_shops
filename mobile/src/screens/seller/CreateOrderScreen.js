import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function CreateOrderScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const createOrder = useOrderStore((s) => s.createOrder);
  const [cost, setCost] = useState('');
  const [items, setItems] = useState([{ description: '', delivery_address: '', latitude: '38.56', longitude: '68.77' }]);
  const [loading, setLoading] = useState(false);
  const addrId = user?.sellerProfile?.addresses?.[0]?.id;
  const upd = (i, k, v) => { const n = [...items]; n[i] = { ...n[i], [k]: v }; setItems(n); };
  const handleCreate = async () => {
    if (!cost || +cost < 10) { Alert.alert('Ошибка', 'Мин. 10 сомони'); return; }
    if (items.some((i) => !i.description || !i.delivery_address)) { Alert.alert('Ошибка', 'Заполните товары'); return; }
    if (!addrId) { Alert.alert('Ошибка', 'Нет адреса магазина'); return; }
    setLoading(true);
    try { await createOrder({ seller_address_id: addrId, delivery_cost: +cost, items: items.map((i) => ({ ...i, latitude: +i.latitude, longitude: +i.longitude })) }); Alert.alert('Успех', 'Заявка создана!'); navigation.goBack(); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={s.f} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.c}>
        <Text style={s.t}>Новая заявка</Text>
        <Input label="Стоимость доставки (сомони)" placeholder="Минимум 10" keyboardType="decimal-pad" value={cost} onChangeText={setCost} />
        {items.map((item, i) => (
          <View key={i} style={s.ic}>
            <View style={s.ih}><Text style={s.it}>Товар {i + 1}</Text>{items.length > 1 && <Button title="X" variant="danger" onPress={() => setItems(items.filter((_, j) => j !== i))} style={{ paddingVertical: 4, paddingHorizontal: 10 }} />}</View>
            <Input label="Описание" value={item.description} onChangeText={(v) => upd(i, 'description', v)} />
            <Input label="Адрес доставки" value={item.delivery_address} onChangeText={(v) => upd(i, 'delivery_address', v)} />
          </View>
        ))}
        {items.length < 10 && <Button title="+ Товар" variant="outline" onPress={() => setItems([...items, { description: '', delivery_address: '', latitude: '38.56', longitude: '68.77' }])} style={{ marginBottom: 16 }} />}
        <Button title="Создать заявку" onPress={handleCreate} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({ f: { flex: 1, backgroundColor: COLORS.background }, c: { padding: 20, paddingBottom: 40 }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 20 }, ic: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border }, ih: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }, it: { fontSize: 16, fontWeight: '600', color: COLORS.text } });
