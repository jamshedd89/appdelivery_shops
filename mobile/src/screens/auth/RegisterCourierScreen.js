import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS, TRANSPORT_LABELS, TRANSPORT_ICONS } from '../../utils/constants';

export default function RegisterCourierScreen({ navigation }) {
  const [f, setF] = useState({
    phone: '', password: '', first_name: '', last_name: '', birth_date: '',
    inn: '', transport_type: 'foot',
    passport_front_url: '/uploads/stub.jpg',
    passport_back_url: '/uploads/stub.jpg',
    selfie_with_passport_url: '/uploads/stub.jpg',
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
          <Text style={styles.title}>Регистрация курьера</Text>
          <Text style={styles.subtitle}>Зарабатывайте на своих условиях с гибким графиком.</Text>

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
          <Input label="ИНН" placeholder="Ваш ИНН" keyboardType="numeric" leftIcon="document-text-outline" value={f.inn} onChangeText={(v) => u('inn', v)} />

          {/* Transport selection */}
          <Text style={styles.inputLabel}>Транспорт</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { paddingHorizontal: 24, paddingTop: 20 },
  title: {
    fontSize: 32, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: 28,
  },
  inputLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  countryBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.white,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  phoneInputWrap: { flex: 1 },
  transportGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20,
  },
  transportItem: {
    flex: 1, minWidth: '45%', alignItems: 'center', padding: 16,
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background, gap: 8,
  },
  transportActive: {
    borderColor: COLORS.primary, backgroundColor: COLORS.primaryGhost,
  },
  transportLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  transportLabelActive: { color: COLORS.primary, fontWeight: '700' },
  termsRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginBottom: 24, marginTop: 8,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    borderColor: COLORS.border, marginTop: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
  loginRow: { alignItems: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { color: COLORS.primary, fontWeight: '700' },
});
