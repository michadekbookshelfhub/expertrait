import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function PartnerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // Load handlers count
      const handlersResponse = await fetch(`${API_URL}/api/partner/${user?.id}/handlers`);
      const handlersData = await handlersResponse.json();
      
      // Load bookings count
      const bookingsResponse = await fetch(`${API_URL}/api/partner/${user?.id}/bookings`);
      const bookingsData = await bookingsResponse.json();
      
      setStats({
        totalWorkers: handlersData.handlers?.length || 0,
        totalBookings: bookingsData.bookings?.length || 0,
        activeBookings: bookingsData.bookings?.filter((b: any) => b.status === 'in_progress').length || 0,
        completedBookings: bookingsData.bookings?.filter((b: any) => b.status === 'completed').length || 0,
      });
    } catch (error) {
      console.error('Error loading partner data:', error);
      // Set default values on error
      setStats({
        totalWorkers: 0,
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.organizationName}>{user?.organization_name || 'Healthcare Partner'}</Text>
          <Text style={styles.categoryBadge}>{user?.healthcare_category || 'Healthcare Services'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        <Text style={styles.welcomeTitle}>Welcome to ExperTrait Partner Portal</Text>
        <Text style={styles.welcomeText}>
          Your account is currently: <Text style={styles.statusText}>{user?.status || 'Pending Approval'}</Text>
        </Text>
        <Text style={styles.infoText}>
          Full dashboard features will be available once your account is approved by our admin team.
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Coming Soon Features</Text>
        
        <View style={styles.featureCard}>
          <Ionicons name="people" size={32} color="#3B82F6" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Healthcare Workers</Text>
            <Text style={styles.featureDesc}>View and manage your assigned healthcare workers</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="calendar" size={32} color="#8B5CF6" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Bookings Monitor</Text>
            <Text style={styles.featureDesc}>Track all bookings for your workers in real-time</Text>
          </View>
        </View>

        <View style={styles.featureCard}>
          <Ionicons name="stats-chart" size={32} color="#F59E0B" />
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Analytics & Reports</Text>
            <Text style={styles.featureDesc}>View performance metrics and booking statistics</Text>
          </View>
        </View>
      </View>

      <View style={styles.supportCard}>
        <Ionicons name="help-circle" size={32} color="#6B7280" />
        <Text style={styles.supportTitle}>Need Help?</Text>
        <Text style={styles.supportText}>
          Contact our support team if you have any questions about your partner account.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  card: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  infoText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  featureDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  supportCard: {
    margin: 20,
    marginTop: 32,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});
