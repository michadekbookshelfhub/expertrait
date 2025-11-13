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
import { api } from '../../services/api';

export default function Checkout() {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      // Create bookings for all services in cart
      const bookingPromises = cart.map(service =>
        api.createBooking({
          service_id: service.id,
          customer_id: user?.id,
          scheduled_time: new Date(Date.now() + 3600000).toISOString(),
          location: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
          notes: '',
        })
      );

      await Promise.all(bookingPromises);

      Alert.alert(
        'Success!',
        `Successfully booked ${cart.length} service${cart.length > 1 ? 's' : ''}!`,
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
        <Text style={styles.headerTitle}>Cart ({cart.length})</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.cartItems}>
          {cart.map((item, index) => (
            <View key={`${item.id}-${index}`} style={styles.cartItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemPrice}>${item.fixed_price}</Text>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal ({cart.length} items)</Text>
            <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Fee</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${getCartTotal().toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle" size={24} color="#FF6B00" />
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Booking Note</Text>
            <Text style={styles.noteText}>
              All services will be scheduled for review. You'll be contacted to confirm timing and details.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Total Amount</Text>
          <Text style={styles.footerPrice}>${getCartTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.checkoutText}>Book Now</Text>
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
  clearButton: {
    padding: 8,
  },
  clearText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItems: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FF6B0010',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B0030',
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: '#999',
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  checkoutButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
