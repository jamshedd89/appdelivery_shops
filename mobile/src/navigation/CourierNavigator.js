import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CourierHomeScreen from '../screens/courier/CourierHomeScreen';
import CourierOrdersScreen from '../screens/courier/CourierOrdersScreen';
import OrderDetailScreen from '../screens/shared/OrderDetailScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';
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

function AvailableStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CourierHome" component={CourierHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
    </Stack.Navigator>
  );
}

function MyOrdersStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="CourierOrdersList" component={CourierOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Детали заказа' }} />
    </Stack.Navigator>
  );
}

export default function CourierNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          const iconMap = { Available: 'map', CourierOrders: 'cube', Profile: 'person' };
          const name = iconMap[route.name] || 'ellipse';
          return (
            <View style={focused ? styles.activeTab : undefined}>
              <Ionicons name={focused ? name : `${name}-outline`} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.secondary,
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
      <Tab.Screen name="Available" component={AvailableStack} options={{ title: 'Заявки' }} />
      <Tab.Screen name="CourierOrders" component={MyOrdersStack} options={{ title: 'Мои' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Профиль' }} />
    </Tab.Navigator>
  );
}

const styles = {
  activeTab: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
};
