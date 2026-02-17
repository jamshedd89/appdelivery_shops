import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../utils/constants';

const DUSHANBE = { latitude: 38.5598, longitude: 68.7740, latitudeDelta: 0.04, longitudeDelta: 0.04 };

export default function DeliveryMap({
  style,
  markers = [],
  routeCoords = [],
  initialRegion = DUSHANBE,
  showsUserLocation = true,
  onMapPress,
  selectedMarker,
  children,
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (markers.length > 1 && mapRef.current) {
      const coords = markers.map((m) => ({ latitude: m.latitude, longitude: m.longitude }));
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 80, right: 60, bottom: 80, left: 60 },
        animated: true,
      });
    }
  }, [markers]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={onMapPress}
        mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        {markers.map((marker, index) => (
          <Marker
            key={marker.id || index}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title}
            description={marker.description}
          >
            <View style={[styles.markerWrap, { backgroundColor: marker.color || COLORS.primary }]}>
              <Ionicons
                name={marker.icon || 'location'}
                size={16}
                color={COLORS.white}
              />
            </View>
          </Marker>
        ))}

        {selectedMarker && (
          <Marker coordinate={selectedMarker}>
            <View style={[styles.markerWrap, styles.selectedMarker]}>
              <Ionicons name="pin" size={18} color={COLORS.white} />
            </View>
          </Marker>
        )}

        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={COLORS.primary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {children}
      </MapView>
    </View>
  );
}

export function MapLegend({ items }) {
  return (
    <View style={styles.legend}>
      {items.map((item, i) => (
        <View key={i} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export { DUSHANBE };

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  selectedMarker: {
    backgroundColor: COLORS.danger,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  legend: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: 10,
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
