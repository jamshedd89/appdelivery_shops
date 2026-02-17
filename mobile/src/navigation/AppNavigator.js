import React, { useEffect } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import SellerNavigator from './SellerNavigator';
import CourierNavigator from './CourierNavigator';
import useAuthStore from '../store/authStore';
import { COLORS } from '../utils/constants';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user, initialize } = useAuthStore();
  useEffect(() => { initialize(); }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: COLORS.primaryGhost, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isAuthenticated ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      {!isAuthenticated ? <AuthNavigator /> : user?.role === 'courier' ? <CourierNavigator /> : <SellerNavigator />}
    </NavigationContainer>
  );
}
