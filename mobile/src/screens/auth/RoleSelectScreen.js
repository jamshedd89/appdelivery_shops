import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function RoleSelectScreen({ navigation }) {
  const [selected, setSelected] = useState('seller');

  const handleContinue = () => {
    navigation.navigate('Login', { role: selected });
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 48 }} />
        <Text style={styles.topTitle}>Начать</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>Выберите роль</Text>
        <Text style={styles.subtitle}>Выберите, как вы хотите использовать приложение.</Text>

        {/* Role cards */}
        <TouchableOpacity
          style={[styles.roleCard, selected === 'seller' && styles.roleCardActive]}
          onPress={() => setSelected('seller')}
          activeOpacity={0.8}
        >
          <View style={styles.roleCardTop}>
            <View style={[styles.roleIcon, selected === 'seller' && styles.roleIconActive]}>
              <Ionicons name="storefront" size={24} color={selected === 'seller' ? COLORS.white : COLORS.text} />
            </View>
            {selected === 'seller' && (
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.roleTitle}>Стать Продавцом</Text>
          <Text style={styles.roleDesc}>Управляйте товарами, развивайте бизнес и находите быструю доставку.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, selected === 'courier' && styles.roleCardActive]}
          onPress={() => setSelected('courier')}
          activeOpacity={0.8}
        >
          <View style={styles.roleCardTop}>
            <View style={[styles.roleIcon, selected === 'courier' && styles.roleIconActive]}>
              <Ionicons name="bicycle" size={24} color={selected === 'courier' ? COLORS.white : COLORS.text} />
            </View>
            {selected === 'courier' && (
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.roleTitle}>Стать Курьером</Text>
          <Text style={styles.roleDesc}>Зарабатывайте на своих условиях с гибким графиком и выплатами.</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.9}>
          <Text style={styles.continueBtnText}>Продолжить</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.dark} />
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Продолжая, вы соглашаетесь с{' '}
          <Text style={styles.termsLink}>Условиями</Text> и{' '}
          <Text style={styles.termsLink}>Политикой конфиденциальности</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 8,
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },

  title: {
    fontSize: 32, fontWeight: '800', color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15, color: COLORS.textSecondary,
    marginTop: 8, marginBottom: 28, lineHeight: 22,
  },

  roleCard: {
    borderWidth: 2, borderColor: 'transparent',
    backgroundColor: COLORS.background,
    borderRadius: 16, padding: 20, marginBottom: 16,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGhost,
  },
  roleCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 12,
  },
  roleIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center', alignItems: 'center',
  },
  roleIconActive: { backgroundColor: COLORS.primary },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  roleTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  roleDesc: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },

  bottomSection: {
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16,
    backgroundColor: COLORS.white, borderTopWidth: 1,
    borderTopColor: COLORS.borderLight, borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 8,
  },
  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingVertical: 18, borderRadius: 9999,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4, marginBottom: 16,
  },
  continueBtnText: { fontSize: 17, fontWeight: '700', color: COLORS.dark },

  termsText: {
    fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 16,
  },
  termsLink: { color: COLORS.primary, fontWeight: '600' },
});
