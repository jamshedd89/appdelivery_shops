import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SellerHomeScreen from '../screens/seller/SellerHomeScreen';
import CreateOrderScreen from '../screens/seller/CreateOrderScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { COLORS } from '../utils/constants';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function OrdersStack() {
  return (<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.background }, headerTintColor: COLORS.text, headerShadowVisible: false }}>
    <Stack.Screen name="SellerHome" component={SellerHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Новая заявка' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали' }} />
  </Stack.Navigator>);
}
export default function SellerNavigator() {
  return (<Tab.Navigator screenOptions={({ route }) => ({ tabBarIcon: ({ color, size }) => <Ionicons name={route.name === 'Orders' ? 'list-outline' : 'person-outline'} size={size} color={color} />, tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: COLORS.textSecondary, headerShown: false })}>
    <Tab.Screen name="Orders" component={OrdersStack} options={{ title: 'Заявки' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
  </Tab.Navigator>);
}
