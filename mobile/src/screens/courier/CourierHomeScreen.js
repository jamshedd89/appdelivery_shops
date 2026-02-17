import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import OrderCard from '../../components/OrderCard';
import Button from '../../components/Button';
import useOrderStore from '../../store/orderStore';
import useAuthStore from '../../store/authStore';
import { connectOrdersSocket } from '../../services/socket';
import { COLORS, SHADOWS } from '../../utils/constants';

const DUSHANBE = { latitude: 38.5598, longitude: 68.7740, latitudeDelta: 0.04, longitudeDelta: 0.04 };
const { height: SCREEN_H } = Dimensions.get('window');

export default function CourierHomeScreen({ navigation }) {
  const { availableOrders, isLoading, fetchAvailableOrders, acceptOrder } = useOrderStore();
  const user = useAuthStore((s) => s.user);
  const [online, setOnline] = useState(false);
  const [showMap, setShowMap] = useState(true);
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
    if (availableOrders.length > 0 && mapRef.current && showMap) {
      const coords = availableOrders
        .filter((o) => o.sellerAddress)
        .map((o) => ({
          latitude: parseFloat(o.sellerAddress.latitude),
          longitude: parseFloat(o.sellerAddress.longitude),
        }));
      if (myLoc) coords.push(myLoc);
      if (coords.length > 1) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 60, right: 40, bottom: 60, left: 40 },
          animated: true,
        });
      }
    }
  }, [availableOrders, showMap]);

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
      title: `Заказ #${o.id}`,
      description: `${o.delivery_cost} сом`,
    }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#7C3AED', '#6D28D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Привет,</Text>
            <Text style={styles.name}>{user?.first_name || 'Курьер'}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusPill, { backgroundColor: online ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
              <View style={[styles.statusDot, { backgroundColor: online ? COLORS.success : COLORS.danger }]} />
              <Text style={[styles.statusText, { color: online ? '#6EE7B7' : '#FCA5A5' }]}>
                {online ? 'Онлайн' : 'Офлайн'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, showMap && styles.toggleActive]}
            onPress={() => setShowMap(true)}
          >
            <Ionicons name="map" size={16} color={showMap ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>Карта</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !showMap && styles.toggleActive]}
            onPress={() => setShowMap(false)}
          >
            <Ionicons name="list" size={16} color={!showMap ? '#fff' : 'rgba(255,255,255,0.6)'} />
            <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>Список</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map view */}
      {showMap && (
        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={myLoc ? { ...myLoc, latitudeDelta: 0.03, longitudeDelta: 0.03 } : DUSHANBE}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {orderMarkers.map((m) => (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                title={m.title}
                description={m.description}
                onCalloutPress={() => navigation.navigate('OrderDetail', { orderId: m.id })}
              >
                <View style={styles.marker}>
                  <Ionicons name="cube" size={14} color={COLORS.white} />
                </View>
              </Marker>
            ))}
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapBadge}>{availableOrders.length} заявок</Text>
          </View>
        </View>
      )}

      {/* List view */}
      <FlatList
        data={availableOrders}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View>
            <OrderCard
              order={item}
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
            />
            <Button
              title="Принять заявку"
              onPress={() => handleAccept(item.id)}
              icon={<Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />}
              style={{ marginBottom: 20, marginTop: -4 }}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAvailableOrders} tintColor={COLORS.secondary} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="map-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Нет заявок поблизости</Text>
            <Text style={styles.emptyDesc}>Потяните вниз для обновления</Text>
          </View>
        }
        style={showMap ? { maxHeight: SCREEN_H * 0.3 } : { flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.white, letterSpacing: -0.3 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  toggleText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  toggleTextActive: { color: '#fff' },

  mapWrap: { height: SCREEN_H * 0.32, margin: 16, borderRadius: 20, overflow: 'hidden', ...SHADOWS.medium },
  map: { flex: 1 },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  mapBadge: { fontSize: 12, fontWeight: '700', color: COLORS.secondary },

  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  emptyWrap: { alignItems: 'center', marginTop: 40, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.textSecondary },
});
