import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Job {
  id: string;
  service_name: string;
  service_price: number;
  customer_name: string;
  status: string;
  scheduled_time: string;
  location: any;
}

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [filter]);

  const loadJobs = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter}`;
      const response = await fetch(
        `${API_URL}/api/professionals/${user.id}/jobs${statusParam}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/professionals/${user?.id}/jobs/${jobId}/status?status=${newStatus}`,
        { method: 'PUT' }
      );
      
      if (response.ok) {
        Alert.alert('Success', 'Job status updated');
        loadJobs();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      in_progress: '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#999';
  };

  const renderJob = (job: Job) => (
    <View key={job.id} style={styles.jobCard}>
      <View style={styles.jobHeader}>
        <View style={styles.jobInfo}>
          <Text style={styles.serviceName}>{job.service_name}</Text>
          <Text style={styles.customerName}>{job.customer_name}</Text>
          <Text style={styles.scheduledTime}>
            {new Date(job.scheduled_time).toLocaleString()}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${job.service_price}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(job.status) },
            ]}
          >
            <Text style={styles.statusText}>{job.status}</Text>
          </View>
        </View>
      </View>

      {job.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => updateJobStatus(job.id, 'confirmed')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateJobStatus(job.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {job.status === 'confirmed' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.startButton]}
          onPress={() => updateJobStatus(job.id, 'in_progress')}
        >
          <Text style={styles.actionButtonText}>Start Job</Text>
        </TouchableOpacity>
      )}

      {job.status === 'in_progress' && (
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => updateJobStatus(job.id, 'completed')}
        >
          <Text style={styles.actionButtonText}>Mark Complete</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <Text style={styles.headerSubtitle}>{jobs.length} jobs</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadJobs} />
        }
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No jobs found</Text>
          </View>
        ) : (
          jobs.map(renderJob)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  filterContainer: {
    padding: 16,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterText: {
    fontSize: 15,
    color: '#333',
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  startButton: {
    backgroundColor: '#9C27B0',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
