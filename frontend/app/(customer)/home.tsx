import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { api } from '../../services/api';
import { useRouter } from 'expo-router';
import PromoBanner from '../../components/PromoBanner';
import CategoryIcons from '../../components/CategoryIcons';
import CategoryHighlight from '../../components/CategoryHighlight';
import CustomServiceHighlight from '../../components/CustomServiceHighlight';
import BestCombinations from '../../components/BestCombinations';
import PopularCombinations from '../../components/PopularCombinations';

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  fixed_price: number;
  estimated_duration: number;
  image_base64?: string;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [featuredCategory, setFeaturedCategory] = useState<string>('');
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, servicesData] = await Promise.all([
        api.getCategories(),
        api.getServices(),
      ]);
      setCategories(categoriesData.categories);
      setServices(servicesData);

      // Select a random featured category
      if (categoriesData.categories.length > 0) {
        const randomCategory = categoriesData.categories[
          Math.floor(Math.random() * categoriesData.categories.length)
        ];
        setFeaturedCategory(randomCategory);
        
        // Get services for featured category
        const categoryServices = servicesData.filter(
          (s: Service) => s.category === randomCategory
        );
        setFeaturedServices(categoryServices.slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    router.push({
      pathname: '/(customer)/advanced-search',
      params: { query: searchQuery }
    });
  };

  const handleSearchFocus = () => {
    router.push('/(customer)/advanced-search');
  };

  const handleAddMultipleToCart = (servicesToAdd: Service[]) => {
    servicesToAdd.forEach((service) => {
      addToCart({
        id: service.id,
        name: service.name,
        fixed_price: service.fixed_price,
        category: service.category,
      });
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hi, {user?.name}!</Text>
          <Text style={styles.headerSubtitle}>What do you need today?</Text>
        </View>
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => router.push('/(customer)/enhanced-checkout')}
        >
          <Ionicons name="cart" size={24} color="#FF6B00" />
          {getCartCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={handleSearchFocus}
        activeOpacity={0.8}
      >
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <Text style={styles.searchPlaceholder}>Search services...</Text>
        <TouchableOpacity
          style={styles.advancedSearchButton}
          onPress={() => router.push('/(customer)/advanced-search')}
        >
          <Ionicons name="options" size={20} color="#FF6B00" />
        </TouchableOpacity>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Promo Banner */}
        <PromoBanner
          title="Limited Time Offer!"
          subtitle="Get 20% off on your first booking"
          buttonText="Book Now"
        />

        {/* Category Icons */}
        <CategoryIcons categories={categories} />

        {/* Featured Category */}
        {featuredCategory && featuredServices.length > 0 && (
          <CategoryHighlight 
            category={featuredCategory}
            services={featuredServices}
          />
        )}

        {/* Custom Service Highlight */}
        <CustomServiceHighlight />

        {/* Best Combinations */}
        {services.length > 0 && (
          <BestCombinations
            category={featuredCategory}
            services={services.slice(0, 4)}
            onAddToCart={handleAddMultipleToCart}
          />
        )}

        {/* Popular Combinations */}
        {services.length > 0 && (
          <PopularCombinations
            services={services.slice(0, 4)}
            onAddToCart={handleAddMultipleToCart}
          />
        )}

        {/* Browse All Services Button */}
        <View style={styles.browseAllContainer}>
          <TouchableOpacity
            style={styles.browseAllButton}
            onPress={() => router.push('/(customer)/advanced-search')}
          >
            <Ionicons name="search" size={24} color="#FFF" />
            <Text style={styles.browseAllText}>Browse All Services</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchPlaceholder: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#999',
  },
  advancedSearchButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacer: {
    height: 32,
  },
  browseAllContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  browseAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  browseAllText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
