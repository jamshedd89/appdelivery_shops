import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterSellerScreen from '../screens/auth/RegisterSellerScreen';
import RegisterCourierScreen from '../screens/auth/RegisterCourierScreen';
import AddressPickerScreen from '../screens/shared/AddressPickerScreen';
import { COLORS } from '../utils/constants';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerBackTitleVisible: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Вход' }} />
      <Stack.Screen name="RegisterSeller" component={RegisterSellerScreen} options={{ title: 'Регистрация' }} />
      <Stack.Screen name="RegisterCourier" component={RegisterCourierScreen} options={{ title: 'Регистрация' }} />
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} options={{ title: 'Выбор адреса', headerTransparent: true, headerTintColor: COLORS.text }} />
    </Stack.Navigator>
  );
}
