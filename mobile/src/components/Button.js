import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, SHADOWS } from '../utils/constants';

export default function Button({
  title, onPress, variant = 'primary', loading = false,
  disabled = false, style, icon, size = 'medium',
}) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  const isSecondary = variant === 'secondary';

  const py = size === 'small' ? 10 : size === 'large' ? 18 : 14;
  const fs = size === 'small' ? 14 : size === 'large' ? 17 : 15;
  const radius = size === 'large' ? 9999 : 14;

  if (isOutline || isGhost || isDanger) {
    const bg = isDanger ? COLORS.dangerLight : isGhost ? 'transparent' : COLORS.primaryGhost;
    const tc = isDanger ? COLORS.danger : COLORS.primary;
    const bw = isGhost ? 0 : isDanger ? 0 : 1.5;
    const bc = isDanger ? 'transparent' : COLORS.primary + '30';
    return (
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: bg, borderWidth: bw, borderColor: bc, paddingVertical: py, borderRadius: radius }, disabled && styles.disabled, style]}
        onPress={onPress} disabled={disabled || loading} activeOpacity={0.7}
      >
        {loading ? <ActivityIndicator color={tc} size="small" /> : (
          <View style={styles.inner}>
            {icon}
            <Text style={[styles.text, { color: tc, fontSize: fs }]}>{title}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const bgColor = isSecondary ? COLORS.secondary : COLORS.primary;
  const textColor = isSecondary ? COLORS.white : COLORS.dark;

  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}
      style={[styles.btn, styles.primaryBtn, { backgroundColor: bgColor, paddingVertical: py, borderRadius: radius }, SHADOWS.medium, disabled && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={textColor} size="small" /> : (
        <View style={styles.inner}>
          {icon}
          <Text style={[styles.text, { color: textColor, fontSize: fs }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryBtn: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});
