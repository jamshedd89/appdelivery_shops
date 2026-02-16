import React, { useState } from 'react';
import { Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function RegisterSellerScreen({ navigation }) {
  const [f, setF] = useState({ phone: '', password: '', first_name: '', last_name: '', birth_date: '', address_text: '', latitude: '38.5598', longitude: '68.7740' });
  const [loading, setLoading] = useState(false);
  const registerSeller = useAuthStore((s) => s.registerSeller);
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const handleRegister = async () => {
    if (!f.phone || !f.password || !f.first_name || !f.last_name || !f.birth_date || !f.address_text) { Alert.alert('Ошибка', 'Заполните все поля'); return; }
    setLoading(true);
    try { await registerSeller({ ...f, addresses: [{ address_text: f.address_text, latitude: +f.latitude, longitude: +f.longitude }] }); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={s.f} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.c}>
        <Text style={s.t}>Регистрация продавца</Text>
        <Input label="Имя" value={f.first_name} onChangeText={(v) => u('first_name', v)} />
        <Input label="Фамилия" value={f.last_name} onChangeText={(v) => u('last_name', v)} />
        <Input label="Телефон" keyboardType="phone-pad" value={f.phone} onChangeText={(v) => u('phone', v)} />
        <Input label="Пароль" secureTextEntry value={f.password} onChangeText={(v) => u('password', v)} />
        <Input label="Дата рождения" placeholder="1990-01-15" value={f.birth_date} onChangeText={(v) => u('birth_date', v)} />
        <Input label="Адрес магазина" value={f.address_text} onChangeText={(v) => u('address_text', v)} />
        <Input label="Широта" keyboardType="decimal-pad" value={f.latitude} onChangeText={(v) => u('latitude', v)} />
        <Input label="Долгота" keyboardType="decimal-pad" value={f.longitude} onChangeText={(v) => u('longitude', v)} />
        <Button title="Зарегистрироваться" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({ f: { flex: 1, backgroundColor: COLORS.background }, c: { padding: 24, paddingBottom: 40 }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 24 } });
