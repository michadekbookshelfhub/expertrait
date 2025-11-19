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

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people" size={32} color="#2563EB" />
            <Text style={styles.statValue}>{stats?.totalWorkers || 0}</Text>
            <Text style={styles.statLabel}>Healthcare Workers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="calendar" size={32} color="#D97706" />
            <Text style={styles.statValue}>{stats?.totalBookings || 0}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="time" size={32} color="#059669" />
            <Text style={styles.statValue}>{stats?.activeBookings || 0}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#6366F1" />
            <Text style={styles.statValue}>{stats?.completedBookings || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        
        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="people" size={24} color="#2563EB" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Workers</Text>
            <Text style={styles.actionDesc}>Manage your healthcare team</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="calendar" size={24} color="#8B5CF6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Monitor Bookings</Text>
            <Text style={styles.actionDesc}>Track service requests</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="person" size={24} color="#10B981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Organization Profile</Text>
            <Text style={styles.actionDesc}>View and update details</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={32} color="#0EA5E9" />
        <Text style={styles.infoTitle}>Partner Portal</Text>
        <Text style={styles.infoText}>
          Use the navigation tabs below to access workers, bookings, and your profile.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  organizationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  categoryBadge: {
    fontSize: 13,
    color: '#0EA5E9',
    marginTop: 4,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  infoCard: {
    margin: 16,
    marginTop: 24,
    padding: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
});
