import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import Button from '../../components/Button';
import { COLORS, SHADOWS } from '../../utils/constants';

const DUSHANBE = { latitude: 38.5598, longitude: 68.7740, latitudeDelta: 0.025, longitudeDelta: 0.025 };

export default function AddressPickerScreen({ navigation, route }) {
  const { onSelect, initialCoords, title = 'Выберите адрес' } = route.params || {};
  const [region, setRegion] = useState(
    initialCoords
      ? { ...initialCoords, latitudeDelta: 0.01, longitudeDelta: 0.01 }
      : DUSHANBE
  );
  const [pin, setPin] = useState(
    initialCoords || { latitude: DUSHANBE.latitude, longitude: DUSHANBE.longitude }
  );
  const [address, setAddress] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted' && !initialCoords) {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const newRegion = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          };
          setRegion(newRegion);
          setPin({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          mapRef.current?.animateToRegion(newRegion, 600);
        } catch {}
      }
    })();
  }, []);

  const handleMapPress = (e) => {
    const coord = e.nativeEvent.coordinate;
    setPin(coord);
  };

  const handleMyLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setPin({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      mapRef.current?.animateToRegion(newRegion, 500);
    } catch {
      Alert.alert('Ошибка', 'Не удалось определить местоположение');
    }
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      Alert.alert('Ошибка', 'Введите адрес');
      return;
    }
    if (onSelect) {
      onSelect({
        address_text: address.trim(),
        latitude: pin.latitude,
        longitude: pin.longitude,
      });
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        <Marker coordinate={pin}>
          <View style={styles.pinWrap}>
            <LinearGradient colors={COLORS.gradient.primary} style={styles.pinHead}>
              <Ionicons name="location" size={18} color={COLORS.white} />
            </LinearGradient>
            <View style={styles.pinTail} />
          </View>
        </Marker>
      </MapView>

      {/* My location button */}
      <TouchableOpacity style={styles.myLocBtn} onPress={handleMyLocation} activeOpacity={0.8}>
        <Ionicons name="locate" size={22} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Crosshair */}
      <View style={styles.crosshair} pointerEvents="none">
        <Text style={styles.crosshairText}>+</Text>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>{title}</Text>

        <Text style={styles.coordText}>
          {pin.latitude.toFixed(5)}, {pin.longitude.toFixed(5)}
        </Text>

        <View style={styles.inputWrap}>
          <Ionicons name="location-outline" size={20} color={COLORS.textMuted} style={{ marginLeft: 14 }} />
          <TextInput
            style={styles.input}
            placeholder="Введите адрес..."
            placeholderTextColor={COLORS.textMuted}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <Button
          title="Подтвердить адрес"
          onPress={handleConfirm}
          size="large"
          icon={<Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  pinWrap: { alignItems: 'center' },
  pinHead: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  pinTail: {
    width: 3,
    height: 12,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -2,
  },

  myLocBtn: {
    position: 'absolute',
    right: 16,
    top: 100,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },

  crosshair: {
    position: 'absolute',
    top: '38%',
    alignSelf: 'center',
    opacity: 0.15,
  },
  crosshairText: {
    fontSize: 40,
    fontWeight: '300',
    color: COLORS.text,
  },

  bottomPanel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 32,
    ...SHADOWS.large,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  coordText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 16,
    fontVariant: ['tabular-nums'],
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 15,
    color: COLORS.text,
  },
});
