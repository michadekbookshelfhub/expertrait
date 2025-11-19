import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function ProfessionalLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="profile-pro"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: 'Active Jobs',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      {/* Hide other professional screens from tab bar */}
      <Tabs.Screen
        name="jobs"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="my-skills"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="job-detail"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="service-areas"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="payment-methods"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="availability"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="reviews"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="edit-profile-pro"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="language"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="help-center-pro"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="terms-of-service"
        options={{ href: null }}
      />
    </Tabs>
  );
}