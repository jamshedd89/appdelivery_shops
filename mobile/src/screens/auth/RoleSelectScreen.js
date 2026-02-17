import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../utils/constants';

const { width } = Dimensions.get('window');

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.logoWrap}>
          <Ionicons name="cube" size={36} color={COLORS.white} />
        </View>
        <Text style={styles.logo}>AppDelivery</Text>
        <Text style={styles.subtitle}>Быстрая доставка по городу</Text>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>Выберите роль</Text>
        <Text style={styles.desc}>Как вы хотите использовать приложение?</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Login', { role: 'seller' })}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: COLORS.primaryGhost }]}>
            <Ionicons name="storefront" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Продавец</Text>
            <Text style={styles.cardDesc}>Создавайте заявки на доставку товаров покупателям</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Login', { role: 'courier' })}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="bicycle" size={32} color={COLORS.secondary} />
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Курьер</Text>
            <Text style={styles.cardDesc}>Доставляйте заказы и зарабатывайте каждый день</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  desc: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.medium,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
