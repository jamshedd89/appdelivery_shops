import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function StarRating({ rating = 0, size = 24, interactive = false, onRate }) {
  return (
    <View style={styles.c}>
      {[1,2,3,4,5].map((s) => (
        <TouchableOpacity key={s} disabled={!interactive} onPress={() => interactive && onRate?.(s)}>
          <Ionicons name={s <= rating ? 'star' : 'star-outline'} size={size} color={s <= rating ? '#FFC107' : COLORS.border} />
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({ c: { flexDirection: 'row', gap: 4 } });
