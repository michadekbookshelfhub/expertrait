import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../services/notificationService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: 'customer' | 'professional' | 'partner';
  address?: string;
  skills?: string[];
  rating?: number;
  available?: boolean;
  // Partner-specific fields
  organization_name?: string;
  representative_full_name?: string;
  healthcare_category?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  partnerLogin: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  partnerRegister: (partnerData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    setUser(data.user);
    await AsyncStorage.setItem('@user', JSON.stringify(data.user));
    
    // Register for push notifications after successful login
    try {
      await notificationService.savePushTokenToBackend(
        data.user.id,
        data.user.user_type === 'handler' ? 'professional' : data.user.user_type
      );
    } catch (error) {
      console.log('Failed to register push notifications:', error);
      // Don't throw error, as login was successful
    }
  };

  const partnerLogin = async (email: string, password: string) => {
    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await fetch(`${API_URL}/api/partner/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const data = await response.json();
    // Transform partner data to match User interface
    const partnerUser = {
      id: data.id,
      name: data.representative_full_name,
      email: data.email,
      phone: data.company_phone,
      user_type: 'partner' as const,
      organization_name: data.organization_name,
      representative_full_name: data.representative_full_name,
      healthcare_category: data.healthcare_category,
      status: data.status
    };
    setUser(partnerUser);
    await AsyncStorage.setItem('@user', JSON.stringify(partnerUser));
  };

  const register = async (userData: any) => {
    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    const data = await response.json();
    setUser(data);
    await AsyncStorage.setItem('@user', JSON.stringify(data));
  };

  const partnerRegister = async (partnerData: any) => {
    const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
    const response = await fetch(`${API_URL}/api/partner/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Partner registration failed');
    }

    const data = await response.json();
    // Note: Partner will need approval, so we don't auto-login
    // Return success message instead
    throw new Error('Registration successful! Your account is pending approval. You will receive an email once approved.');
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, partnerLogin, register, partnerRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};