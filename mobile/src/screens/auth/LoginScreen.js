import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function LoginScreen({ navigation, route }) {
  const { role } = route.params;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const handleLogin = async () => {
    if (!phone || !password) { Alert.alert('Ошибка', 'Заполните все поля'); return; }
    setLoading(true);
    try { await login(phone, password); } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось войти'); } finally { setLoading(false); }
  };
  return (
    <KeyboardAvoidingView style={s.f} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.c}>
        <Text style={s.t}>Вход</Text>
        <Text style={s.st}>Войдите как {role === 'seller' ? 'продавец' : 'курьер'}</Text>
        <Input label="Телефон" placeholder="+992 900 000 000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Input label="Пароль" placeholder="Введите пароль" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Войти" onPress={handleLogin} loading={loading} />
        <Button title="Зарегистрироваться" variant="outline" onPress={() => navigation.navigate(role === 'seller' ? 'RegisterSeller' : 'RegisterCourier', { role })} style={{ marginTop: 12 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({ f: { flex: 1, backgroundColor: COLORS.background }, c: { flexGrow: 1, justifyContent: 'center', padding: 24 }, t: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: 4 }, st: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 32 } });
