import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, ORDER_STATUS_LABELS, TRANSPORT_ICONS } from '../utils/constants';

const STATUS_THEME = {
  completed: { bg: COLORS.successLight, color: COLORS.success, icon: 'checkmark-circle' },
  confirmed: { bg: COLORS.successLight, color: COLORS.success, icon: 'checkmark-done' },
  delivered: { bg: '#DBEAFE', color: '#3B82F6', icon: 'cube' },
  cancelled_seller: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'close-circle' },
  cancelled_courier: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'close-circle' },
  expired: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'time' },
  waiting: { bg: COLORS.warningLight, color: COLORS.warning, icon: 'hourglass' },
  accepted: { bg: '#DBEAFE', color: '#3B82F6', icon: 'checkmark' },
  created: { bg: COLORS.cardAlt, color: COLORS.textSecondary, icon: 'add-circle' },
  on_way_shop: { bg: '#DBEAFE', color: '#3B82F6', icon: 'navigate' },
  at_shop: { bg: '#DBEAFE', color: '#3B82F6', icon: 'storefront' },
  on_way_client: { bg: '#DBEAFE', color: '#3B82F6', icon: 'bicycle' },
};

export default function OrderCard({ order, onPress, showCourier = false }) {
  const theme = STATUS_THEME[order.status] || STATUS_THEME.created;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.idWrap}>
          <View style={[styles.idDot, { backgroundColor: theme.color }]} />
          <Text style={styles.id}>#{order.id}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: theme.bg }]}>
          <Ionicons name={theme.icon} size={12} color={theme.color} />
          <Text style={[styles.badgeText, { color: theme.color }]}>
            {ORDER_STATUS_LABELS[order.status] || order.status}
          </Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoLabel}>Стоимость</Text>
          </View>
          <Text style={styles.infoValue}>{order.delivery_cost} сом</Text>
        </View>

        {order.items && (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.infoLabel}>Товаров</Text>
            </View>
            <Text style={styles.infoValue}>{order.items.length}</Text>
          </View>
        )}

        {showCourier && order.courier && (
          <View style={styles.courierRow}>
            <View style={styles.courierAvatar}>
              <Ionicons
                name={TRANSPORT_ICONS[order.courier?.courierProfile?.transport_type] || 'person'}
                size={14} color={COLORS.white}
              />
            </View>
            <Text style={styles.courierName} numberOfLines={1}>
              {order.courier.first_name} {order.courier.last_name}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.date}>
          {new Date(order.created_at || order.createdAt).toLocaleString()}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  idWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  id: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  body: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  courierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  courierAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
