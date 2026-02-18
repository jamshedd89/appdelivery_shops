import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    if (!/^\d{9}$/.test(phone)) { Alert.alert('Ошибка', 'Номер телефона — 9 цифр'); return; }
    setLoading(true);
    try {
      await login(phone, password);
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось войти');
    } finally {
      setLoading(false);
    }
  };

  const isSeller = role === 'seller';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Gradient accent */}
        <View style={styles.gradientAccent} />

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        {/* Header */}
        <Text style={styles.headerLabel}>Вход</Text>

        <View style={styles.content}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>
            Войдите по номеру телефона, чтобы управлять доставками.
          </Text>

          {/* Phone input with country code */}
          <View style={styles.phoneRow}>
            <View style={styles.countryBox}>
              <Text style={styles.countryFlag}>🇹🇯</Text>
              <Text style={styles.countryCode}>+992</Text>
            </View>
            <View style={styles.phoneInputWrap}>
              <Input
                placeholder="00 000 0000"
                keyboardType="number-pad"
                value={phone}
                onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 9))}
                maxLength={9}
                style={styles.phoneInput}
              />
            </View>
          </View>

          <Input
            label="Пароль"
            placeholder="Введите пароль"
            secureTextEntry
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
          />

          <Button title="Войти" onPress={handleLogin} loading={loading} size="large" />

          {/* Terms */}
          <Text style={styles.terms}>
            Продолжая, вы соглашаетесь с{' '}
            <Text style={styles.termsLink}>Условиями использования</Text> и{' '}
            <Text style={styles.termsLink}>Политикой конфиденциальности</Text>
          </Text>
        </View>

        {/* Register link */}
        <View style={styles.regSection}>
          <Text style={styles.regText}>
            Нет аккаунта?{' '}
            <Text
              style={styles.regLink}
              onPress={() => navigation.navigate(isSeller ? 'RegisterSeller' : 'RegisterCourier', { role })}
            >
              Зарегистрироваться
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  gradientAccent: {
    height: 120,
    backgroundColor: COLORS.primaryGhost,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: -60,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1,
  },
  headerLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: -30,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  countryFlag: { fontSize: 18 },
  countryCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  phoneInputWrap: { flex: 1 },
  phoneInput: { marginBottom: 0 },
  terms: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  termsLink: {
    color: COLORS.text,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  regSection: { alignItems: 'center', marginTop: 32, paddingBottom: 20 },
  regText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  regLink: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
