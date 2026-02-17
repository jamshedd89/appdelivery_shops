import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { balanceApi } from '../../services/api';
import { COLORS, SHADOWS } from '../../utils/constants';

export default function CreateOrderScreen({ navigation }) {
  const user = useAuthStore((s) => s.user);
  const createOrder = useOrderStore((s) => s.createOrder);
  const [cost, setCost] = useState('');
  const [items, setItems] = useState([{ description: '', delivery_address: '', latitude: 38.56, longitude: 68.77 }]);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);
  const addrId = user?.sellerProfile?.addresses?.[0]?.id;

  useEffect(() => {
    balanceApi.get().then(({ data }) => setBalance(data.data)).catch(() => {});
  }, []);

  const availableBalance = balance ? parseFloat(balance.balance) - parseFloat(balance.frozen_balance) : 0;
  const totalNeeded = cost ? parseFloat(cost) + 5 : 5;
  const insufficientBalance = cost && availableBalance < totalNeeded;

  const upd = (i, k, v) => { const n = [...items]; n[i] = { ...n[i], [k]: v }; setItems(n); };

  const openMapPicker = (index) => {
    navigation.navigate('AddressPicker', {
      title: `Адрес доставки (товар ${index + 1})`,
      initialCoords: items[index].latitude ? { latitude: items[index].latitude, longitude: items[index].longitude } : null,
      onSelect: (result) => {
        const n = [...items];
        n[index] = { ...n[index], delivery_address: result.address_text, latitude: result.latitude, longitude: result.longitude };
        setItems(n);
      },
    });
  };

  const handleCreate = async () => {
    if (!cost || +cost < 10) { Alert.alert('Ошибка', 'Мин. 10 сомони'); return; }
    if (items.some((i) => !i.description || !i.delivery_address)) { Alert.alert('Ошибка', 'Заполните товары'); return; }
    if (!addrId) { Alert.alert('Ошибка', 'Нет адреса магазина'); return; }
    setLoading(true);
    try {
      await createOrder({
        seller_address_id: addrId, delivery_cost: +cost,
        items: items.map((i) => ({ ...i, latitude: +i.latitude, longitude: +i.longitude })),
      });
      Alert.alert('Успех', 'Заявка создана!');
      navigation.goBack();
    } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Balance card */}
        <View style={[styles.card, insufficientBalance && styles.cardDanger]}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Доступный баланс</Text>
              <Text style={[styles.balanceAmount, insufficientBalance && { color: COLORS.danger }]}>
                {availableBalance.toFixed(2)} сом
              </Text>
            </View>
            {cost ? (
              <View style={styles.balanceNeeded}>
                <Text style={styles.balanceNeededLabel}>Нужно:</Text>
                <Text style={[styles.balanceNeededAmount, insufficientBalance && { color: COLORS.danger }]}>
                  {totalNeeded.toFixed(2)} сом
                </Text>
                <Text style={styles.balanceDetail}>{cost || 0} + 5 ком.</Text>
              </View>
            ) : null}
          </View>
          {insufficientBalance && (
            <View style={styles.insufficientWrap}>
              <View style={styles.insufficientMsg}>
                <Ionicons name="warning" size={16} color={COLORS.danger} />
                <Text style={styles.insufficientText}>Недостаточно средств</Text>
              </View>
              <TouchableOpacity
                style={styles.topUpBtn}
                onPress={() => navigation.navigate('Profile')}
                activeOpacity={0.7}
              >
                <LinearGradient colors={COLORS.gradient.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.topUpGradient}>
                  <Ionicons name="wallet-outline" size={18} color="#fff" />
                  <Text style={styles.topUpText}>Пополнить баланс</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cost */}
        <View style={styles.card}>
          <Text style={styles.section}>Стоимость доставки</Text>
          <Input
            placeholder="Минимум 10 сомони"
            keyboardType="decimal-pad"
            leftIcon="cash-outline"
            value={cost}
            onChangeText={setCost}
          />
        </View>

        {/* Items */}
        {items.map((item, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.itemHeader}>
              <View style={styles.itemNum}>
                <Text style={styles.itemNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.section}>Товар {i + 1}</Text>
              {items.length > 1 && (
                <Button
                  title=""
                  variant="ghost"
                  onPress={() => setItems(items.filter((_, j) => j !== i))}
                  icon={<Ionicons name="trash-outline" size={18} color={COLORS.danger} />}
                  style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                />
              )}
            </View>
            <Input label="Описание товара" leftIcon="cube-outline" value={item.description} onChangeText={(v) => upd(i, 'description', v)} />

            {/* Address with map picker */}
            <Text style={styles.inputLabel}>Адрес доставки</Text>
            <TouchableOpacity style={styles.mapPickerBtn} onPress={() => openMapPicker(i)} activeOpacity={0.7}>
              <Ionicons name="map-outline" size={20} color={item.delivery_address ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.mapPickerText, item.delivery_address && { color: COLORS.text }]} numberOfLines={1}>
                {item.delivery_address || 'Выбрать на карте...'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            {item.delivery_address && (
              <Text style={styles.coordInfo}>
                {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
              </Text>
            )}
          </View>
        ))}

        {items.length < 10 && (
          <Button
            title="Добавить товар"
            variant="outline"
            onPress={() => setItems([...items, { description: '', delivery_address: '', latitude: 38.56, longitude: 68.77 }])}
            icon={<Ionicons name="add-outline" size={20} color={COLORS.primary} />}
            style={{ marginBottom: 16 }}
          />
        )}

        <Button title="Создать заявку" onPress={handleCreate} loading={loading} size="large" disabled={insufficientBalance} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardDanger: { borderColor: COLORS.danger, backgroundColor: '#FFF5F5' },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  balanceLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  balanceAmount: { fontSize: 22, fontWeight: '800', color: COLORS.success },
  balanceNeeded: { alignItems: 'flex-end' },
  balanceNeededLabel: { fontSize: 12, color: COLORS.textMuted },
  balanceNeededAmount: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  balanceDetail: { fontSize: 11, color: COLORS.textMuted },
  insufficientWrap: { marginTop: 14, gap: 10 },
  insufficientMsg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insufficientText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
  topUpBtn: { borderRadius: 14, overflow: 'hidden' },
  topUpGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  topUpText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  section: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16, flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  itemNum: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNumText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  mapPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
    ...SHADOWS.small,
  },
  mapPickerText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMuted,
  },
  coordInfo: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontVariant: ['tabular-nums'],
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 8,
  },
});
