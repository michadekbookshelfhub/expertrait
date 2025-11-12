import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to ExperTrait',
    description: 'Your trusted platform for connecting with professional service providers',
    icon: 'home',
    color: '#FF6B00',
  },
  {
    id: '2',
    title: 'Browse Services',
    description: 'Explore 150+ professional services across 10+ categories at fixed prices',
    icon: 'search',
    color: '#FFA500',
  },
  {
    id: '3',
    title: 'Book Instantly',
    description: 'Schedule services with just a few taps and track professionals in real-time',
    icon: 'calendar',
    color: '#FF8C00',
  },
  {
    id: '4',
    title: 'Secure Payments',
    description: 'Pay safely with our integrated payment system and rate your experience',
    icon: 'card',
    color: '#FF6B00',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    try {
      await AsyncStorage.setItem('@onboarding_complete', 'true');
      router.replace('/');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleSkip = async () => {
    await handleFinish();
  };

  const renderDoodle = (index: number) => {
    const doodles = [
      // Wrench
      <Svg key="doodle1" width="100" height="100" viewBox="0 0 100 100">
        <Path
          d="M20 80 L40 60 L50 70 L30 90 Z M50 70 L70 50 L80 60 L60 80 Z"
          fill="#FF6B0030"
          stroke="#FF6B00"
          strokeWidth="2"
        />
        <Circle cx="75" cy="45" r="8" fill="#FF6B00" />
      </Svg>,
      // Search magnifying glass
      <Svg key="doodle2" width="100" height="100" viewBox="0 0 100 100">
        <Circle
          cx="40"
          cy="40"
          r="25"
          fill="none"
          stroke="#FFA500"
          strokeWidth="3"
        />
        <Path
          d="M58 58 L80 80"
          stroke="#FFA500"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <Circle cx="35" cy="35" r="5" fill="#FFA50050" />
      </Svg>,
      // Calendar
      <Svg key="doodle3" width="100" height="100" viewBox="0 0 100 100">
        <Rect
          x="20"
          y="30"
          width="60"
          height="50"
          rx="5"
          fill="none"
          stroke="#FF8C00"
          strokeWidth="3"
        />
        <Path d="M20 40 L80 40" stroke="#FF8C00" strokeWidth="3" />
        <Path d="M35 25 L35 35" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" />
        <Path d="M65 25 L65 35" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" />
        <Circle cx="40" cy="55" r="3" fill="#FF8C00" />
        <Circle cx="60" cy="55" r="3" fill="#FF8C00" />
        <Circle cx="40" cy="68" r="3" fill="#FF8C00" />
        <Circle cx="60" cy="68" r="3" fill="#FF8C00" />
      </Svg>,
      // Credit card
      <Svg key="doodle4" width="100" height="100" viewBox="0 0 100 100">
        <Rect
          x="15"
          y="35"
          width="70"
          height="40"
          rx="5"
          fill="none"
          stroke="#FF6B00"
          strokeWidth="3"
        />
        <Path d="M15 48 L85 48" stroke="#FF6B00" strokeWidth="5" />
        <Rect x="25" y="58" width="15" height="8" rx="2" fill="#FF6B00" />
        <Path d="M50 62 L75 62" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
      </Svg>,
    ];
    return doodles[index];
  };

  const renderItem = ({ item, index }: any) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        {renderDoodle(index)}
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon as any} size={60} color="#FFF" />
        </View>
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Logo at top */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/explogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Skip button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={32}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Pagination dots */}
      <Paginator />

      {/* Next/Get Started button */}
      <TouchableOpacity style={styles.button} onPress={scrollTo}>
        <Text style={styles.buttonText}>
          {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 60,
    height: 60,
  },
  skipButton: {
    position: 'absolute',
    top: 70,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  paginatorContainer: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B00',
    marginHorizontal: 4,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B00',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 60,
    alignItems: 'center',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
