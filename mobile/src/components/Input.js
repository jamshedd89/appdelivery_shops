import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

export default function Input({ label, error, style, ...props }) {
  return (
    <View style={[styles.c, style]}>
      {label && <Text style={styles.l}>{label}</Text>}
      <TextInput style={[styles.i, error && { borderColor: COLORS.danger }]} placeholderTextColor={COLORS.textSecondary} {...props} />
      {error && <Text style={styles.e}>{error}</Text>}
    </View>
  );
}
const styles = StyleSheet.create({ c: { marginBottom: 16 }, l: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 6 }, i: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: COLORS.text }, e: { color: COLORS.danger, fontSize: 12, marginTop: 4 } });
