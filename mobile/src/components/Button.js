import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../utils/constants';

export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const bg = variant === 'danger' ? COLORS.danger : variant === 'secondary' ? COLORS.secondary : variant === 'outline' ? 'transparent' : COLORS.primary;
  const tc = variant === 'outline' ? COLORS.primary : COLORS.white;
  return (
    <TouchableOpacity style={[styles.btn, { backgroundColor: bg, borderColor: variant === 'outline' ? COLORS.primary : bg }, disabled && { opacity: 0.5 }, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
      {loading ? <ActivityIndicator color={tc} /> : <Text style={[styles.text, { color: tc }]}>{title}</Text>}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({ btn: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1.5 }, text: { fontSize: 16, fontWeight: '600' } });
