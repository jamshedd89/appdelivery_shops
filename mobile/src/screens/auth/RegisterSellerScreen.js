import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform, TouchableOpacity } from 'react-native';
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
  const [agreed, setAgreed] = useState(false);
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
    if (!/^\d{9}$/.test(f.phone)) { Alert.alert('Ошибка', 'Номер телефона — 9 цифр'); return; }
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
    <ScrollView style={styles.flex} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="none">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Создать аккаунт</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Регистрация продавца</Text>
          <Text style={styles.subtitle}>Зарегистрируйтесь, чтобы начать использовать быструю доставку.</Text>

          <Input label="Имя" placeholder="напр. Иван" value={f.first_name} onChangeText={(v) => u('first_name', v)} />
          <Input label="Фамилия" placeholder="напр. Иванов" value={f.last_name} onChangeText={(v) => u('last_name', v)} />

          {/* Phone with country code */}
          <Text style={styles.inputLabel}>Номер телефона</Text>
          <View style={styles.phoneRow}>
            <View style={styles.countryBox}>
              <Text style={styles.countryFlag}>🇹🇯</Text>
              <Text style={styles.countryCode}>+992</Text>
            </View>
            <View style={styles.phoneInputWrap}>
              <Input
                placeholder="00 000 0000"
                keyboardType="number-pad"
                value={f.phone}
                onChangeText={(v) => u('phone', v.replace(/[^0-9]/g, '').slice(0, 9))}
                maxLength={9}
                style={{ marginBottom: 0 }}
              />
            </View>
          </View>

          <Input label="Пароль" placeholder="Минимум 6 символов" secureTextEntry value={f.password} onChangeText={(v) => u('password', v)} />
          <Input label="Дата рождения" placeholder="1990-01-15" leftIcon="calendar-outline" value={f.birth_date} onChangeText={(v) => u('birth_date', v)} />

          {/* Address picker */}
          <Text style={styles.inputLabel}>Адрес магазина</Text>
          <TouchableOpacity style={styles.mapPickerBtn} onPress={openMapPicker} activeOpacity={0.7}>
            <View style={styles.mapIconWrap}>
              <Ionicons name="location" size={20} color={f.address_text ? COLORS.primary : COLORS.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.mapPickerTitle, f.address_text && { color: COLORS.text }]}>
                {f.address_text || 'Выбрать на карте'}
              </Text>
              {f.address_text ? (
                <Text style={styles.mapPickerCoords}>{f.latitude.toFixed(4)}, {f.longitude.toFixed(4)}</Text>
              ) : (
                <Text style={styles.mapPickerHint}>Нажмите, чтобы указать адрес</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Terms */}
          <TouchableOpacity style={styles.termsRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.termsText}>
              Я согласен с <Text style={styles.termsLink}>Условиями обслуживания</Text> и <Text style={styles.termsLink}>Политикой конфиденциальности</Text>
            </Text>
          </TouchableOpacity>

          <Button title="Зарегистрироваться" onPress={handleRegister} loading={loading} size="large" disabled={!agreed} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>
              Уже есть аккаунт? <Text style={styles.loginLink} onPress={() => navigation.goBack()}>Войти</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  scroll: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: COLORS.text,
  },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  title: {
    fontSize: 32, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, color: COLORS.textSecondary,
    lineHeight: 22, marginBottom: 28,
  },
  inputLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  phoneRow: {
    flexDirection: 'row', gap: 10, marginBottom: 16,
  },
  countryBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  phoneInputWrap: { flex: 1 },
  mapPickerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.background, borderWidth: 1.5,
    borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16,
  },
  mapIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  mapPickerTitle: {
    fontSize: 15, fontWeight: '500', color: COLORS.textMuted, marginBottom: 2,
  },
  mapPickerCoords: { fontSize: 12, color: COLORS.textMuted },
  mapPickerHint: { fontSize: 12, color: COLORS.textMuted },
  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginBottom: 24, marginTop: 8,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: COLORS.border, marginTop: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  termsText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  loginRow: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});
