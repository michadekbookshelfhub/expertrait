import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategoryIconsProps {
  categories: string[];
}

// Icon mapping for categories (can be updated from admin)
const getCategoryIcon = (category: string): { icon: any; color: string } => {
  const iconMap: { [key: string]: { icon: any; color: string } } = {
    'Cleaning': { icon: 'sparkles', color: '#4CAF50' },
    'Plumbing': { icon: 'water', color: '#2196F3' },
    'Electrical': { icon: 'flash', color: '#FFB800' },
    'HVAC': { icon: 'snow', color: '#00BCD4' },
    'Appliances': { icon: 'construct', color: '#9C27B0' },
    'Handyman': { icon: 'hammer', color: '#FF6B00' },
    'Painting': { icon: 'color-palette', color: '#E91E63' },
    'Landscaping': { icon: 'leaf', color: '#4CAF50' },
    'Pest Control': { icon: 'bug', color: '#F44336' },
    'Locksmith': { icon: 'key', color: '#607D8B' },
  };
  return iconMap[category] || { icon: 'cube', color: '#999' };
};

export default function CategoryIcons({ categories }: CategoryIconsProps) {
  const router = useRouter();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/(customer)/category-services',
      params: { category },
    });
  };

  // Split categories into rows of 5
  const rows = [];
  for (let i = 0; i < categories.length; i += 5) {
    rows.push(categories.slice(i, i + 5));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categories</Text>
      {rows.slice(0, 2).map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((category) => {
            const { icon, color } = getCategoryIcon(category);
            return (
              <TouchableOpacity
                key={category}
                style={styles.categoryItem}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                  <Ionicons name={icon} size={28} color={color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 70,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
});