import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Service {
  id: string;
  name: string;
  fixed_price: number;
}

interface PopularCombinationsProps {
  services: Service[];
  onAddToCart: (services: Service[]) => void;
}

export default function PopularCombinations({
  services,
  onAddToCart,
}: PopularCombinationsProps) {
  // Popular combinations across categories
  const popularPairs = [
    {
      id: '1',
      title: 'Most Popular Combo',
      description: 'What others are booking together',
      services: services.slice(0, 2),
      icon: 'star',
      color: '#FFB800',
    },
    {
      id: '2',
      title: 'Weekend Special',
      description: 'Save time with this combo',
      services: services.slice(2, 4),
      icon: 'calendar',
      color: '#4CAF50',
    },
  ];

  const calculateTotal = (comboServices: Service[]) => {
    return comboServices.reduce((sum, s) => sum + s.fixed_price, 0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Combinations</Text>
        <Text style={styles.subtitle}>What others are choosing</Text>
      </View>

      {popularPairs.map((combo) => (
        <TouchableOpacity
          key={combo.id}
          style={styles.comboCard}
          onPress={() => onAddToCart(combo.services)}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${combo.color}20` }]}>
            <Ionicons name={combo.icon as any} size={32} color={combo.color} />
          </View>
          <View style={styles.comboContent}>
            <Text style={styles.comboTitle}>{combo.title}</Text>
            <Text style={styles.comboDescription}>{combo.description}</Text>
            <View style={styles.servicesList}>
              {combo.services.map((service) => (
                <Text key={service.id} style={styles.serviceText} numberOfLines={1}>
                  • {service.name}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.price}>${calculateTotal(combo.services).toFixed(0)}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
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
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  comboContent: {
    flex: 1,
  },
  comboTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  comboDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  servicesList: {
    gap: 2,
  },
  serviceText: {
    fontSize: 11,
    color: '#666',
  },
  priceSection: {
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
});