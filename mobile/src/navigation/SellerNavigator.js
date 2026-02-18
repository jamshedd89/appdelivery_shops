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
import ChatScreen from '../screens/shared/ChatScreen';
import WalletScreen from '../screens/shared/WalletScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import OrderHistoryScreen from '../screens/shared/OrderHistoryScreen';
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

function OrdersStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="SellerHome" component={SellerHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateOrder" component={CreateOrderScreen} options={{ title: 'Новая заявка' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} options={{ title: 'Выбор адреса', headerTransparent: true, headerTintColor: COLORS.text }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
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

export default function SellerNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const icons = { Orders: 'grid', Wallet: 'wallet', History: 'time', Support: 'chatbubble-ellipses', Profile: 'person' };
          const name = icons[route.name] || 'grid';
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
      <Tab.Screen name="Orders" component={OrdersStack} options={{ title: 'Дашборд' }} />
      <Tab.Screen name="History" component={HistoryStack} options={{ title: 'История' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: 'Кошелёк' }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}
