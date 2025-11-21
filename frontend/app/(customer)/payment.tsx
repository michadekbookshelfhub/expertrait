import React, { useState } from 'react';
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
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

export default function PaymentScreen() {
  const router = useRouter();
  const { cart, getCartTotal, bookingPreferences, clearCart, clearBookingPreferences } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'wallet'>('card');

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not set';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateServiceFee = () => {
    const subtotal = getCartTotal();
    return subtotal * 0.05; // 5% service fee
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateServiceFee();
  };

  const handlePayNow = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to continue');
      return;
    }

    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    if (!bookingPreferences.date || !bookingPreferences.startTime || !bookingPreferences.address) {
      Alert.alert('Missing Details', 'Please complete booking details in cart');
      router.back();
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // Create booking with payment
      const bookingData = {
        customer_id: user.id,
        service_ids: cart.map(item => item.id),
        scheduled_date: bookingPreferences.date.toISOString().split('T')[0],
        scheduled_time: formatTime(bookingPreferences.startTime),
        end_time: bookingPreferences.endTime ? formatTime(bookingPreferences.endTime) : null,
        address: bookingPreferences.address,
        notes: bookingPreferences.notes || '',
        total_price: calculateTotal(),
        payment_method: selectedPaymentMethod,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.phone || '',
      };

      const response = await fetch(`${API_URL}/api/bookings/create-with-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Payment failed');
      }

      const result = await response.json();

      // Clear cart and preferences
      clearCart();
      clearBookingPreferences();

      Alert.alert(
        'Payment Successful! 🎉',
        `Your booking has been confirmed!\n\nBooking ID: ${result.booking_id}\n\nA receipt has been sent to ${user.email}\n\nHandlers will be notified via WhatsApp.`,
        [
          {
            text: 'View Bookings',
            onPress: () => router.push('/(customer)/bookings'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error.message || 'Unable to process payment. Please try again.',
        [
          { text: 'Try Again' },
          { text: 'Cancel', style: 'cancel', onPress: () => router.back() },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{formatDate(bookingPreferences.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {formatTime(bookingPreferences.startTime)} - {formatTime(bookingPreferences.endTime)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {bookingPreferences.address}
            </Text>
          </View>

          {bookingPreferences.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Notes:</Text>
              <Text style={styles.infoValue}>{bookingPreferences.notes}</Text>
            </View>
          )}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services ({cart.length})</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.serviceCategory}>{item.category}</Text>
              </View>
              <Text style={styles.servicePrice}>£{item.fixed_price.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === 'card' && styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="card-outline" size={24} color="#FF6B00" />
              <View>
                <Text style={styles.paymentMethodTitle}>Credit/Debit Card</Text>
                <Text style={styles.paymentMethodSubtitle}>Visa, Mastercard, Amex</Text>
              </View>
            </View>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'card' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === 'wallet' && styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod('wallet')}
          >
            <View style={styles.paymentMethodLeft}>
              <Ionicons name="wallet-outline" size={24} color="#FF6B00" />
              <View>
                <Text style={styles.paymentMethodTitle}>Digital Wallet</Text>
                <Text style={styles.paymentMethodSubtitle}>Apple Pay, Google Pay</Text>
              </View>
            </View>
            <View style={styles.radioButton}>
              {selectedPaymentMethod === 'wallet' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>£{getCartTotal().toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee (5%)</Text>
            <Text style={styles.priceValue}>£{calculateServiceFee().toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>£{calculateTotal().toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={handlePayNow}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#FFF" />
              <Text style={styles.payButtonText}>Pay £{calculateTotal().toFixed(2)}</Text>
            </>
          )}
        </TouchableOpacity>
        <Text style={styles.secureText}>
          <Ionicons name="shield-checkmark" size={14} color="#10B981" />
          {' '}Secure payment powered by Stripe
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: '#FF6B00',
    backgroundColor: '#FFF7ED',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B00',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  bottomSpacer: {
    height: 20,
  },
  bottomContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});
