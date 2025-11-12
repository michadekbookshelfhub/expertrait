import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { useRouter } from 'expo-router';
import PromoBanner from '../../components/PromoBanner';

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  fixed_price: number;
  estimated_duration: number;
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadServices();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      const [categoriesData, servicesData] = await Promise.all([
        api.getCategories(),
        api.getServices(),
      ]);
      setCategories(categoriesData.categories);
      setServices(servicesData);

      // Load recommendations
      if (user) {
        try {
          const recs = await api.getRecommendations(user.id);
          setRecommendations(recs.recommendations || []);
        } catch (error) {
          console.error('Failed to load recommendations:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const data = await api.getServices(selectedCategory || undefined);
      setServices(data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleServicePress = (service: Service) => {
    setSelectedService(service);
    setBookingModalVisible(true);
  };

  const handleBookService = async () => {
    if (!selectedService || !user) return;

    setBookingLoading(true);
    try {
      const booking = await api.createBooking({
        service_id: selectedService.id,
        customer_id: user.id,
        scheduled_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        notes: '',
      });

      Alert.alert(
        'Success',
        'Booking created! Proceeding to payment...',
        [
          {
            text: 'OK',
            onPress: () => {
              setBookingModalVisible(false);
              router.push('/(customer)/bookings');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCategoryButton = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() =>
        setSelectedCategory(selectedCategory === category ? null : category)
      }
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceCard = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => handleServicePress(item)}
    >
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>${item.fixed_price.toFixed(2)}</Text>
      </View>
      <Text style={styles.serviceDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.serviceFooter}>
        <Text style={styles.serviceDuration}>
          <Ionicons name="time-outline" size={14} /> {item.estimated_duration}{' '}
          min
        </Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
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
        <Text style={styles.headerTitle}>Hi, {user?.name}!</Text>
        <Text style={styles.headerSubtitle}>What do you need today?</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Promo Banner */}
      <PromoBanner
        title="Limited Time Offer!"
        subtitle="Get 20% off on your first booking"
        buttonText="Book Now"
      />

      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recommendationsScroll}
          >
            {recommendations.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.recommendationCard}
                onPress={() => handleServicePress(service)}
              >
                <Text style={styles.recommendationName}>{service.name}</Text>
                <Text style={styles.recommendationPrice}>
                  ${service.fixed_price}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory || 'All Services'}
        </Text>
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedService && (
              <>
                <Text style={styles.modalTitle}>{selectedService.name}</Text>
                <Text style={styles.modalDescription}>
                  {selectedService.description}
                </Text>
                <View style={styles.modalDetails}>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="cash-outline" size={20} color="#FF6B00" />
                    <Text style={styles.modalDetailText}>
                      ${selectedService.fixed_price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time-outline" size={20} color="#FF6B00" />
                    <Text style={styles.modalDetailText}>
                      {selectedService.estimated_duration} minutes
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookService}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.bookButtonText}>Book Now</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setBookingModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    margin: 16,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  recommendationsScroll: {
    paddingHorizontal: 16,
  },
  recommendationCard: {
    width: 150,
    padding: 16,
    backgroundColor: '#FF6B0010',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FF6B0030',
  },
  recommendationName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
  recommendationPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  servicesSection: {
    flex: 1,
  },
  servicesList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  serviceCard: {
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#999',
  },
  serviceCategory: {
    fontSize: 12,
    color: '#FF6B00',
    backgroundColor: '#FF6B0010',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalDetailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
  },
});