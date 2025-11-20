import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

interface CartItem {
  id: string;
  name: string;
  fixed_price: number;
  category: string;
}

interface BookingPreferences {
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  address: string;
  notes: string;
}

interface CartContextType {
  cart: CartItem[];
  bookingPreferences: BookingPreferences;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  setBookingPreferences: (preferences: Partial<BookingPreferences>) => void;
  hasBookingPreferences: () => boolean;
  clearBookingPreferences: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bookingPreferences, setBookingPreferencesState] = useState<BookingPreferences>({
    date: null,
    startTime: null,
    endTime: null,
    address: '',
    notes: '',
  });

  const addToCart = (item: CartItem) => {
    // Check if item already in cart
    const exists = cart.find((i) => i.id === item.id);
    if (exists) {
      Alert.alert('Already in Cart', `${item.name} is already in your cart`);
      return;
    }
    
    setCart([...cart, item]);
    Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.fixed_price, 0);
  };

  const getCartCount = () => {
    return cart.length;
  };

  const setBookingPreferences = (preferences: Partial<BookingPreferences>) => {
    setBookingPreferencesState(prev => ({
      ...prev,
      ...preferences,
    }));
  };

  const hasBookingPreferences = () => {
    return !!(
      bookingPreferences.date &&
      bookingPreferences.startTime &&
      bookingPreferences.address &&
      bookingPreferences.address.trim().length > 0
    );
  };

  const clearBookingPreferences = () => {
    setBookingPreferencesState({
      date: null,
      startTime: null,
      endTime: null,
      address: '',
      notes: '',
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        bookingPreferences,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
        setBookingPreferences,
        hasBookingPreferences,
        clearBookingPreferences,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
