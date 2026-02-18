import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CourierHomeScreen from '../screens/courier/CourierHomeScreen';
import CourierOrdersScreen from '../screens/courier/CourierOrdersScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import WalletScreen from '../screens/shared/WalletScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import LegalScreen from '../screens/shared/LegalScreen';
import { COLORS } from '../utils/constants';

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

function AvailableStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CourierHome" component={CourierHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MyOrdersStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CourierOrdersList" component={CourierOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function CourierNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const icons = { Available: 'compass', CourierOrders: 'list', Earnings: 'wallet', Profile: 'person' };
          const name = icons[route.name] || 'ellipse';
          return <Ionicons name={focused ? name : `${name}-outline`} size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Available" component={AvailableStack} options={{ title: 'Обзор' }} />
      <Tab.Screen name="CourierOrders" component={MyOrdersStack} options={{ title: 'Заказы' }} />
      <Tab.Screen name="Earnings" component={WalletScreen} options={{ title: 'Кошелёк' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}
