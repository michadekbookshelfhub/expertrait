import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export default function Active() {
  const { user } = useAuth();
  const [location, setLocation] = useState<any>(null);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  useEffect(() => {
    loadActiveBooking();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    let subscription: any;
    if (trackingEnabled && user) {
      subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (newLocation) => {
          setLocation(newLocation);
          // Send location to backend
          try {
            await api.updateProfessionalLocation(
              user.id,
              newLocation.coords.latitude,
              newLocation.coords.longitude
            );
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        }
      );
    }

    return () => {
      if (subscription) {
        subscription.then((sub: any) => sub.remove());
      }
    };
  }, [trackingEnabled, user]);

  const requestLocationPermission = async () => {
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert('Error', 'Unable to access location services');
    }
  };

  const loadActiveBooking = async () => {
    if (!user) return;
    try {
      const bookings = await api.getProfessionalBookings(user.id);
      const active = bookings.find(
        (b: any) => b.status === 'in_progress' || b.status === 'accepted'
      );
      setActiveBooking(active);
    } catch (error) {
      console.error('Failed to load active booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTracking = () => {
    setTrackingEnabled(true);
    Alert.alert('Success', 'Location tracking enabled');
  };

  const handleStopTracking = () => {
    setTrackingEnabled(false);
    Alert.alert('Success', 'Location tracking disabled');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Job</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="navigate-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No active job</Text>
          <Text style={styles.emptySubtext}>
            Accept a job to start tracking
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Job</Text>
        <View style={styles.trackingBadge}>
          <View
            style={[
              styles.trackingDot,
              trackingEnabled && styles.trackingDotActive,
            ]}
          />
          <Text style={styles.trackingText}>
            {trackingEnabled ? 'Tracking' : 'Not Tracking'}
          </Text>
        </View>
      </View>

      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{activeBooking.service_name}</Text>
        <Text style={styles.jobPrice}>
          ${activeBooking.service_price.toFixed(2)}
        </Text>
        <View style={styles.jobDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(activeBooking.scheduled_time).toLocaleTimeString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>Customer Location</Text>
          </View>
        </View>
      </View>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
        >
          <Marker
            coordinate={{
              latitude: activeBooking.location.latitude,
              longitude: activeBooking.location.longitude,
            }}
            title="Customer Location"
            pinColor="red"
          />
        </MapView>
      )}

      <View style={styles.controls}>
        {!trackingEnabled ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartTracking}
          >
            <Ionicons name="navigate" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStopTracking}
          >
            <Ionicons name="stop" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        )}
      </View>
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
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginRight: 6,
  },
  trackingDotActive: {
    backgroundColor: '#4CAF50',
  },
  trackingText: {
    fontSize: 12,
    color: '#666',
  },
  jobCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  jobPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  jobDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  map: {
    flex: 1,
  },
  controls: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
