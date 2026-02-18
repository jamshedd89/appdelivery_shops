import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
  ActivityIndicator, RefreshControl, FlatList, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { balanceApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { COLORS, SHADOWS } from '../../utils/constants';

const TRANSACTION_ICONS = {
  deposit: { icon: 'arrow-down-circle', color: COLORS.success },
  withdrawal: { icon: 'arrow-up-circle', color: COLORS.danger },
  payment: { icon: 'swap-horizontal', color: '#3B82F6' },
  commission: { icon: 'pricetag', color: COLORS.warning },
  freeze: { icon: 'snow', color: '#8B5CF6' },
  unfreeze: { icon: 'flame', color: '#F97316' },
  penalty: { icon: 'alert-circle', color: COLORS.danger },
};

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [balance, setBalance] = useState({ balance: 0, frozen_balance: 0, available: 0 });
  const [transactions, setTransactions] = useState([]);
  const [txTotal, setTxTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);

  const loadData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        balanceApi.get(),
        balanceApi.getTransactions(30, 0),
      ]);
      setBalance(balRes.data.data);
      setTransactions(txRes.data.data.transactions);
      setTxTotal(txRes.data.data.total);
    } catch { /* ignore */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, []);

  if (loading) return (
    <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenTitle}>Кошелёк</Text>

        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balLabel}>Доступный баланс</Text>
          <Text style={styles.balAmount}>{balance.available.toFixed(2)}</Text>
          <Text style={styles.balCurrency}>сомони</Text>

          <View style={styles.balDetails}>
            <View style={styles.balDetail}>
              <Ionicons name="wallet-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.balDetailLabel}>Всего</Text>
              <Text style={styles.balDetailValue}>{balance.balance.toFixed(2)}</Text>
            </View>
            <View style={styles.balDivider} />
            <View style={styles.balDetail}>
              <Ionicons name="snow-outline" size={16} color="#8B5CF6" />
              <Text style={styles.balDetailLabel}>Заморож.</Text>
              <Text style={styles.balDetailValue}>{balance.frozen_balance.toFixed(2)}</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setDepositModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primaryGhost }]}>
                <Ionicons name="add" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.actionLabel}>Пополнить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setWithdrawModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
                <Ionicons name="arrow-up" size={22} color={COLORS.danger} />
              </View>
              <Text style={styles.actionLabel}>Вывести</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Withdrawal info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoTitle}>Условия вывода</Text>
            <Text style={styles.infoText}>Мин. сумма: 50 сомони{'\n'}До 100 сом — комиссия 3%{'\n'}Свыше 100 сом — комиссия 1.5%</Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>История операций</Text>
          <Text style={styles.sectionCount}>{txTotal}</Text>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>Нет операций</Text>
          </View>
        ) : (
          transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
        )}
      </ScrollView>

      <AmountModal
        visible={depositModal}
        onClose={() => setDepositModal(false)}
        title="Пополнить баланс"
        subtitle="Введите сумму пополнения"
        btnText="Пополнить"
        minAmount={1}
        onSubmit={async (amount) => {
          await balanceApi.deposit(amount);
          loadData();
        }}
      />
      <AmountModal
        visible={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        title="Вывод средств"
        subtitle="Мин. 50 сомони. Комиссия 3% (до 100) / 1.5% (свыше 100)"
        btnText="Вывести"
        minAmount={50}
        showCommission
        onSubmit={async (amount) => {
          await balanceApi.withdraw(amount);
          loadData();
        }}
      />
    </View>
  );
}

function TransactionRow({ tx }) {
  const info = TRANSACTION_ICONS[tx.type] || { icon: 'ellipse', color: COLORS.textMuted };
  const isPositive = parseFloat(tx.amount) > 0;
  const date = new Date(tx.created_at || tx.createdAt);
  const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  return (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: info.color + '14' }]}>
        <Ionicons name={info.icon} size={20} color={info.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
        <Text style={styles.txDate}>{dateStr}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isPositive ? COLORS.success : COLORS.danger }]}>
        {isPositive ? '+' : ''}{parseFloat(tx.amount).toFixed(2)}
      </Text>
    </View>
  );
}

function AmountModal({ visible, onClose, title, subtitle, btnText, minAmount, showCommission, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const commission = showCommission
    ? (numAmount <= 100 ? numAmount * 0.03 : numAmount * 0.015)
    : 0;

  const handleSubmit = async () => {
    if (numAmount < minAmount) {
      Alert.alert('Ошибка', `Минимальная сумма: ${minAmount} сомони`);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(numAmount);
      Alert.alert('Успешно', showCommission
        ? `Выведено ${numAmount.toFixed(2)} сом (комиссия ${commission.toFixed(2)})`
        : `Баланс пополнен на ${numAmount.toFixed(2)} сом`);
      setAmount('');
      onClose();
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Операция не удалась');
    } finally { setLoading(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{subtitle}</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />

          {showCommission && numAmount >= minAmount && (
            <View style={styles.commissionRow}>
              <Text style={styles.commissionLabel}>Комиссия:</Text>
              <Text style={styles.commissionValue}>{commission.toFixed(2)} сом ({numAmount <= 100 ? '3%' : '1.5%'})</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.modalBtn, (loading || numAmount < minAmount) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading || numAmount < minAmount}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color={COLORS.dark} /> : (
              <Text style={styles.modalBtnText}>{btnText}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 20, letterSpacing: -0.5 },

  balanceCard: {
    backgroundColor: COLORS.secondary, borderRadius: 24, padding: 24,
    marginBottom: 14, ...SHADOWS.large,
  },
  balLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  balAmount: { fontSize: 42, fontWeight: '800', color: COLORS.primary, letterSpacing: -1 },
  balCurrency: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 20 },
  balDetails: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 20,
  },
  balDetail: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  balDetailLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  balDetailValue: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  balDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 12 },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, gap: 10 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.white },

  infoCard: {
    flexDirection: 'row', backgroundColor: COLORS.primaryGhost, borderRadius: 14,
    padding: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.primary + '20',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  infoText: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, backgroundColor: COLORS.cardAlt, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },

  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 12 },

  txRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 14, padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  txIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  txDesc: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  txDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  txAmount: { fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40,
  },
  modalClose: {
    position: 'absolute', top: 16, right: 16, width: 36, height: 36,
    borderRadius: 18, backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4, marginTop: 8 },
  modalSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 18 },
  modalInput: {
    backgroundColor: COLORS.background, borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 16, fontSize: 24, fontWeight: '700', color: COLORS.text,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, textAlign: 'center',
  },
  commissionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 4 },
  commissionLabel: { fontSize: 13, color: COLORS.textSecondary },
  commissionValue: { fontSize: 13, fontWeight: '600', color: COLORS.danger },
  modalBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 9999,
    alignItems: 'center', marginTop: 6,
  },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.dark },
});
