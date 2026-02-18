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
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.white },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterSeller" component={RegisterSellerScreen} />
      <Stack.Screen name="RegisterCourier" component={RegisterCourierScreen} />
      <Stack.Screen name="AddressPicker" component={AddressPickerScreen} options={{ headerShown: true, title: 'Выбор адреса', headerTransparent: true, headerTintColor: COLORS.text }} />
    </Stack.Navigator>
  );
}
