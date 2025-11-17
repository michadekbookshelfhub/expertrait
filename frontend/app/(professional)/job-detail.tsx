import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Job {
  id: string;
  service_name: string;
  service_price: number;
  status: string;
  scheduled_date?: string;
  time_range_start?: string;
  time_range_end?: string;
  location?: any;
  check_in_time?: string;
  check_out_time?: string;
  customer_id: string;
  notes?: string;
}

export default function JobDetail() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      }
    } catch (error) {
      console.error('Failed to load job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);

      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to check in');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});

      const response = await fetch(`${API_URL}/api/handler/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: jobId,
          handler_id: user?.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Check-in successful!');
        loadJobDetails();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Check-in failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to check in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as complete? Payment will be added to your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setActionLoading(true);

              // Get current location
              const location = await Location.getCurrentPositionAsync({});

              const response = await fetch(`${API_URL}/api/handler/check-out`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  booking_id: jobId,
                  handler_id: user?.id,
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  completion_notes: 'Job completed successfully',
                }),
              });

              if (response.ok) {
                const data = await response.json();
                Alert.alert(
                  'Job Completed!',
                  `Payment of $${data.payment_added.toFixed(2)} has been added to your wallet.\nNew balance: $${data.new_wallet_balance.toFixed(2)}`
                );
                router.back();
              } else {
                const error = await response.json();
                Alert.alert('Error', error.detail || 'Check-out failed');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to check out');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B00" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Job not found</Text>
      </SafeAreaView>
    );
  }

  const canCheckIn = job.status === 'accepted' && !job.check_in_time;
  const canCheckOut = job.status === 'in_progress' && job.check_in_time && !job.check_out_time;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusText}>{job.status.toUpperCase()}</Text>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service</Text>
          <Text style={styles.serviceName}>{job.service_name}</Text>
          <Text style={styles.price}>${job.service_price.toFixed(2)}</Text>
        </View>

        {/* Schedule Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{job.scheduled_date || 'Not scheduled'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {job.time_range_start} - {job.time_range_end}
            </Text>
          </View>
        </View>

        {/* Check-in/Check-out Status */}
        {(job.check_in_time || job.check_out_time) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Tracking</Text>
            {job.check_in_time && (
              <View style={styles.infoRow}>
                <Ionicons name="enter-outline" size={20} color="#4CAF50" />
                <Text style={styles.infoText}>
                  Checked in: {new Date(job.check_in_time).toLocaleString()}
                </Text>
              </View>
            )}
            {job.check_out_time && (
              <View style={styles.infoRow}>
                <Ionicons name="exit-outline" size={20} color="#2196F3" />
                <Text style={styles.infoText}>
                  Checked out: {new Date(job.check_out_time).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {job.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{job.notes}</Text>
          </View>
        )}

        {/* Location */}
        {job.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                {job.location.latitude?.toFixed(4)}, {job.location.longitude?.toFixed(4)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {canCheckIn && (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkInButton]}
            onPress={handleCheckIn}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="enter-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Check In</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {canCheckOut && (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkOutButton]}
            onPress={handleCheckOut}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
                <Text style={styles.actionButtonText}>Complete Job</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {!canCheckIn && !canCheckOut && job.status === 'completed' && (
          <View style={styles.completedBanner}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.completedText}>Job Completed!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  const colors: any = {
    pending: '#FFA500',
    accepted: '#2196F3',
    in_progress: '#9C27B0',
    completed: '#4CAF50',
    cancelled: '#F44336',
  };
  return colors[status] || '#999';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusBadge: {
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#FF6B00',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
});
