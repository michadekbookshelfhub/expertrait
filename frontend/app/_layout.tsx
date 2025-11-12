import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import AnimatedSplash from '../components/AnimatedSplash';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    checkOnboarding();
    
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboardingComplete = await AsyncStorage.getItem('@onboarding_complete');
      
      // Wait for splash to finish
      setTimeout(() => {
        setIsLoading(false);
        if (!onboardingComplete) {
          router.replace('/onboarding');
        }
      }, 3000);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return <AnimatedSplash />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="index" />
          <Stack.Screen name="(customer)" />
          <Stack.Screen name="(professional)" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}