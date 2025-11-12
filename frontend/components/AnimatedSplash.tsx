import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import Svg, { Circle, Path, Rect, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplash() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Create multiple animated values for doodles
  const doodle1 = useRef(new Animated.Value(0)).current;
  const doodle2 = useRef(new Animated.Value(0)).current;
  const doodle3 = useRef(new Animated.Value(0)).current;
  const doodle4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Animate doodles with staggered timing
    Animated.stagger(200, [
      Animated.loop(
        Animated.sequence([
          Animated.timing(doodle1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(doodle1, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(doodle2, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(doodle2, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(doodle3, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(doodle3, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(doodle4, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(doodle4, {
            toValue: 0,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Doodles Background */}
      <View style={styles.doodlesContainer}>
        <Animated.View
          style={[
            styles.doodle,
            {
              top: '10%',
              left: '10%',
              opacity: doodle1,
              transform: [
                {
                  translateY: doodle1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="60" height="60" viewBox="0 0 60 60">
            <Path
              d="M30 10 L50 30 L30 50 L10 30 Z"
              stroke="#FF6B00"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <Circle cx="30" cy="30" r="5" fill="#FF6B00" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.doodle,
            {
              top: '20%',
              right: '15%',
              opacity: doodle2,
              transform: [
                {
                  rotate: doodle2.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Rect
              x="5"
              y="5"
              width="40"
              height="40"
              stroke="#FFA500"
              strokeWidth="2.5"
              fill="none"
              rx="5"
            />
            <Path
              d="M15 25 L25 35 L40 15"
              stroke="#FFA500"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.doodle,
            {
              bottom: '25%',
              left: '15%',
              opacity: doodle3,
              transform: [
                {
                  scale: doodle3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.3],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="55" height="55" viewBox="0 0 55 55">
            <Circle cx="27.5" cy="27.5" r="20" stroke="#FF8C00" strokeWidth="3" fill="none" />
            <Path
              d="M27.5 10 L27.5 27.5 L40 35"
              stroke="#FF8C00"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.doodle,
            {
              bottom: '15%',
              right: '10%',
              opacity: doodle4,
              transform: [
                {
                  translateX: doodle4.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 15],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width="65" height="65" viewBox="0 0 65 65">
            <Path
              d="M32.5 5 L50 25 L32.5 25 L32.5 60"
              stroke="#FF6B00"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Ellipse cx="32.5" cy="45" rx="8" ry="5" fill="#FF6B00" opacity="0.5" />
          </Svg>
        </Animated.View>

        {/* Additional decorative doodles */}
        <Animated.View
          style={[
            styles.doodle,
            {
              top: '60%',
              left: '8%',
              opacity: doodle1,
            },
          ]}
        >
          <Svg width="45" height="45" viewBox="0 0 45 45">
            <Circle cx="22.5" cy="22.5" r="3" fill="#FFA500" />
            <Circle cx="22.5" cy="22.5" r="10" stroke="#FFA500" strokeWidth="2" fill="none" />
            <Circle cx="22.5" cy="22.5" r="17" stroke="#FFA500" strokeWidth="1.5" fill="none" />
          </Svg>
        </Animated.View>

        <Animated.View
          style={[
            styles.doodle,
            {
              top: '70%',
              right: '20%',
              opacity: doodle3,
            },
          ]}
        >
          <Svg width="50" height="50" viewBox="0 0 50 50">
            <Path
              d="M25 5 L45 25 L25 45 L5 25 Z M15 25 L25 15 L35 25 L25 35 Z"
              stroke="#FF8C00"
              strokeWidth="2.5"
              fill="none"
            />
          </Svg>
        </Animated.View>
      </View>

      {/* Logo and Text Overlay */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require('../assets/images/explogo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Text style={styles.appName}>EXPERTRAIT</Text>
        <Text style={styles.tagline}>Professional Services Platform</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doodlesContainer: {
    position: 'absolute',
    width: width,
    height: height,
  },
  doodle: {
    position: 'absolute',
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B00',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
