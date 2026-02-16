import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS, TRANSPORT_LABELS } from '../../utils/constants';

export default function RegisterCourierScreen() {
  const [f, setF] = useState({ phone: '', password: '', first_name: '', last_name: '', birth_date: '', inn: '', transport_type: 'foot', passport_front_url: '/uploads/stub.jpg', passport_back_url: '/uploads/stub.jpg', selfie_with_passport_url: '/uploads/stub.jpg' });
  const [loading, setLoading] = useState(false);
  const registerCourier = useAuthStore((s) => s.registerCourier);
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const handleRegister = async () => {
    if (!f.phone || !f.password || !f.first_name || !f.last_name || !f.birth_date || !f.inn) { Alert.alert('Ошибка', 'Заполните все поля'); return; }
    setLoading(true);
    try { await registerCourier(f); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={s.f} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.c}>
        <Text style={s.t}>Регистрация курьера</Text>
        <Input label="Имя" value={f.first_name} onChangeText={(v) => u('first_name', v)} />
        <Input label="Фамилия" value={f.last_name} onChangeText={(v) => u('last_name', v)} />
        <Input label="Телефон" keyboardType="phone-pad" value={f.phone} onChangeText={(v) => u('phone', v)} />
        <Input label="Пароль" secureTextEntry value={f.password} onChangeText={(v) => u('password', v)} />
        <Input label="Дата рождения" placeholder="1990-01-15" value={f.birth_date} onChangeText={(v) => u('birth_date', v)} />
        <Input label="ИНН" keyboardType="numeric" value={f.inn} onChangeText={(v) => u('inn', v)} />
        <Text style={s.lbl}>Транспорт</Text>
        <View style={s.tr}>{['foot','bicycle','moto','car'].map((t) => (
          <TouchableOpacity key={t} style={[s.tb, f.transport_type === t && s.ta]} onPress={() => u('transport_type', t)}>
            <Text style={[s.tt, f.transport_type === t && s.tta]}>{TRANSPORT_LABELS[t]}</Text>
          </TouchableOpacity>
        ))}</View>
        <Button title="Зарегистрироваться" onPress={handleRegister} loading={loading} style={{ marginTop: 16 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({ f: { flex: 1, backgroundColor: COLORS.background }, c: { padding: 24, paddingBottom: 40 }, t: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 24 }, lbl: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 8 }, tr: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, tb: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white }, ta: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '15' }, tt: { fontSize: 14, color: COLORS.textSecondary }, tta: { color: COLORS.primary, fontWeight: '600' } });
