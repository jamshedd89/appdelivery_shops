import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS } from '../../utils/constants';

export default function LoginScreen({ navigation, route }) {
  const { role } = route.params;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hidePass, setHidePass] = useState(true);
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
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="none"
    >
      {/* Header area */}
      <View style={styles.headerArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerLabel}>Вход</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Войдите по номеру телефона, чтобы управлять доставками.
        </Text>

        {/* Phone */}
        <Text style={styles.inputLabel}>НОМЕР ТЕЛЕФОНА</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryBox}>
            <Text style={styles.countryFlag}>🇹🇯</Text>
            <Text style={styles.countryCode}>+992</Text>
          </View>
          <View style={styles.phoneInputBox}>
            <TextInput
              style={styles.phoneTextInput}
              placeholder="00 000 0000"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 9))}
              maxLength={9}
              underlineColorAndroid="transparent"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password */}
        <Text style={styles.inputLabel}>ПАРОЛЬ</Text>
        <View style={styles.passwordBox}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={{ marginRight: 12 }} />
          <TextInput
            style={styles.passwordTextInput}
            placeholder="Введите пароль"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={hidePass}
            value={password}
            onChangeText={setPassword}
            underlineColorAndroid="transparent"
            autoCorrect={false}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setHidePass(!hidePass)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={hidePass ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
        <Button title="Войти" onPress={handleLogin} loading={loading} size="large" />

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
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  headerArea: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 48 : 56, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center',
  },
  headerLabel: {
    fontSize: 18, fontWeight: '700', color: COLORS.text,
  },

  content: { paddingHorizontal: 24, paddingTop: 24 },
  title: {
    fontSize: 32, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5, marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 32,
  },

  inputLabel: {
    fontSize: 12, fontWeight: '700', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5,
  },

  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  countryBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.white,
  },
  countryFlag: { fontSize: 18 },
  countryCode: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  phoneInputBox: {
    flex: 1, height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  phoneTextInput: {
    fontSize: 16, color: COLORS.text, fontWeight: '500',
    paddingVertical: 0, height: 52,
  },

  passwordBox: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
    paddingHorizontal: 16, marginBottom: 4,
  },
  passwordTextInput: {
    flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500',
    paddingVertical: 0, height: 52,
  },

  terms: {
    fontSize: 12, color: COLORS.textMuted, textAlign: 'center',
    marginTop: 20, lineHeight: 18, paddingHorizontal: 10,
  },
  termsLink: {
    color: COLORS.text, fontWeight: '600', textDecorationLine: 'underline',
  },

  regSection: { alignItems: 'center', marginTop: 32, paddingBottom: 20 },
  regText: { fontSize: 14, color: COLORS.textSecondary },
  regLink: { color: COLORS.primary, fontWeight: '700' },
});
