import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Button from '../../components/Button';
import StarRating from '../../components/StarRating';
import CancelReasonModal from '../../components/CancelReasonModal';
import useAuthStore from '../../store/authStore';
import useOrderStore from '../../store/orderStore';
import { ordersApi, reviewsApi } from '../../services/api';
import { COLORS, SHADOWS, ORDER_STATUS_LABELS, ORDER_STATUS, TRANSPORT_LABELS, TRANSPORT_ICONS, SOCKET_URL } from '../../utils/constants';
import io from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const STATUS_THEME = {
  completed: { bg: COLORS.successLight, color: COLORS.success, icon: 'checkmark-circle', gradient: COLORS.gradient.success },
  confirmed: { bg: COLORS.successLight, color: COLORS.success, icon: 'checkmark-done', gradient: COLORS.gradient.success },
  delivered: { bg: '#DBEAFE', color: '#3B82F6', icon: 'cube', gradient: ['#3B82F6', '#2563EB'] },
  cancelled_seller: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'close-circle', gradient: COLORS.gradient.warm },
  cancelled_courier: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'close-circle', gradient: COLORS.gradient.warm },
  expired: { bg: COLORS.dangerLight, color: COLORS.danger, icon: 'time', gradient: COLORS.gradient.warm },
  waiting: { bg: COLORS.warningLight, color: COLORS.warning, icon: 'hourglass', gradient: ['#F59E0B', '#D97706'] },
  accepted: { bg: '#DBEAFE', color: '#3B82F6', icon: 'checkmark', gradient: COLORS.gradient.primary },
  created: { bg: COLORS.cardAlt, color: COLORS.textSecondary, icon: 'add-circle', gradient: COLORS.gradient.dark },
  on_way_shop: { bg: '#DBEAFE', color: '#3B82F6', icon: 'navigate', gradient: COLORS.gradient.primary },
  at_shop: { bg: '#DBEAFE', color: '#3B82F6', icon: 'storefront', gradient: COLORS.gradient.primary },
  on_way_client: { bg: '#DBEAFE', color: '#3B82F6', icon: 'bicycle', gradient: COLORS.gradient.primary },
};

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const user = useAuthStore((s) => s.user);
  const { updateOrderStatus, confirmDelivery, cancelBySeller } = useOrderStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState(0);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [courierLocation, setCourierLocation] = useState(null);
  const socketRef = useRef(null);

  const load = async () => {
    try { const { data } = await ordersApi.getById(orderId); setOrder(data.data); }
    catch { Alert.alert('Ошибка', 'Не удалось загрузить'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [orderId]);

  // Real-time courier tracking
  useEffect(() => {
    const isActiveOrder = ['accepted', 'on_way_shop', 'at_shop', 'on_way_client', 'delivered'].includes(order?.status);
    if (!isActiveOrder || !order?.courier_id) return;

    const connectTracker = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const socket = io(`${SOCKET_URL}/orders`, { auth: { token }, transports: ['websocket'] });
      socketRef.current = socket;
      socket.on('connect', () => {
        socket.emit('order:join', order.id);
      });
      socket.on('courier:location:update', (data) => {
        if (data.courierId === order.courier_id) {
          setCourierLocation({ latitude: data.latitude, longitude: data.longitude });
        }
      });
    };
    connectTracker();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('order:leave', order.id);
        socketRef.current.disconnect();
      }
    };
  }, [order?.status, order?.courier_id]);

  const isSeller = user?.role === 'seller';
  const isCourier = user?.role === 'courier';

  const doStatus = async (s) => {
    try { setOrder(await updateOrderStatus(orderId, s)); }
    catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
  };

  const doConfirm = async () => {
    try { setOrder(await confirmDelivery(orderId)); Alert.alert('Успех', 'Подтверждено!'); }
    catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
  };

  const doCancel = () => setCancelModalVisible(true);
  const handleCancelSubmit = async (reason) => {
    setCancelModalVisible(false);
    try {
      if (isSeller) { await cancelBySeller(orderId, reason); }
      else { await useOrderStore.getState().cancelByCourier(orderId, reason); }
      load();
    } catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
  };

  const doReview = async () => {
    if (!stars) { Alert.alert('Ошибка', 'Выберите оценку'); return; }
    try { await reviewsApi.create(orderId, { stars }); Alert.alert('Спасибо!', 'Отзыв отправлен'); setStars(0); }
    catch (e) { Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка'); }
  };

  if (loading || !order) return (
    <View style={styles.loadWrap}>
      <View style={styles.loadPulse} />
      <Text style={styles.loadText}>Загрузка...</Text>
    </View>
  );

  const theme = STATUS_THEME[order.status] || STATUS_THEME.created;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status banner */}
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.statusBanner}>
        <View style={styles.statusIcon}>
          <Ionicons name={theme.icon} size={28} color={COLORS.white} />
        </View>
        <Text style={styles.statusLabel}>{ORDER_STATUS_LABELS[order.status]}</Text>
        <Text style={styles.orderId}>Заказ #{order.id}</Text>
      </LinearGradient>

      {/* Map with live courier tracking */}
      <OrderMap order={order} courierLocation={courierLocation} />

      {/* Delivery Timer */}
      {order.timer_expires_at && ['on_way_client'].includes(order.status) && (
        <DeliveryTimer label="Таймер доставки" expiresAt={order.timer_expires_at} icon="time-outline" color={COLORS.warning} />
      )}
      {order.confirm_expires_at && order.status === 'delivered' && (
        <DeliveryTimer label="Таймер подтверждения" expiresAt={order.confirm_expires_at} icon="checkmark-circle-outline" color={COLORS.success} />
      )}

      {/* Details card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Детали заказа</Text>
        <InfoRow icon="cash-outline" label="Доставка" value={`${order.delivery_cost} сом`} />
        <InfoRow icon="pricetag-outline" label="Комиссия" value={`${order.commission} сом`} />
        {order.sellerAddress && (
          <InfoRow icon="location-outline" label="Откуда" value={order.sellerAddress.address_text} />
        )}
      </View>

      {/* Items card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Товары ({order.items?.length || 0})</Text>
        {order.items?.map((it, i) => (
          <View key={it.id} style={styles.itemRow}>
            <View style={styles.itemNum}>
              <Text style={styles.itemNumText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemDesc}>{it.description}</Text>
              <View style={styles.itemAddrRow}>
                <Ionicons name="navigate-outline" size={12} color={COLORS.textMuted} />
                <Text style={styles.itemAddr}>{it.delivery_address}</Text>
              </View>
            </View>
            {it.is_delivered && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            )}
          </View>
        ))}
      </View>

      {/* Courier card */}
      {order.courier && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Курьер</Text>
          <View style={styles.courierInfo}>
            <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.courierAvatar}>
              <Ionicons name={TRANSPORT_ICONS[order.courier?.courierProfile?.transport_type] || 'person'} size={22} color={COLORS.white} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.courierName}>{order.courier.first_name} {order.courier.last_name}</Text>
              <View style={styles.courierMeta}>
                {order.courier.courierProfile && (
                  <Text style={styles.courierTransport}>{TRANSPORT_LABELS[order.courier.courierProfile.transport_type]}</Text>
                )}
                <Text style={styles.courierRating}>
                  <Ionicons name="star" size={12} color="#FBBF24" /> {order.courier.rating?.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Chat button */}
      {order.courier && ['accepted', 'on_way_shop', 'at_shop', 'on_way_client', 'delivered'].includes(order.status) && (
        <Button
          title="Открыть чат"
          variant="outline"
          onPress={() => {
            const otherUser = isSeller ? order.courier : order.seller;
            navigation.navigate('Chat', { orderId: order.id, otherUser });
          }}
          icon={<Ionicons name="chatbubbles-outline" size={20} color={COLORS.primary} />}
          style={{ marginBottom: 14 }}
        />
      )}

      {/* Action buttons */}
      <View style={styles.actions}>
        {isCourier && order.status === ORDER_STATUS.ACCEPTED && (
          <Button title="В пути к магазину" onPress={() => doStatus(ORDER_STATUS.ON_WAY_SHOP)}
            icon={<Ionicons name="navigate-outline" size={20} color={COLORS.white} />} size="large" />
        )}
        {isCourier && order.status === ORDER_STATUS.ON_WAY_SHOP && (
          <Button title="Я на месте" onPress={() => doStatus(ORDER_STATUS.AT_SHOP)}
            icon={<Ionicons name="storefront-outline" size={20} color={COLORS.white} />} size="large" />
        )}
        {isCourier && order.status === ORDER_STATUS.AT_SHOP && (
          <Button title="Еду к клиенту" onPress={() => doStatus(ORDER_STATUS.ON_WAY_CLIENT)}
            icon={<Ionicons name="bicycle-outline" size={20} color={COLORS.white} />} size="large" />
        )}
        {isCourier && order.status === ORDER_STATUS.ON_WAY_CLIENT && (
          <Button title="Доставлено" onPress={() => doStatus(ORDER_STATUS.DELIVERED)}
            icon={<Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />} variant="secondary" size="large" />
        )}
        {isSeller && order.status === ORDER_STATUS.DELIVERED && (
          <Button title="Подтвердить доставку" onPress={doConfirm}
            icon={<Ionicons name="checkmark-done-outline" size={20} color={COLORS.white} />} size="large" />
        )}
        {isSeller && !['completed', 'confirmed', 'cancelled_seller', 'cancelled_courier', 'expired'].includes(order.status) && (
          <Button title="Отменить заказ" variant="danger" onPress={doCancel}
            icon={<Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />} />
        )}
        {isCourier && ['accepted', 'on_way_shop'].includes(order.status) && (
          <Button title="Отказаться от заказа" variant="danger" onPress={doCancel}
            icon={<Ionicons name="close-circle-outline" size={20} color={COLORS.danger} />} />
        )}
      </View>

      {/* Review */}
      {(order.status === 'confirmed' || order.status === 'completed') && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Оставить отзыв</Text>
          <View style={styles.reviewStars}>
            <StarRating rating={stars} interactive size={36} onRate={setStars} />
          </View>
          <Button title="Отправить отзыв" onPress={doReview} disabled={!stars} />
        </View>
      )}
      {/* Cancel reason modal */}
      <CancelReasonModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onSubmit={handleCancelSubmit}
        role={user?.role}
      />
    </ScrollView>
  );
}

