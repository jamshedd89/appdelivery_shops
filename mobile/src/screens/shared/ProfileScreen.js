import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Input from '../../components/Input';
import useAuthStore from '../../store/authStore';
import { balanceApi } from '../../services/api';
import { COLORS, TRANSPORT_LABELS, TRANSPORT_ICONS } from '../../utils/constants';

export default function ProfileScreen({ navigation }) {
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
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Ionicons name="settings-outline" size={22} color={COLORS.text} />
        <Text style={styles.headerTitle}>Профиль</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user.first_name || 'U')[0]}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.userName}>{user.first_name} {user.last_name}</Text>
        <View style={styles.roleLine}>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{isCourier ? 'Courier' : 'Seller'}</Text>
          </View>
          <View style={styles.ratingPill}>
            <Ionicons name="star" size={14} color={COLORS.primary} />
            <Text style={styles.ratingText}>{(user.rating || 5).toFixed(1)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Редактировать профиль</Text>
        </TouchableOpacity>
      </View>

      {/* Finance section */}
      <Text style={styles.sectionLabel}>Финансы и заказы</Text>

      {/* Earnings item */}
      <TouchableOpacity style={styles.menuItem} onPress={() => setShowDep(!showDep)}>
        <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryGhost }]}>
          <Ionicons name="card-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Заработок</Text>
          <Text style={styles.menuItemSub}>Доступно к выводу</Text>
        </View>
        <Text style={styles.menuItemValue}>{bal ? `${bal.available?.toFixed(2)} сом` : '...'}</Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {showDep && (
        <View style={styles.depForm}>
          <Input placeholder="Сумма пополнения" keyboardType="decimal-pad" leftIcon="cash-outline" value={depAmt} onChangeText={setDepAmt} />
          <Button title="Пополнить" onPress={doDep} />
        </View>
      )}

      {/* Info */}
      <TouchableOpacity style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryGhost }]}>
          <Ionicons name="time-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>История заказов</Text>
          <Text style={styles.menuItemSub}>{isCourier ? 'Выполненные доставки' : 'Все заказы'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Settings section */}
      <Text style={styles.sectionLabel}>Общие настройки</Text>

      <TouchableOpacity style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryGhost }]}>
          <Ionicons name="language-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Выбор языка</Text>
          <View style={styles.langRow}>
            <View style={styles.langChip}><Text style={styles.langText}>RU</Text></View>
            <View style={[styles.langChip, styles.langChipActive]}><Text style={[styles.langText, styles.langTextActive]}>TJ</Text></View>
          </View>
        </View>
        <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: COLORS.primaryGhost }]}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Поддержка</Text>
          <Text style={styles.menuItemSub}>Центр помощи</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Legal section */}
      <Text style={styles.sectionLabel}>Юридическая информация</Text>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Legal', { type: 'terms' })}>
        <View style={[styles.menuIcon, { backgroundColor: '#EDE9FE' }]}>
          <Ionicons name="document-text-outline" size={22} color="#8B5CF6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Пользовательское соглашение</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Legal', { type: 'privacy' })}>
        <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Политика конфиденциальности</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Legal', { type: 'dataProcessing' })}>
        <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="lock-closed-outline" size={22} color={COLORS.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemTitle}>Согласие на обработку данных</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* Courier extra info */}
      {isCourier && user.courierProfile && (
        <View style={styles.courierInfoCard}>
          <InfoRow icon={TRANSPORT_ICONS[user.courierProfile.transport_type] || 'car-outline'} label="Транспорт" value={TRANSPORT_LABELS[user.courierProfile.transport_type]} />
          <InfoRow icon="trending-up-outline" label="Рейтинг-скор" value={`${user.courierProfile.rating_score}/100`} />
          <InfoRow icon="alert-circle-outline" label="Опозданий / Отмен" value={`${user.courierProfile.late_count} / ${user.courierProfile.cancel_count}`} />
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={doLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.courierInfoRow}>
      <View style={styles.courierInfoIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={styles.courierInfoLabel}>{label}</Text>
      <Text style={styles.courierInfoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 40 },

  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 8,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.primaryGhost,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center', alignItems: 'center',
  },

  profileCard: {
    alignItems: 'center', backgroundColor: COLORS.white,
    paddingVertical: 28, paddingHorizontal: 20,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    marginBottom: 16,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primaryGhost, borderWidth: 3,
    borderColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: COLORS.primary },
  verifiedBadge: {
    position: 'absolute', bottom: 2, right: 2,
    backgroundColor: COLORS.white, borderRadius: 12,
    padding: 2,
  },
  userName: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  roleLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  rolePill: {
    backgroundColor: COLORS.primaryGhost, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 9999,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  editBtn: {
    marginTop: 16, backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 9999,
  },
  editBtnText: { fontWeight: '700', fontSize: 14, color: COLORS.dark },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8,
  },

  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.white, marginHorizontal: 16,
    marginBottom: 4, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.primaryGhost,
  },
  menuIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  menuItemTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  menuItemSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  menuItemValue: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginRight: 4 },

  depForm: { marginHorizontal: 16, marginBottom: 8, marginTop: 4 },

  langRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  langChip: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999,
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.primaryGhost,
  },
  langChipActive: { backgroundColor: COLORS.primaryGhost, borderColor: COLORS.primary + '40' },
  langText: { fontSize: 10, fontWeight: '700', color: COLORS.text },
  langTextActive: { color: COLORS.primary },

  courierInfoCard: {
    backgroundColor: COLORS.white, marginHorizontal: 16,
    marginTop: 8, marginBottom: 8, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.primaryGhost,
  },
  courierInfoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8,
  },
  courierInfoIcon: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center', alignItems: 'center',
  },
  courierInfoLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  courierInfoValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16,
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.danger },
});
