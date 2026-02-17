import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SellerHomeScreen from '../screens/seller/SellerHomeScreen';
import CreateOrderScreen from '../screens/seller/CreateOrderScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import AddressPickerScreen from '../screens/shared/AddressPickerScreen';
import { COLORS, SHADOWS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const stackOptions = {
  headerStyle: { backgroundColor: COLORS.background },
  headerTintColor: COLORS.text,
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  headerBackTitleVisible: false,
  contentStyle: { backgroundColor: COLORS.background },
};

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="SellerHome" component={SellerHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Новая заявка' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} options={{ title: 'Выбор адреса', headerTransparent: true, headerTintColor: COLORS.text }} />
    </Stack.Navigator>
  );
}

export default function SellerNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const name = route.name === 'Orders' ? 'list' : 'person';
          return (
            <View style={focused ? styles.activeTab : undefined}>
              <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
          ...SHADOWS.medium,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Orders" component={OrdersStack} options={{ title: 'Заявки' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}

const styles = {
  activeTab: {
    backgroundColor: COLORS.primaryGhost,
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
};
