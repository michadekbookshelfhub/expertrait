import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function WorkersScreen() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/partner/${user?.id}/handlers`);
      const data = await response.json();
      setWorkers(data.handlers || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWorkers();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0EA5E9" />
        <Text style={styles.loadingText}>Loading workers...</Text>
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
        <Text style={styles.headerTitle}>Healthcare Workers</Text>
        <Text style={styles.headerSubtitle}>
          {workers.length} worker{workers.length !== 1 ? 's' : ''} assigned
        </Text>
      </View>

      {workers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Workers Assigned</Text>
          <Text style={styles.emptyText}>
            Contact admin to assign healthcare workers to your organization
          </Text>
        </View>
      ) : (
        <View style={styles.workersList}>
          {workers.map((worker) => (
            <View key={worker.id} style={styles.workerCard}>
              <View style={styles.workerHeader}>
                <View style={styles.workerAvatar}>
                  <Ionicons name="person" size={24} color="#0EA5E9" />
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{worker.name || 'Healthcare Worker'}</Text>
                  <Text style={styles.workerEmail}>{worker.email}</Text>
                </View>
                <View style={[styles.statusBadge, worker.available && styles.statusBadgeActive]}>
                  <View style={[styles.statusDot, worker.available && styles.statusDotActive]} />
                  <Text style={[styles.statusText, worker.available && styles.statusTextActive]}>
                    {worker.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>

              <View style={styles.workerDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="call" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{worker.phone || 'N/A'}</Text>
                </View>
                {worker.skills && worker.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Ionicons name="briefcase" size={16} color="#6B7280" />
                    <View style={styles.skillsWrapper}>
                      {worker.skills.map((skill: string, index: number) => (
                        <View key={index} style={styles.skillChip}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{worker.total_bookings || 0}</Text>
                  <Text style={styles.statLabel}>Total Jobs</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{worker.completed_bookings || 0}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{worker.rating?.toFixed(1) || '5.0'}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  workersList: {
    padding: 16,
  },
  workerCard: {
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
  workerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  workerEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  statusBadgeActive: {
    backgroundColor: '#D1FAE5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  statusTextActive: {
    color: '#059669',
  },
  workerDetails: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  skillsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  skillsWrapper: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  skillChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  skillText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});