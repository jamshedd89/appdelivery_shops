import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import { COLORS, SHADOWS } from '../../utils/constants';

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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Icon */}
        <View style={styles.iconSection}>
          <LinearGradient
            colors={isSeller ? COLORS.gradient.primary : ['#7C3AED', '#6D28D9']}
            style={styles.iconCircle}
          >
            <Ionicons name={isSeller ? 'storefront' : 'bicycle'} size={36} color={COLORS.white} />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Добро пожаловать!</Text>
        <Text style={styles.subtitle}>
          Войдите как {isSeller ? 'продавец' : 'курьер'}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Телефон"
            placeholder="985999999"
            keyboardType="number-pad"
            leftIcon="call-outline"
            value={phone}
            onChangeText={(v) => setPhone(v.replace(/[^0-9]/g, '').slice(0, 9))}
            maxLength={9}
          />
          <Input
            label="Пароль"
            placeholder="Введите пароль"
            secureTextEntry
            leftIcon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Войти" onPress={handleLogin} loading={loading} size="large" />
        </View>

        {/* Register link */}
        <View style={styles.regSection}>
          <Text style={styles.regText}>Нет аккаунта?</Text>
          <Button
            title="Зарегистрироваться"
            variant="ghost"
            onPress={() => navigation.navigate(isSeller ? 'RegisterSeller' : 'RegisterCourier', { role })}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  iconSection: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 36,
  },
  form: { gap: 0 },
  regSection: { alignItems: 'center', marginTop: 24 },
  regText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});
