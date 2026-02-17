import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS, SHADOWS, TRANSPORT_LABELS, TRANSPORT_ICONS } from '../../utils/constants';

export default function RegisterCourierScreen() {
  const [f, setF] = useState({
    phone: '', password: '', first_name: '', last_name: '', birth_date: '',
    inn: '', transport_type: 'foot',
    passport_front_url: '/uploads/stub.jpg',
    passport_back_url: '/uploads/stub.jpg',
    selfie_with_passport_url: '/uploads/stub.jpg',
  });
  const [loading, setLoading] = useState(false);
  const registerCourier = useAuthStore((s) => s.registerCourier);
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!f.phone || !f.password || !f.first_name || !f.last_name || !f.birth_date || !f.inn) {
      Alert.alert('Ошибка', 'Заполните все поля'); return;
    }
    if (!/^\d{9}$/.test(f.phone)) { Alert.alert('Ошибка', 'Номер телефона — 9 цифр'); return; }
    setLoading(true);
    try { await registerCourier(f); }
    catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Создайте аккаунт курьера</Text>

        <View style={styles.card}>
          <Text style={styles.section}>Личные данные</Text>
          <Input label="Имя" leftIcon="person-outline" value={f.first_name} onChangeText={(v) => u('first_name', v)} />
          <Input label="Фамилия" leftIcon="person-outline" value={f.last_name} onChangeText={(v) => u('last_name', v)} />
          <Input label="Телефон" leftIcon="call-outline" keyboardType="number-pad" placeholder="955555555" maxLength={9} value={f.phone} onChangeText={(v) => u('phone', v.replace(/[^0-9]/g, '').slice(0, 9))} />
          <Input label="Пароль" leftIcon="lock-closed-outline" secureTextEntry value={f.password} onChangeText={(v) => u('password', v)} />
          <Input label="Дата рождения" leftIcon="calendar-outline" placeholder="1990-01-15" value={f.birth_date} onChangeText={(v) => u('birth_date', v)} />
          <Input label="ИНН" leftIcon="document-text-outline" keyboardType="numeric" value={f.inn} onChangeText={(v) => u('inn', v)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Транспорт</Text>
          <View style={styles.transportGrid}>
            {['foot', 'bicycle', 'moto', 'car'].map((t) => {
              const active = f.transport_type === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.transportItem, active && styles.transportActive]}
                  onPress={() => u('transport_type', t)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={TRANSPORT_ICONS[t]}
                    size={28}
                    color={active ? COLORS.primary : COLORS.textMuted}
                  />
                  <Text style={[styles.transportLabel, active && styles.transportLabelActive]}>
                    {TRANSPORT_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Button title="Зарегистрироваться" onPress={handleRegister} loading={loading} size="large" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginTop: 4, marginBottom: 24 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  section: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  transportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  transportItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  transportActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGhost,
    ...SHADOWS.small,
  },
  transportLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  transportLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
