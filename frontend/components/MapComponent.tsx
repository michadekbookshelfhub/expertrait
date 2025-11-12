import React from 'react';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapComponentProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  pinColor?: string;
}

// Web fallback components
const WebMapView: React.FC<MapComponentProps> = ({ children, style, ...props }) => (
  <View style={[style, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
    <Ionicons name="map-outline" size={60} color="#999" />
    <Text style={{ color: '#999', marginTop: 8, textAlign: 'center' }}>
      Map not available on web
    </Text>
    {children}
  </View>
);

const WebMarker: React.FC<MarkerProps> = ({ children, ...props }) => <View>{children}</View>;

// Dynamic imports for native platforms
let NativeMapView: any;
let NativeMarker: any;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    NativeMapView = maps.default;
    NativeMarker = maps.Marker;
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

export const MapView: React.FC<MapComponentProps> = (props) => {
  if (Platform.OS === 'web' || !NativeMapView) {
    return <WebMapView {...props} />;
  }
  return <NativeMapView {...props} />;
};

export const Marker: React.FC<MarkerProps> = (props) => {
  if (Platform.OS === 'web' || !NativeMarker) {
    return <WebMarker {...props} />;
  }
  return <NativeMarker {...props} />;
};