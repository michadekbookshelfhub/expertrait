import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const UK_CITIES = [
  'London',
  'Birmingham',
  'Manchester',
  'Leeds',
  'Liverpool',
  'Newcastle',
  'Sheffield',
  'Bristol',
  'Glasgow',
  'Edinburgh',
  'Cardiff',
  'Belfast',
  'Nottingham',
  'Leicester',
  'Coventry',
  'Bradford',
  'Southampton',
  'Portsmouth',
];

export default function ServiceAreas() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>(user?.service_areas || []);
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState('10');
  const [customAreas, setCustomAreas] = useState<string[]>([]);

  const toggleCity = (city: string) => {
    if (selectedCities.includes(city)) {
      setSelectedCities(prev => prev.filter(c => c !== city));
    } else {
      setSelectedCities(prev => [...prev, city]);
    }
  };

  const addPostcodeArea = () => {
    if (!postcode.trim()) {
      Alert.alert('Error', 'Please enter a postcode');
      return;
    }
    const area = `${postcode.toUpperCase()} (${radius}mi)`;
    if (!customAreas.includes(area)) {
      setCustomAreas(prev => [...prev, area]);
      setPostcode('');
    }
  };

  const removeCustomArea = (area: string) => {
    setCustomAreas(prev => prev.filter(a => a !== area));
  };

  const handleSave = async () => {
    const allAreas = [...selectedCities, ...customAreas];
    
    if (allAreas.length === 0) {
      Alert.alert('Error', 'Please select at least one service area');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_areas: allAreas }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Service areas updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to update service areas');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update service areas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Areas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            Select cities and add postcodes where you provide services
          </Text>
        </View>

        {/* Major Cities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Major Cities</Text>
          <View style={styles.citiesGrid}>
            {UK_CITIES.map((city, index) => {
              const isSelected = selectedCities.includes(city);
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cityCard,
                    isSelected && styles.cityCardSelected
                  ]}
                  onPress={() => toggleCity(city)}
                >
                  <Ionicons
                    name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                    size={20}
                    color={isSelected ? "#4CAF50" : "#CCC"}
                  />
                  <Text style={[
                    styles.cityText,
                    isSelected && styles.cityTextSelected
                  ]}>{city}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Postcode Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add by Postcode</Text>
          <View style={styles.postcodeContainer}>
            <View style={styles.postcodeInputContainer}>
              <TextInput
                style={styles.postcodeInput}
                value={postcode}
                onChangeText={setPostcode}
                placeholder="e.g. SW1A 1AA"
                autoCapitalize="characters"
                maxLength={8}
              />
              <View style={styles.radiusContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <TextInput
                  style={styles.radiusInput}
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.radiusLabel}>miles</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={addPostcodeArea}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {customAreas.length > 0 && (
            <View style={styles.customAreasList}>
              {customAreas.map((area, index) => (
                <View key={index} style={styles.customAreaItem}>
                  <View style={styles.customAreaInfo}>
                    <Ionicons name="location" size={16} color="#4CAF50" />
                    <Text style={styles.customAreaText}>{area}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeCustomArea(area)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#D32F2F" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Coverage Info */}
        <View style={styles.coverageBox}>
          <View style={styles.coverageHeader}>
            <Ionicons name="map-outline" size={24} color="#4CAF50" />
            <Text style={styles.coverageTitle}>Coverage Summary</Text>
          </View>
          <Text style={styles.coverageText}>
            Cities: {selectedCities.length}
          </Text>
          <Text style={styles.coverageText}>
            Custom Areas: {customAreas.length}
          </Text>
          <Text style={styles.coverageTotal}>
            Total Service Areas: {selectedCities.length + customAreas.length}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Service Areas</Text>
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
  section: {
    backgroundColor: '#FFF',
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  citiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  cityCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cityCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cityText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  cityTextSelected: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  postcodeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  postcodeInputContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  postcodeInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  radiusInput: {
    width: 30,
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  radiusLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAreasList: {
    marginTop: 16,
  },
  customAreaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  customAreaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customAreaText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  coverageBox: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coverageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  coverageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  coverageTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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