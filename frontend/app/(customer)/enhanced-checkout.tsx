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
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EnhancedCheckout() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Booking details
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // 2 hours later
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [bookingType, setBookingType] = useState<'one-off' | 'continuous'>('one-off');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleStartTimeChange = (event: any, time?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (time) {
      setStartTime(time);
      // Automatically set end time to 2 hours after start
      setEndTime(new Date(time.getTime() + 2 * 60 * 60 * 1000));
    }
  };

  const handleEndTimeChange = (event: any, time?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (time) {
      if (time <= startTime) {
        Alert.alert('Invalid Time', 'End time must be after start time');
        return;
      }
      setEndTime(time);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Remove this service from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' },
      ]
    );
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add services to your cart first');
      return;
    }

    if (!termsAgreed) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    // Validate time range
    if (endTime <= startTime) {
      Alert.alert('Invalid Time Range', 'End time must be after start time');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        service_ids: cart.map(item => item.id),
        customer_id: user?.id,
        scheduled_date: selectedDate.toISOString().split('T')[0], // YYYY-MM-DD
        time_range_start: formatTime(startTime),
        time_range_end: formatTime(endTime),
        location: {
          latitude: 37.7749, // TODO: Get actual location
          longitude: -122.4194,
        },
        notes: '',
        booking_type: bookingType,
        terms_agreed: termsAgreed,
      };

      const result = await api.createBulkBooking(bookingData);

      Alert.alert(
        'Success!',
        `Created ${result.total_bookings} booking${result.total_bookings > 1 ? 's' : ''} grouped by category`,
        [
          {
            text: 'View Bookings',
            onPress: () => {
              clearCart();
              router.push('/(customer)/bookings');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create bookings');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add services to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(customer)/home')}
          >
            <Text style={styles.shopButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services ({cart.length})</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>${item.fixed_price.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={20} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#FF6B00" />
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Time Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Range</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#FF6B00" />
                <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="default"
                  onChange={handleStartTimeChange}
                />
              )}
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#FF6B00" />
                <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={handleEndTimeChange}
                />
              )}
            </View>
          </View>
        </View>

        {/* Booking Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Type</Text>
          <View style={styles.bookingTypeContainer}>
            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'one-off' && styles.bookingTypeButtonActive,
              ]}
              onPress={() => setBookingType('one-off')}
            >
              <Ionicons
                name="flash-outline"
                size={24}
                color={bookingType === 'one-off' ? '#FFF' : '#FF6B00'}
              />
              <Text
                style={[
                  styles.bookingTypeText,
                  bookingType === 'one-off' && styles.bookingTypeTextActive,
                ]}
              >
                One-Off
              </Text>
              <Text
                style={[
                  styles.bookingTypeDesc,
                  bookingType === 'one-off' && styles.bookingTypeDescActive,
                ]}
              >
                Single service
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.bookingTypeButton,
                bookingType === 'continuous' && styles.bookingTypeButtonActive,
              ]}
              onPress={() => setBookingType('continuous')}
            >
              <Ionicons
                name="repeat-outline"
                size={24}
                color={bookingType === 'continuous' ? '#FFF' : '#FF6B00'}
              />
              <Text
                style={[
                  styles.bookingTypeText,
                  bookingType === 'continuous' && styles.bookingTypeTextActive,
                ]}
              >
                Continuous
              </Text>
              <Text
                style={[
                  styles.bookingTypeDesc,
                  bookingType === 'continuous' && styles.bookingTypeDescActive,
                ]}
              >
                Recurring service
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms and Conditions */}
        <View style={styles.section}>
          <View style={styles.termsContainer}>
            <Switch
              value={termsAgreed}
              onValueChange={setTermsAgreed}
              trackColor={{ false: '#CCC', true: '#FF6B00' }}
              thumbColor={termsAgreed ? '#FFF' : '#F4F3F4'}
            />
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms and Conditions</Text> and understand the{' '}
                <Text style={styles.termsLink}>Cancellation Policy</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${getCartTotal().toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, (!termsAgreed || loading) && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={!termsAgreed || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>Complete Booking</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </>
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
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  removeButton: {
    padding: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingTypeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  bookingTypeButtonActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  bookingTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  bookingTypeTextActive: {
    color: '#FFF',
  },
  bookingTypeDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bookingTypeDescActive: {
    color: '#FFF',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF6B00',
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginTop: 12,
    padding: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6B00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#CCC',
  },
  checkoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
