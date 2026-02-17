import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StarRating({ rating = 0, size = 24, interactive = false, onRate }) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          disabled={!interactive}
          onPress={() => interactive && onRate?.(s)}
          style={interactive && styles.touchable}
        >
          <Ionicons
            name={s <= rating ? 'star' : 'star-outline'}
            size={size}
            color={s <= rating ? '#FBBF24' : '#D1D5DB'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  touchable: {
    padding: 2,
  },
});
