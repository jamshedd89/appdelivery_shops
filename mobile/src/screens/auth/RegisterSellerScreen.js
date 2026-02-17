import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS, SHADOWS } from '../../utils/constants';

export default function RegisterSellerScreen({ navigation }) {
  const [f, setF] = useState({
    phone: '', password: '', first_name: '', last_name: '',
    birth_date: '', address_text: '', latitude: 38.5598, longitude: 68.7740,
  });
  const [loading, setLoading] = useState(false);
  const registerSeller = useAuthStore((s) => s.registerSeller);
  const u = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const openMapPicker = () => {
    navigation.navigate('AddressPicker', {
      title: 'Адрес магазина',
      initialCoords: { latitude: f.latitude, longitude: f.longitude },
      onSelect: (result) => {
        setF((p) => ({
          ...p,
          address_text: result.address_text,
          latitude: result.latitude,
          longitude: result.longitude,
        }));
      },
    });
  };

  const handleRegister = async () => {
    if (!f.phone || !f.password || !f.first_name || !f.last_name || !f.birth_date || !f.address_text) {
      Alert.alert('Ошибка', 'Заполните все поля'); return;
    }
    setLoading(true);
    try {
      await registerSeller({
        ...f,
        addresses: [{ address_text: f.address_text, latitude: +f.latitude, longitude: +f.longitude }],
      });
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Регистрация</Text>
        <Text style={styles.subtitle}>Создайте аккаунт продавца</Text>

        <View style={styles.card}>
          <Text style={styles.section}>Личные данные</Text>
          <Input label="Имя" leftIcon="person-outline" value={f.first_name} onChangeText={(v) => u('first_name', v)} />
          <Input label="Фамилия" leftIcon="person-outline" value={f.last_name} onChangeText={(v) => u('last_name', v)} />
          <Input label="Телефон" leftIcon="call-outline" keyboardType="phone-pad" value={f.phone} onChangeText={(v) => u('phone', v)} />
          <Input label="Пароль" leftIcon="lock-closed-outline" secureTextEntry value={f.password} onChangeText={(v) => u('password', v)} />
          <Input label="Дата рождения" leftIcon="calendar-outline" placeholder="1990-01-15" value={f.birth_date} onChangeText={(v) => u('birth_date', v)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Адрес магазина</Text>

          <TouchableOpacity style={styles.mapPickerBtn} onPress={openMapPicker} activeOpacity={0.7}>
            <Ionicons name="map-outline" size={22} color={f.address_text ? COLORS.primary : COLORS.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.mapPickerTitle, f.address_text && { color: COLORS.text }]}>
                {f.address_text || 'Выбрать на карте'}
              </Text>
              {f.address_text ? (
                <Text style={styles.mapPickerCoords}>
                  {f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}
                </Text>
              ) : (
                <Text style={styles.mapPickerHint}>Нажмите, чтобы указать адрес</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
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
  mapPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...SHADOWS.small,
  },
  mapPickerTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  mapPickerCoords: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  mapPickerHint: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
