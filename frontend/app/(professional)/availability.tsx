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
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Availability() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/handler/${user?.id}/availability`);

      if (response.ok) {
        const data = await response.json();
        const availMap: any = {};
        data.availability_slots?.forEach((slot: any) => {
          availMap[slot.date] = slot.available;
        });
        setSelectedDates(availMap);
      }
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNext30Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const toggleDate = (dateStr: string) => {
    setSelectedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const availability_slots = Object.keys(selectedDates)
        .filter(date => selectedDates[date])
        .map(date => ({
          date,
          available: true,
          time_slots: []
        }));

      const response = await fetch(`${API_URL}/api/handler/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handler_id: user?.id,
          availability_slots
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Availability updated successfully');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to update availability');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const days = generateNext30Days();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability Calendar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Select dates you're available for the next 30 days
          </Text>
        </View>

        <View style={styles.calendarContainer}>
          {days.map((date, index) => {
            const dateStr = formatDate(date);
            const isSelected = selectedDates[dateStr];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();
            const month = date.toLocaleDateString('en-US', { month: 'short' });

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  isSelected && styles.dateCardSelected
                ]}
                onPress={() => toggleDate(dateStr)}
              >
                <Text style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected
                ]}>{dayName}</Text>
                <Text style={[
                  styles.dayNum,
                  isSelected && styles.dayNumSelected
                ]}>{dayNum}</Text>
                <Text style={[
                  styles.month,
                  isSelected && styles.monthSelected
                ]}>{month}</Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" style={styles.checkmark} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {Object.values(selectedDates).filter(v => v).length} days selected
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Availability</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#2E7D32',
  },
  calendarContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  dateCard: {
    width: '13%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  dateCardSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  dayName: {
    fontSize: 10,
    color: '#999',
  },
  dayNameSelected: {
    color: '#FFF',
  },
  dayNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  dayNumSelected: {
    color: '#FFF',
  },
  month: {
    fontSize: 10,
    color: '#999',
  },
  monthSelected: {
    color: '#FFF',
  },
  checkmark: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});