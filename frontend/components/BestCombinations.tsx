import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  name: string;
  fixed_price: number;
}

interface BestCombinationsProps {
  category: string;
  services: Service[];
  onAddToCart: (services: Service[]) => void;
}

export default function BestCombinations({
  category,
  services,
  onAddToCart,
}: BestCombinationsProps) {
  // Create combinations (mock logic - can be enhanced with ML)
  const combinations = [
    {
      id: '1',
      title: 'Complete Home Maintenance',
      services: services.slice(0, 3),
      savings: 15,
    },
    {
      id: '2',
      title: 'Deep Clean Package',
      services: services.slice(1, 4),
      savings: 20,
    },
  ];

  const calculateTotal = (comboServices: Service[]) => {
    return comboServices.reduce((sum, s) => sum + s.fixed_price, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Best for You</Text>
        <Text style={styles.subtitle}>Recommended {category} combinations</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {combinations.map((combo) => (
          <View key={combo.id} style={styles.comboCard}>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save {combo.savings}%</Text>
            </View>
            <Text style={styles.comboTitle}>{combo.title}</Text>
            <View style={styles.servicesList}>
              {combo.services.map((service, index) => (
                <View key={service.id} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                  <Text style={styles.serviceItemText} numberOfLines={1}>
                    {service.name}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.priceContainer}>
              <View>
                <Text style={styles.originalPrice}>
                  ${calculateTotal(combo.services).toFixed(2)}
                </Text>
                <Text style={styles.discountedPrice}>
                  ${(calculateTotal(combo.services) * (1 - combo.savings / 100)).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => onAddToCart(combo.services)}
              >
                <Ionicons name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
  },
  comboCard: {
    width: 280,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  savingsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  savingsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  comboTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  servicesList: {
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceItemText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
});