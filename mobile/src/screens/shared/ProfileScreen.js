import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import Input from '../../components/Input';
import useAuthStore from '../../store/authStore';
import { balanceApi } from '../../services/api';
import { COLORS, SHADOWS, TRANSPORT_LABELS, TRANSPORT_ICONS } from '../../utils/constants';

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuthStore();
  const [bal, setBal] = useState(null);
  const [depAmt, setDepAmt] = useState('');
  const [showDep, setShowDep] = useState(false);

  useEffect(() => { loadBal(); refreshProfile(); }, []);

  const loadBal = async () => {
    try { const { data } = await balanceApi.get(); setBal(data.data); } catch {}
  };

  const doDep = async () => {
    if (!depAmt || +depAmt <= 0) { Alert.alert('Ошибка', 'Введите сумму'); return; }
    try {
      await balanceApi.deposit(+depAmt);
      Alert.alert('Успех', 'Пополнено!');
      setDepAmt(''); setShowDep(false); loadBal();
    } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
  };

  const doLogout = () => Alert.alert('Выход', 'Вы уверены?', [
    { text: 'Отмена', style: 'cancel' },
    { text: 'Выйти', onPress: logout, style: 'destructive' },
  ]);

  if (!user) return null;
  const isCourier = user.role === 'courier';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <LinearGradient
        colors={isCourier ? ['#7C3AED', '#6D28D9'] : COLORS.gradient.primary}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.profileHeader}
      >
        <View style={styles.avatarWrap}>
          <Ionicons name={isCourier ? 'bicycle' : 'storefront'} size={32} color={COLORS.white} />
        </View>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{isCourier ? 'Курьер' : 'Продавец'}</Text>
        </View>
        <View style={styles.ratingRow}>
          <StarRating rating={Math.round(user.rating || 5)} size={18} />
          <Text style={styles.ratingNum}>{(user.rating || 5).toFixed(1)}</Text>
        </View>
      </LinearGradient>

      {/* Balance Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Баланс</Text>
        </View>
        {bal && (
          <View style={styles.balanceGrid}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Доступно</Text>
              <Text style={styles.balanceValue}>{bal.available?.toFixed(2)}</Text>
              <Text style={styles.balanceCurrency}>сом</Text>
            </View>
            <View style={[styles.balanceItem, styles.balanceItemBorder]}>
              <Text style={styles.balanceLabel}>Заморожено</Text>
              <Text style={[styles.balanceValue, { color: COLORS.warning }]}>{bal.frozen_balance?.toFixed(2)}</Text>
              <Text style={styles.balanceCurrency}>сом</Text>
            </View>
          </View>
        )}
        <Button
          title={showDep ? 'Скрыть' : 'Пополнить баланс'}
          variant="outline"
          onPress={() => setShowDep(!showDep)}
          icon={<Ionicons name={showDep ? 'chevron-up' : 'add-circle-outline'} size={18} color={COLORS.primary} />}
          size="small"
          style={{ marginTop: 14 }}
        />
        {showDep && (
          <View style={styles.depForm}>
            <Input
              placeholder="Сумма пополнения"
              keyboardType="decimal-pad"
              leftIcon="cash-outline"
              value={depAmt}
              onChangeText={setDepAmt}
            />
            <Button title="Пополнить" onPress={doDep} />
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Информация</Text>
        </View>
        <InfoRow icon="call-outline" text={user.phone} />
        <InfoRow icon="star-outline" text={`Рейтинг: ${(user.rating || 5).toFixed(1)}`} />
        {isCourier && user.courierProfile && (
          <>
            <InfoRow icon={TRANSPORT_ICONS[user.courierProfile.transport_type] || 'car-outline'} text={TRANSPORT_LABELS[user.courierProfile.transport_type]} />
            <InfoRow icon="trending-up-outline" text={`Рейтинг-скор: ${user.courierProfile.rating_score}/100`} />
            <InfoRow icon="alert-circle-outline" text={`Опозданий: ${user.courierProfile.late_count} | Отмен: ${user.courierProfile.cancel_count}`} />
          </>
        )}
        {!isCourier && user.sellerProfile?.addresses?.[0] && (
          <InfoRow icon="location-outline" text={user.sellerProfile.addresses[0].address_text} />
        )}
      </View>

      {/* Logout */}
      <Button
        title="Выйти из аккаунта"
        variant="danger"
        onPress={doLogout}
        icon={<Ionicons name="log-out-outline" size={18} color={COLORS.danger} />}
        style={{ marginTop: 4 }}
      />
    </ScrollView>
  );
}

function InfoRow({ icon, text }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 0, paddingBottom: 40 },

  profileHeader: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 28,
    marginHorizontal: -20,
    marginBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 20,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  ratingNum: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  balanceGrid: { flexDirection: 'row', gap: 12 },
  balanceItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  balanceItemBorder: { borderLeftWidth: 1, borderLeftColor: COLORS.divider },
  balanceLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginBottom: 4 },
  balanceValue: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  balanceCurrency: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500', marginTop: 2 },

  depForm: { marginTop: 14 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
});
