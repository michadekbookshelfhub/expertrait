import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  fixed_price: number;
  estimated_duration: number;
  image_url?: string;
}

export default function Search() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  
  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('name');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, priceRange, sortBy, services]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData] = await Promise.all([
        api.getServices(),
        api.getCategories(),
      ]);
      setServices(servicesData);
      setCategories(['All', ...categoriesData.categories]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    // Price range filter
    if (priceRange !== 'All') {
      if (priceRange === 'Under $50') {
        filtered = filtered.filter((s) => s.fixed_price < 50);
      } else if (priceRange === '$50-$100') {
        filtered = filtered.filter((s) => s.fixed_price >= 50 && s.fixed_price <= 100);
      } else if (priceRange === '$100-$200') {
        filtered = filtered.filter((s) => s.fixed_price > 100 && s.fixed_price <= 200);
      } else if (priceRange === 'Over $200') {
        filtered = filtered.filter((s) => s.fixed_price > 200);
      }
    }

    // Sort
    if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.fixed_price - b.fixed_price);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.fixed_price - a.fixed_price);
    } else if (sortBy === 'duration') {
      filtered.sort((a, b) => a.estimated_duration - b.estimated_duration);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredServices(filtered);
  };

  const handleServicePress = (service: Service) => {
    router.push({
      pathname: '/(customer)/service-detail',
      params: { serviceId: service.id },
    });
  };

  const handleAddToCart = (service: Service) => {
    addToCart({
      id: service.id,
      name: service.name,
      fixed_price: service.fixed_price,
      category: service.category,
    });
  };

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.serviceCategory}>{item.category}</Text>
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.serviceMeta}>
            <Ionicons name="time-outline" size={14} color="#999" />
            <Text style={styles.metaText}>{item.estimated_duration} min</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.fixed_price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Services</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={!params.query}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {/* Category Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  selectedCategory === cat && styles.filterChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === cat && styles.filterChipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Range Filter */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Price:</Text>
          {['All', 'Under $50', '$50-$100', '$100-$200', 'Over $200'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.filterChip,
                priceRange === range && styles.filterChipActive,
              ]}
              onPress={() => setPriceRange(range)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  priceRange === range && styles.filterChipTextActive,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sort By */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Sort:</Text>
          {[
            { value: 'name', label: 'Name' },
            { value: 'price_low', label: 'Price: Low-High' },
            { value: 'price_high', label: 'Price: High-Low' },
            { value: 'duration', label: 'Duration' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.value}
              style={[
                styles.filterChip,
                sortBy === sort.value && styles.filterChipActive,
              ]}
              onPress={() => setSortBy(sort.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  sortBy === sort.value && styles.filterChipTextActive,
                ]}
              >
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredServices.length} service{filteredServices.length !== 1 && 's'} found
        </Text>
      </View>

      {filteredServices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No services found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
        />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    maxHeight: 120,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  filterGroup: {
    marginRight: 16,
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  resultsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
  },
  servicesList: {
    padding: 16,
    paddingTop: 8,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 12,
    color: '#FF6B00',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
