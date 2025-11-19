import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function PartnerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Partner Dashboard</Text>
          <Text style={styles.headerSubtitle}>{user?.organization_name || 'Healthcare Organization'}</Text>
          <Text style={styles.headerEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B00" />
        </TouchableOpacity>
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
