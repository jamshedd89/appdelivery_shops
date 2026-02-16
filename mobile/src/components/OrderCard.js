import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ORDER_STATUS_LABELS, TRANSPORT_LABELS } from '../utils/constants';

export default function OrderCard({ order, onPress, showCourier = false }) {
  const sc = order.status === 'completed' || order.status === 'confirmed' ? COLORS.success : order.status.startsWith('cancelled') || order.status === 'expired' ? COLORS.danger : COLORS.warning;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.hdr}><Text style={styles.id}>#{order.id}</Text><View style={[styles.badge, { backgroundColor: sc + '20' }]}><Text style={[styles.st, { color: sc }]}>{ORDER_STATUS_LABELS[order.status] || order.status}</Text></View></View>
      <View style={styles.row}><Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.info}>{order.delivery_cost} сомони</Text></View>
      {order.items && <View style={styles.row}><Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.info}>{order.items.length} товар(ов)</Text></View>}
      {showCourier && order.courier && <View style={styles.row}><Ionicons name="person-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.info}>{order.courier.first_name} {order.courier.last_name}{order.courier.courierProfile ? ` (${TRANSPORT_LABELS[order.courier.courierProfile.transport_type] || ''})` : ''}</Text></View>}
      <Text style={styles.date}>{new Date(order.created_at || order.createdAt).toLocaleString()}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({ card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, id: { fontSize: 18, fontWeight: '700', color: COLORS.text }, badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }, st: { fontSize: 12, fontWeight: '600' }, row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }, info: { fontSize: 14, color: COLORS.textSecondary }, date: { fontSize: 12, color: COLORS.textSecondary, marginTop: 8, textAlign: 'right' } });
