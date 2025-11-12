import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Service {
  id: string;
  name: string;
  fixed_price: number;
  image_base64?: string;
  category: string;
}

interface CategoryHighlightProps {
  category: string;
  services: Service[];
}

export default function CategoryHighlight({ category, services }: CategoryHighlightProps) {
  const router = useRouter();

  const handleServicePress = (service: Service) => {
    router.push({
      pathname: '/(customer)/service-detail',
      params: { serviceId: service.id },
    });
  };

  // Split into rows of services
  const renderRow = (rowServices: Service[], rowIndex: number) => (
    <ScrollView
      key={rowIndex}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
    >
      {rowServices.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={styles.serviceCard}
          onPress={() => handleServicePress(service)}
        >
          <View style={styles.imageContainer}>
            {service.image_base64 ? (
              <Image
                source={{ uri: service.image_base64 }}
                style={styles.serviceImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image" size={40} color="#CCC" />
              </View>
            )}
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>${service.fixed_price}</Text>
            </View>
          </View>
          <Text style={styles.serviceName} numberOfLines={2}>
            {service.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Create 2 rows
  const firstRow = services.slice(0, Math.ceil(services.length / 2));
  const secondRow = services.slice(Math.ceil(services.length / 2));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>FEATURED</Text>
          <Text style={styles.title}>{category} Services</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: '/(customer)/category-services',
              params: { category },
            })
          }
        >
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {firstRow.length > 0 && renderRow(firstRow, 0)}
      {secondRow.length > 0 && renderRow(secondRow, 1)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  badge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B00',
    backgroundColor: '#FF6B0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
  },
  row: {
    paddingLeft: 16,
    marginBottom: 12,
  },
  serviceCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceName: {
    padding: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    minHeight: 50,
  },
});