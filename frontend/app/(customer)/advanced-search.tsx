import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  fixed_price: number;
  rating?: number;
  total_reviews?: number;
}

interface Handler {
  id: string;
  name: string;
  rating: number;
  skills: string[];
  available: boolean;
  distance?: number;
}

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Search & Results
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [handlers, setHandlers] = useState<Handler[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'popular'>('relevance');
  
  // Categories
  const [categories, setCategories] = useState<string[]>([]);
  
  // View Mode
  const [viewMode, setViewMode] = useState<'services' | 'handlers'>('services');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [services, searchQuery, selectedCategories, priceRange, minRating, sortBy, viewMode]);

  const loadData = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // Load services
      const servicesResponse = await fetch(`${API_URL}/api/services`);
      const servicesData = await servicesResponse.json();
      setServices(servicesData.services || []);
      
      // Load categories
      const categoriesResponse = await fetch(`${API_URL}/api/services/categories`);
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.categories || []);
      
      // Load handlers
      const handlersResponse = await fetch(`${API_URL}/api/handlers`);
      const handlersData = await handlersResponse.json();
      setHandlers(handlersData.handlers || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...services];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service =>
        selectedCategories.includes(service.category)
      );
    }

    // Price range filter
    filtered = filtered.filter(service => {
      const price = service.fixed_price || service.base_price || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(service =>
        (service.rating || 0) >= minRating
      );
    }

    // Sort
    if (sortBy === 'price_low') {
      filtered.sort((a, b) => (a.fixed_price || a.base_price) - (b.fixed_price || b.base_price));
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => (b.fixed_price || b.base_price) - (a.fixed_price || a.base_price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
    }

    setFilteredServices(filtered);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 200]);
    setMinRating(0);
    setAvailableOnly(false);
    setSortBy('relevance');
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={14}
            color="#F59E0B"
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Services</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={styles.filterButton}>
          <Ionicons name="options" size={24} color="#FF6B00" />
          {(selectedCategories.length > 0 || minRating > 0) && (
            <View style={styles.filterBadge} />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for services..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        <TouchableOpacity
          style={[styles.quickFilterChip, sortBy === 'relevance' && styles.quickFilterChipActive]}
          onPress={() => setSortBy('relevance')}
        >
          <Text style={[styles.quickFilterText, sortBy === 'relevance' && styles.quickFilterTextActive]}>
            Relevance
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickFilterChip, sortBy === 'price_low' && styles.quickFilterChipActive]}
          onPress={() => setSortBy('price_low')}
        >
          <Text style={[styles.quickFilterText, sortBy === 'price_low' && styles.quickFilterTextActive]}>
            Price: Low to High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickFilterChip, sortBy === 'rating' && styles.quickFilterChipActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.quickFilterText, sortBy === 'rating' && styles.quickFilterTextActive]}>
            Top Rated
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickFilterChip, sortBy === 'popular' && styles.quickFilterChipActive]}
          onPress={() => setSortBy('popular')}
        >
          <Text style={[styles.quickFilterText, sortBy === 'popular' && styles.quickFilterTextActive]}>
            Most Popular
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
        </Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'services' && styles.viewButtonActive]}
            onPress={() => setViewMode('services')}
          >
            <Ionicons name="grid" size={18} color={viewMode === 'services' ? '#FF6B00' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'handlers' && styles.viewButtonActive]}
            onPress={() => setViewMode('handlers')}
          >
            <Ionicons name="people" size={18} color={viewMode === 'handlers' ? '#FF6B00' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView style={styles.results}>
        {viewMode === 'services' ? (
          filteredServices.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No services found</Text>
              <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
            </View>
          ) : (
            filteredServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push({
                  pathname: '/(customer)/service-detail',
                  params: { serviceId: service.id }
                })}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription} numberOfLines={2}>
                    {service.description}
                  </Text>
                  <View style={styles.serviceMeta}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{service.category}</Text>
                    </View>
                    {service.rating && service.rating > 0 && (
                      <View style={styles.ratingContainer}>
                        {renderStars(service.rating)}
                        <Text style={styles.reviewCount}>
                          ({service.total_reviews || 0})
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>From</Text>
                  <Text style={styles.price}>£{(service.fixed_price || service.base_price).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          // Handlers view
          handlers.filter(h => 
            searchQuery.trim() === '' || 
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
          ).map((handler) => (
            <TouchableOpacity
              key={handler.id}
              style={styles.handlerCard}
            >
              <View style={styles.handlerAvatar}>
                <Ionicons name="person" size={32} color="#FF6B00" />
              </View>
              <View style={styles.handlerInfo}>
                <Text style={styles.handlerName}>{handler.name}</Text>
                <View style={styles.handlerMeta}>
                  {renderStars(handler.rating)}
                  <Text style={styles.handlerRating}>{handler.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.skillsContainer}>
                  {handler.skills.slice(0, 3).map((skill, index) => (
                    <View key={index} style={styles.skillChip}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.availabilityBadge}>
                <View style={[styles.availabilityDot, handler.available && styles.availabilityDotActive]} />
                <Text style={styles.availabilityText}>
                  {handler.available ? 'Available' : 'Busy'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Categories */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Categories</Text>
                <View style={styles.categoriesGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryFilterChip,
                        selectedCategories.includes(category) && styles.categoryFilterChipActive
                      ]}
                      onPress={() => toggleCategory(category)}
                    >
                      <Text style={[
                        styles.categoryFilterText,
                        selectedCategories.includes(category) && styles.categoryFilterTextActive
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>
                  Price Range: £{priceRange[0]} - £{priceRange[1]}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={200}
                  step={10}
                  value={priceRange[1]}
                  onValueChange={(value) => setPriceRange([priceRange[0], value])}
                  minimumTrackTintColor="#FF6B00"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#FF6B00"
                />
              </View>

              {/* Minimum Rating */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
                <View style={styles.ratingFilters}>
                  {[0, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingFilterChip,
                        minRating === rating && styles.ratingFilterChipActive
                      ]}
                      onPress={() => setMinRating(rating)}
                    >
                      {rating === 0 ? (
                        <Text style={[
                          styles.ratingFilterText,
                          minRating === rating && styles.ratingFilterTextActive
                        ]}>
                          Any
                        </Text>
                      ) : (
                        <>
                          <Ionicons
                            name="star"
                            size={14}
                            color={minRating === rating ? '#FFF' : '#F59E0B'}
                          />
                          <Text style={[
                            styles.ratingFilterText,
                            minRating === rating && styles.ratingFilterTextActive
                          ]}>
                            {rating}+
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  filterButton: {
    padding: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  quickFilters: {
    maxHeight: 50,
  },
  quickFiltersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  quickFilterChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  quickFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: '#FFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewToggle: {
    flexDirection: 'row',
    gap: 4,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FF6B00',
  },
  results: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  priceContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  handlerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  handlerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handlerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  handlerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  handlerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  handlerRating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 11,
    color: '#6B7280',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  availabilityDotActive: {
    backgroundColor: '#10B981',
  },
  availabilityText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryFilterChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryFilterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingFilterChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingFilterTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
