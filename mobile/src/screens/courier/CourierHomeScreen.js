import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { connectOrdersSocket } from '../../services/socket';
import { COLORS } from '../../utils/constants';

const DUSHANBE = { latitude: 38.5598, longitude: 68.7740, latitudeDelta: 0.04, longitudeDelta: 0.04 };
const { height: SCREEN_H } = Dimensions.get('window');

export default function CourierHomeScreen({ navigation }) {
  const { availableOrders, isLoading, fetchAvailableOrders, acceptOrder } = useOrderStore();
  const user = useAuthStore((s) => s.user);
  const [online, setOnline] = useState(false);
  const [myLoc, setMyLoc] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Ошибка', 'Нужен доступ к геолокации'); return; }
      const sock = await connectOrdersSocket();
      if (!sock) return;
      const send = async () => {
        try {
          const l = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setMyLoc({ latitude: l.coords.latitude, longitude: l.coords.longitude });
          sock.emit('courier:location', { latitude: l.coords.latitude, longitude: l.coords.longitude });
        } catch {}
      };
      send();
      const iv = setInterval(send, 20000);
      setOnline(true);
      return () => clearInterval(iv);
    })();
    fetchAvailableOrders();
  }, []);

  useEffect(() => navigation.addListener('focus', fetchAvailableOrders), [navigation]);

  useEffect(() => {
    if (availableOrders.length > 0 && mapRef.current) {
      const coords = availableOrders
        .filter((o) => o.sellerAddress)
        .map((o) => ({
          latitude: parseFloat(o.sellerAddress.latitude),
          longitude: parseFloat(o.sellerAddress.longitude),
        }));
      if (myLoc) coords.push(myLoc);
      if (coords.length > 1) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    }
  }, [availableOrders]);

  const handleAccept = async (id) => {
    try {
      await acceptOrder(id);
      Alert.alert('Успех', 'Заявка принята!');
      navigation.navigate('CourierOrders');
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Ошибка');
    }
  };

  const orderMarkers = availableOrders
    .filter((o) => o.sellerAddress)
    .map((o) => ({
      id: o.id,
      latitude: parseFloat(o.sellerAddress.latitude),
      longitude: parseFloat(o.sellerAddress.longitude),
      price: `${o.delivery_cost} сом`,
    }));

  const balance = parseFloat(user?.balance || 0).toFixed(0);

  return (
    <View style={styles.container}>
      {/* Full map background */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={myLoc ? { ...myLoc, latitudeDelta: 0.03, longitudeDelta: 0.03 } : DUSHANBE}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {orderMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            onPress={() => navigation.navigate('OrderDetail', { orderId: m.id })}
          >
            <View style={styles.markerWrap}>
              <View style={styles.markerPrice}>
                <Text style={styles.markerPriceText}>{m.price}</Text>
              </View>
              <View style={styles.marker}>
                <Ionicons name="bag-handle" size={16} color={COLORS.white} />
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating top bar */}
      <View style={styles.topBar}>
        {/* Profile pill */}
        <View style={styles.profilePill}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{(user?.first_name || 'К')[0]}</Text>
          </View>
          <View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={COLORS.primary} />
              <Text style={styles.ratingText}>{user?.rating?.toFixed(1) || '5.0'}</Text>
            </View>
            <Text style={styles.balanceSmall}>{balance} сом</Text>
          </View>
        </View>

        {/* Online toggle */}
        <TouchableOpacity
          style={styles.onlinePill}
          onPress={() => setOnline(!online)}
          activeOpacity={0.8}
        >
          <Text style={styles.onlineText}>{online ? 'В сети' : 'Офлайн'}</Text>
          <View style={[styles.onlineDot, { backgroundColor: online ? COLORS.primary : COLORS.textMuted }]} />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity style={styles.topBtn}>
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Map controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.mapControlBtn} onPress={() => {
          if (myLoc && mapRef.current) {
            mapRef.current.animateToRegion({ ...myLoc, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 500);
          }
        }}>
          <Ionicons name="locate" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Bottom sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Доступные заказы</Text>
          <View style={styles.nearbyBadge}>
            <Text style={styles.nearbyText}>{availableOrders.length} рядом</Text>
          </View>
        </View>
        <Text style={styles.sheetSub}>В радиусе 3 км от вас</Text>

        <FlatList
          data={availableOrders}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              activeOpacity={0.7}
            >
              <View style={styles.orderIcon}>
                <Ionicons name="cube" size={28} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderName} numberOfLines={1}>
                    {item.seller?.first_name || 'Магазин'} #{item.id}
                  </Text>
                  <Text style={styles.orderCost}>{item.delivery_cost} сом</Text>
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate" size={12} color={COLORS.textMuted} />
                    <Text style={styles.metaText}>{item.items?.length || 1} товар</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.metaText}>{item.seller?.rating?.toFixed(1) || '5.0'}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.sheetList}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAvailableOrders} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Нет заявок поблизости</Text>
              <Text style={styles.emptyDesc}>Потяните вниз для обновления</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    position: 'absolute', top: 52, left: 16, right: 16, zIndex: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  profilePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20)',
    paddingLeft: 4, paddingRight: 16, paddingVertical: 4,
    borderRadius: 9999, shadowColor: '#000', shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 12, elevation: 4,
  },
  profileAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryGhost,
    borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  profileAvatarText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  balanceSmall: { fontSize: 11, fontWeight: '500', color: COLORS.textSecondary },

  onlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 9999,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12, elevation: 4,
  },
  onlineText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },

  topBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12, elevation: 4, marginLeft: 'auto',
  },

  mapControls: {
    position: 'absolute', right: 16, bottom: 320, zIndex: 10,
    gap: 8,
  },
  mapControlBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12, elevation: 4,
  },

  markerWrap: { alignItems: 'center' },
  markerPrice: {
    backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 9999, marginBottom: 4,
  },
  markerPriceText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  marker: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.white,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8, elevation: 4,
  },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
    backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    minHeight: 300, maxHeight: SCREEN_H * 0.45,
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -6 },
    shadowRadius: 20, elevation: 10,
  },
  sheetHandle: {
    width: 48, height: 5, borderRadius: 3, backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16,
  },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  nearbyBadge: {
    backgroundColor: COLORS.primaryGhost, paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 9999,
  },
  nearbyText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  sheetSub: { fontSize: 13, color: COLORS.textSecondary, paddingHorizontal: 24, marginTop: 4, marginBottom: 12 },

  sheetList: { paddingHorizontal: 16, paddingBottom: 100 },
  orderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, backgroundColor: COLORS.background, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: 10,
  },
  orderIcon: {
    width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.white,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.borderLight,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderName: { fontSize: 15, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8 },
  orderCost: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  orderMeta: { flexDirection: 'row', gap: 14, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },

  emptyWrap: { alignItems: 'center', marginTop: 30, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textSecondary },
});
