import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import SellerNavigator from './SellerNavigator';
import CourierNavigator from './CourierNavigator';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/constants';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();
  useEffect(() => { initialize(); }, []);
  if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  return (<NavigationContainer>{!isAuthenticated ? <AuthNavigator /> : user?.role === 'courier' ? <CourierNavigator /> : <SellerNavigator />}</NavigationContainer>);
}
