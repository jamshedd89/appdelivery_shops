import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CourierHomeScreen from '../screens/courier/CourierHomeScreen';
import CourierOrdersScreen from '../screens/courier/CourierOrdersScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import { COLORS } from '../utils/constants';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function AvailableStack() {
  return (<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.background }, headerTintColor: COLORS.text, headerShadowVisible: false }}>
    <Stack.Screen name="CourierHome" component={CourierHomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали' }} />
  </Stack.Navigator>);
}
function MyOrdersStack() {
  return (<Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: COLORS.background }, headerTintColor: COLORS.text, headerShadowVisible: false }}>
    <Stack.Screen name="CourierOrdersList" component={CourierOrdersScreen} options={{ headerShown: false }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали' }} />
  </Stack.Navigator>);
}
export default function CourierNavigator() {
  return (<Tab.Navigator screenOptions={({ route }) => ({ tabBarIcon: ({ color, size }) => <Ionicons name={route.name === 'Available' ? 'map-outline' : route.name === 'CourierOrders' ? 'cube-outline' : 'person-outline'} size={size} color={color} />, tabBarActiveTintColor: COLORS.primary, tabBarInactiveTintColor: COLORS.textSecondary, headerShown: false })}>
    <Tab.Screen name="Available" component={AvailableStack} options={{ title: 'Заявки' }} />
    <Tab.Screen name="CourierOrders" component={MyOrdersStack} options={{ title: 'Мои' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
  </Tab.Navigator>);
}
