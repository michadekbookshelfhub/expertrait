import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface EarningsData {
  total_earnings: number;
  total_jobs: number;
  average_per_job: number;
  month_earnings: number;
  earnings_history: Array<{
    booking_id: string;
    service_name: string;
    amount: number;
    completed_date: string;
  }>;
}

export default function Earnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/handler/${user.id}/wallet`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Transform wallet data to earnings format
        const transformedData = {
          total_earnings: data.wallet_balance || 0,
          total_jobs: data.transactions?.filter((t: any) => t.type === 'credit').length || 0,
          average_per_job: data.transactions?.length > 0 
            ? data.transactions.reduce((sum: number, t: any) => sum + (t.type === 'credit' ? t.amount : 0), 0) / data.transactions.filter((t: any) => t.type === 'credit').length 
            : 0,
          month_earnings: data.wallet_balance || 0,
          earnings_history: data.transactions?.map((t: any) => ({
            booking_id: t.booking_id || t.id,
            service_name: t.description,
            amount: t.amount,
            completed_date: t.created_at
          })) || []
        };
        setEarnings(transformedData);
      }
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!earnings) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
        <Text style={styles.headerSubtitle}>Track your income</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadEarnings} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="wallet" size={32} color="#FF6B00" />
            <Text style={styles.statValue}>
              ${earnings.total_earnings.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="briefcase" size={32} color="#4CAF50" />
            <Text style={styles.statValue}>{earnings.total_jobs}</Text>
            <Text style={styles.statLabel}>Completed Jobs</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={32} color="#2196F3" />
            <Text style={styles.statValue}>
              ${earnings.average_per_job.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Avg per Job</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar" size={32} color="#9C27B0" />
            <Text style={styles.statValue}>
              ${earnings.month_earnings.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {earnings.earnings_history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            earnings.earnings_history.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionService}>
                    {transaction.service_name}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.completed_date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.transactionAmount}>
                  +${transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
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
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
