import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl?: string;
  onPress?: () => void;
}

export default function PromoBanner({
  title = 'Special Offer!',
  subtitle = 'Get 20% off on your first booking',
  buttonText = 'Book Now',
  imageUrl,
  onPress,
}: PromoBannerProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(customer)/checkout');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        {/* Background Image or Gradient */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.gradientFallback}>
              <Ionicons name="gift" size={60} color="#FFF" opacity={0.3} />
            </View>
          )}
        </View>

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handlePress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
            <Ionicons name="arrow-forward" size={20} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
