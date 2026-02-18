import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../../utils/constants';
import api from '../../services/api';

const TYPE_CONFIG = {
  new_order: { icon: 'cube', color: '#3B82F6', bg: '#DBEAFE' },
  order_accepted: { icon: 'checkmark-circle', color: COLORS.success, bg: COLORS.successLight },
  order_rejected: { icon: 'close-circle', color: COLORS.danger, bg: COLORS.dangerLight },
  courier_arrived: { icon: 'storefront', color: '#8B5CF6', bg: '#EDE9FE' },
  order_delivered: { icon: 'cube', color: COLORS.primary, bg: COLORS.primaryGhost },
  timer_expired: { icon: 'time', color: COLORS.warning, bg: COLORS.warningLight },
  order_cancelled: { icon: 'close-circle', color: COLORS.danger, bg: COLORS.dangerLight },
  rating_changed: { icon: 'star', color: '#F59E0B', bg: '#FEF3C7' },
  balance_change: { icon: 'wallet', color: COLORS.success, bg: COLORS.successLight },
  info: { icon: 'information-circle', color: '#3B82F6', bg: '#DBEAFE' },
};

export default function NotificationsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/notifications?limit=100');
      setNotifications(data.data.notifications);
    } catch { /* ignore */ } finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);
  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch { /* ignore */ }
  };

  const handlePress = async (item) => {
    if (!item.is_read) {
      try { await api.put(`/notifications/${item.id}/read`); } catch { /* ignore */ }
      setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, is_read: true } : n));
    }
    if (item.data?.orderId) {
      navigation.navigate('OrderDetail', { orderId: item.data.orderId });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const renderItem = ({ item }) => {
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
    const date = new Date(item.created_at || item.createdAt);
    const timeAgo = getTimeAgo(date);

    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.is_read && styles.notifUnread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={22} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.notifHeader}>
            <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          {item.body ? <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text> : null}
          <Text style={styles.notifTime}>{timeAgo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Уведомления</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} style={styles.readAllBtn}>
            <Text style={styles.readAllText}>Прочитать все</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="notifications-off-outline" size={56} color={COLORS.border} />
            <Text style={styles.emptyTitle}>Нет уведомлений</Text>
            <Text style={styles.emptyText}>Здесь будут отображаться все уведомления</Text>
          </View>
        }
      />
    </View>
  );
}

function getTimeAgo(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} дн. назад`;
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
    paddingVertical: 14, gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.text },
  readAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: COLORS.primaryGhost },
  readAllText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  list: { paddingHorizontal: 20, paddingBottom: 40 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.card,
    borderRadius: 16, padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  notifUnread: { backgroundColor: COLORS.primaryGhost, borderColor: COLORS.primary + '30' },
  notifIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '500' },

  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, marginTop: 6 },
});
