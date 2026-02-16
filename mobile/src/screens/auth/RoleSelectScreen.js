import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../utils/constants';

export default function RoleSelectScreen({ navigation }) {
  return (
    <View style={s.c}>
      <Text style={s.t}>AppDelivery</Text>
      <Text style={s.st}>Выберите вашу роль</Text>
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Login', { role: 'seller' })}>
        <Ionicons name="storefront" size={48} color={COLORS.primary} />
        <Text style={s.rt}>Продавец</Text><Text style={s.rd}>Создавайте заявки на доставку товаров</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Login', { role: 'courier' })}>
        <Ionicons name="bicycle" size={48} color={COLORS.secondary} />
        <Text style={s.rt}>Курьер</Text><Text style={s.rd}>Доставляйте товары и зарабатывайте</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({ c: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 }, t: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: 8 }, st: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 40 }, card: { backgroundColor: COLORS.card, width: '100%', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16, elevation: 4 }, rt: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12 }, rd: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' } });
