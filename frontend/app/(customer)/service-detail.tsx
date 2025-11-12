import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  fixed_price: number;
  estimated_duration: number;
  requirements?: string[];
  image_base64?: string;
}

export default function ServiceDetail() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      setLoading(true);
      const data = await api.getService(serviceId);
      setService(data);
    } catch (error) {
      console.error('Failed to load service:', error);
      Alert.alert('Error', 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!service) return;
    addToCart({
      id: service.id,
      name: service.name,
      fixed_price: service.fixed_price,
      category: service.category,
    });
  };

  const handleBookNow = async () => {
    if (!service || !user) return;

    setBookingLoading(true);
    try {
      const booking = await api.createBooking({
        service_id: service.id,
        customer_id: user.id,
        scheduled_time: new Date(Date.now() + 3600000).toISOString(),
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        notes: '',
      });

      Alert.alert(
        'Success',
        'Booking created! Redirecting to your bookings...',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(customer)/bookings'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const isInCart = service && cart.some((item) => item.id === service.id);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Service not found</Text>
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
        <Text style={styles.headerTitle}>Service Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {service.image_base64 ? (
          <Image
            source={{ uri: service.image_base64 }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image" size={80} color="#CCC" />
          </View>
        )}

        <View style={styles.detailsContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{service.category}</Text>
          </View>

          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={24} color="#FF6B00" />
              <Text style={styles.infoLabel}>Price</Text>
              <Text style={styles.infoValue}>${service.fixed_price}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={24} color="#FF6B00" />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{service.estimated_duration} min</Text>
            </View>
          </View>

          {service.requirements && service.requirements.length > 0 && (
            <View style={styles.requirementsSection}>
              <Text style={styles.sectionTitle}>What you need:</Text>
              {service.requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.totalPrice}>${service.fixed_price}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.addToCartButton, isInCart && styles.inCartButton]}
            onPress={handleAddToCart}
            disabled={isInCart}
          >
            <Ionicons 
              name={isInCart ? "checkmark" : "cart"} 
              size={20} 
              color={isInCart ? "#4CAF50" : "#FF6B00"} 
            />
            <Text style={[styles.addToCartText, isInCart && styles.inCartText]}>
              {isInCart ? 'In Cart' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookNow}
            disabled={bookingLoading}
          >
            {bookingLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.bookButtonText}>Book Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
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
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 250,
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  categoryBadge: {
    backgroundColor: '#FF6B0020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 24,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  requirementsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#999',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B0020',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  inCartButton: {
    backgroundColor: '#4CAF5020',
    borderColor: '#4CAF50',
  },
  addToCartText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inCartText: {
    color: '#4CAF50',
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
