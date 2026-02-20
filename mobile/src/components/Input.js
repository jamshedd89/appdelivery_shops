import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/constants';

export default function Input({
  label, error, style, secureTextEntry, leftIcon, containerStyle, ...props
}) {
  const [hidden, setHidden] = useState(secureTextEntry);

  const toggleHidden = useCallback(() => setHidden(h => !h), []);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrap, error && styles.inputError]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={COLORS.textMuted} style={styles.leftIcon} />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={hidden}
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleHidden} style={styles.eyeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={COLORS.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontSize: 12, fontWeight: '700', color: COLORS.text,
    marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1.5,
    borderColor: COLORS.border, borderRadius: 14,
    paddingHorizontal: 16, minHeight: 56,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
  },
  leftIcon: { marginRight: 12 },
  input: {
    flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500',
    paddingVertical: Platform.OS === 'android' ? 14 : 16,
    paddingHorizontal: 0,
  },
  eyeBtn: { padding: 8, marginLeft: 4 },
  errorRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 4, marginTop: 6, paddingLeft: 4,
  },
  error: { color: COLORS.danger, fontSize: 12, fontWeight: '500' },
});
