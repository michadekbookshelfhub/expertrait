import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface CompletedBooking {
  id: string;
  service_name: string;
  service_price: number;
  completed_at: string;
}

export default function Earnings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    if (!user) return;
    try {
      const data = await api.getProfessionalBookings(user.id);
      const completed = data.filter((b: any) => b.status === 'completed');
      setBookings(completed);
      
      const total = completed.reduce(
        (sum: number, booking: any) => sum + booking.service_price,
        0
      );
      setTotalEarnings(total);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEarnings();
  };

  const renderEarningCard = ({ item }: { item: CompletedBooking }) => (
    <View style={styles.earningCard}>
      <View style={styles.earningHeader}>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        <View style={styles.earningInfo}>
          <Text style={styles.serviceName}>{item.service_name}</Text>
          <Text style={styles.date}>
            {new Date(item.completed_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.amount}>+${item.service_price.toFixed(2)}</Text>
      </View>
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
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Earnings</Text>
        <Text style={styles.totalAmount}>${totalEarnings.toFixed(2)}</Text>
        <Text style={styles.totalJobs}>{bookings.length} completed jobs</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#FF6B00" />
          <Text style={styles.statValue}>
            ${(totalEarnings / (bookings.length || 1)).toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Avg per Job</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#FFB800" />
          <Text style={styles.statValue}>{user?.rating || 5.0}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Transaction History</Text>
      </View>

      {bookings.length > 0 ? (
        <FlatList
          data={bookings}
          renderItem={renderEarningCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="wallet-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No earnings yet</Text>
          <Text style={styles.emptySubtext}>
            Complete jobs to start earning
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
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  totalCard: {
    backgroundColor: '#4CAF50',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.9,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 8,
  },
  totalJobs: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
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
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  earningCard: {
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
  earningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
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