function OrderMap({ order, courierLocation }) {
  const mapRef = useRef(null);
  const sellerAddr = order.sellerAddress;
  const deliveryPoints = order.items?.filter((it) => it.latitude && it.longitude) || [];

  if (!sellerAddr) return null;

  const sellerCoord = { latitude: parseFloat(sellerAddr.latitude), longitude: parseFloat(sellerAddr.longitude) };
  const allCoords = [sellerCoord];
  deliveryPoints.forEach((p) => allCoords.push({ latitude: parseFloat(p.latitude), longitude: parseFloat(p.longitude) }));
  if (courierLocation) allCoords.push(courierLocation);

  useEffect(() => {
    if (allCoords.length > 1 && mapRef.current) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(allCoords, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 300);
    }
  }, [courierLocation]);

  return (
    <View style={styles.mapCard}>
      <MapView
        ref={mapRef}
        style={styles.mapView}
        initialRegion={{ ...sellerCoord, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker coordinate={sellerCoord} title="Магазин" description={sellerAddr.address_text}>
          <View style={[styles.mapMarker, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="storefront" size={14} color={COLORS.white} />
          </View>
        </Marker>
        {deliveryPoints.map((p, i) => (
          <Marker
            key={p.id || i}
            coordinate={{ latitude: parseFloat(p.latitude), longitude: parseFloat(p.longitude) }}
            title={`Доставка ${i + 1}`}
            description={p.delivery_address}
          >
            <View style={[styles.mapMarker, { backgroundColor: COLORS.success }]}>
              <Text style={styles.mapMarkerText}>{i + 1}</Text>
            </View>
          </Marker>
        ))}
        {courierLocation && (
          <Marker coordinate={courierLocation} title="Курьер" anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.courierMapMarker}>
              <Ionicons name="navigate" size={18} color={COLORS.white} />
            </View>
          </Marker>
        )}
        {allCoords.length > 1 && (
          <Polyline
            coordinates={allCoords}
            strokeColor={COLORS.primary}
            strokeWidth={3}
            lineDashPattern={[6, 4]}
          />
        )}
      </MapView>
      <View style={styles.mapLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Магазин</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendText}>Доставка</Text>
        </View>
        {courierLocation && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
            <Text style={styles.legendText}>Курьер</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DeliveryTimer({ label, expiresAt, icon, color }) {
  const [remaining, setRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setRemaining('00:00');
        setIsExpired(true);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <View style={[styles.timerCard, isExpired && styles.timerCardExpired]}>
      <View style={[styles.timerIconWrap, { backgroundColor: isExpired ? COLORS.dangerLight : `${color}20` }]}>
        <Ionicons name={isExpired ? 'alert-circle' : icon} size={22} color={isExpired ? COLORS.danger : color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.timerLabel}>{label}</Text>
        <Text style={[styles.timerValue, isExpired && { color: COLORS.danger }]}>{remaining}</Text>
      </View>
      {isExpired && <Text style={styles.timerExpiredText}>Истёк!</Text>}
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={18} color={COLORS.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  loadWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadPulse: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryGhost, marginBottom: 12 },
  loadText: { fontSize: 15, color: COLORS.textMuted },

  statusBanner: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 18,
    ...SHADOWS.medium,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: { fontSize: 20, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  orderId: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.small,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: 14, color: COLORS.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text, maxWidth: '55%', textAlign: 'right' },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemNum: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGhost,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemNumText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  itemDesc: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  itemAddrRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  itemAddr: { fontSize: 13, color: COLORS.textSecondary },

  courierInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  courierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courierName: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  courierMeta: { flexDirection: 'row', gap: 12 },
  courierTransport: { fontSize: 13, color: COLORS.textSecondary },
  courierRating: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  actions: { gap: 10, marginBottom: 14 },
  reviewStars: { alignItems: 'center', marginBottom: 16 },

  mapCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    ...SHADOWS.medium,
  },
  mapView: {
    width: '100%',
    height: 200,
  },
  mapMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  mapMarkerText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  mapLegend: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },

  timerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 16, padding: 16, marginBottom: 14, gap: 12,
    borderWidth: 1, borderColor: COLORS.borderLight, ...SHADOWS.small,
  },
  timerCardExpired: { borderColor: COLORS.danger, backgroundColor: COLORS.dangerLight },
  timerIconWrap: {
    width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
  },
  timerLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 },
  timerValue: { fontSize: 24, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  timerExpiredText: { fontSize: 13, fontWeight: '700', color: COLORS.danger },

  courierMapMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
});
