import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface Booking {
  id: string;
  service_name: string;
  service_price: number;
  status: string;
  scheduled_time: string;
  location: { latitude: number; longitude: number };
  customer_id: string;
  notes?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    loadBookings();
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    if (!user) return;
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/handlers/${user.id}/availability`);
      if (response.ok) {
        const data = await response.json();
        setAvailable(data.available || false);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  const loadBookings = async () => {
    if (!user) return;
    try {
      const [pending, my] = await Promise.all([
        api.getPendingBookings(),
        api.getProfessionalBookings(user.id),
      ]);
      setPendingBookings(pending);
      setMyBookings(my.filter((b: Booking) => b.status !== 'completed' && b.status !== 'cancelled'));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleAcceptBooking = async (bookingId: string) => {
    if (!user) return;
    try {
      await api.updateBooking(bookingId, {
        status: 'accepted',
        professional_id: user.id,
      });
      Alert.alert('Success', 'Booking accepted!');
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept booking');
    }
  };

  const handleStartJob = async (bookingId: string) => {
    try {
      await api.updateBooking(bookingId, {
        status: 'in_progress',
        actual_start: new Date().toISOString(),
      });
      Alert.alert('Success', 'Job started!');
      loadBookings();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start job');
    }
  };

  const handleCompleteJob = async (bookingId: string) => {
    Alert.alert(
      'Complete Job',
      'Mark this job as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await api.updateBooking(bookingId, {
                status: 'completed',
                actual_end: new Date().toISOString(),
              });
              Alert.alert('Success', 'Job completed!');
              loadBookings();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to complete job');
            }
          },
        },
      ]
    );
  };

  const toggleAvailability = async (value: boolean) => {
    if (!user) return;
    setUpdatingAvailability(true);
    try {
      await api.updateAvailability(user.id, value);
      setAvailable(value);
      Alert.alert(
        'Availability Updated', 
        value 
          ? 'You are now available to receive new job requests' 
          : 'You are now unavailable. You won\'t receive new job requests'
      );
    } catch (error) {
      console.error('Failed to update availability:', error);
      Alert.alert('Error', 'Failed to update availability. Please try again.');
      // Revert the toggle if it failed
      setAvailable(!value);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const renderBookingCard = ({ item, isPending }: { item: Booking; isPending?: boolean }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.serviceName}>{item.service_name}</Text>
        <Text style={styles.price}>${item.service_price.toFixed(2)}</Text>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.scheduled_time).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.scheduled_time).toLocaleTimeString()}
          </Text>
        </View>
        {item.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{item.notes}</Text>
          </View>
        )}
      </View>

      {isPending ? (
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptBooking(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept Job</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtons}>
          {item.status === 'accepted' && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartJob(item.id)}
            >
              <Text style={styles.buttonText}>Start Job</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteJob(item.id)}
            >
              <Text style={styles.buttonText}>Complete Job</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hi, {user?.name}!</Text>
          <Text style={styles.headerSubtitle}>Ready to work?</Text>
        </View>
        <View style={styles.availabilityToggle}>
          <Text style={styles.availabilityText}>Available</Text>
          <Switch
            value={available}
            onValueChange={toggleAvailability}
            disabled={updatingAvailability}
            trackColor={{ false: '#CCC', true: '#4CAF5080' }}
            thumbColor={available ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myBookings.length}</Text>
          <Text style={styles.statLabel}>Active Jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{pendingBookings.length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{user?.rating || 5.0}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {myBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Active Jobs</Text>
          <FlatList
            data={myBookings}
            renderItem={({ item }) => renderBookingCard({ item, isPending: false })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bookingsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </View>
      )}

      {pendingBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Jobs</Text>
          <FlatList
            data={pendingBookings}
            renderItem={({ item }) => renderBookingCard({ item, isPending: true })}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.bookingsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </View>
      )}

      {myBookings.length === 0 && pendingBookings.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No jobs available</Text>
          <Text style={styles.emptySubtext}>
            New jobs will appear here when customers book
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 16,
  },
  bookingsList: {
    paddingHorizontal: 16,
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#FF6B00',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});