import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const discoverItems = [
  {
    id: '1',
    title: 'Top Rated Professionals',
    subtitle: '500+ verified experts',
    icon: 'star',
    color: '#FFB800',
  },
  {
    id: '2',
    title: 'Weekend Specials',
    subtitle: 'Save up to 30%',
    icon: 'pricetag',
    color: '#4CAF50',
  },
  {
    id: '3',
    title: 'Emergency Services',
    subtitle: '24/7 availability',
    icon: 'flash',
    color: '#D32F2F',
  },
  {
    id: '4',
    title: 'Home Packages',
    subtitle: 'Bundle and save',
    icon: 'home',
    color: '#007AFF',
  },
];

const trendingServices = [
  { id: '1', name: 'AC Maintenance', bookings: '1.2k', image: '❄️' },
  { id: '2', name: 'Deep Cleaning', bookings: '980', image: '🧹' },
  { id: '3', name: 'Plumbing Repair', bookings: '856', image: '🔧' },
  { id: '4', name: 'Electrical Work', bookings: '743', image: '⚡' },
];

export default function Discover() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <Text style={styles.headerSubtitle}>Explore amazing services</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Featured Cards */}
        <View style={styles.section}>
          <View style={styles.grid}>
            {discoverItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.featureCard}>
                <View style={[styles.iconCircle, { backgroundColor: `${item.color}20` }]}>
                  <Ionicons name={item.icon as any} size={32} color={item.color} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending This Week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {trendingServices.map((service) => (
            <TouchableOpacity key={service.id} style={styles.trendingCard}>
              <View style={styles.trendingIcon}>
                <Text style={styles.trendingEmoji}>{service.image}</Text>
              </View>
              <View style={styles.trendingInfo}>
                <Text style={styles.trendingName}>{service.name}</Text>
                <Text style={styles.trendingBookings}>{service.bookings} bookings this week</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Explore Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
          <View style={styles.categoryGrid}>
            {['Cleaning', 'Plumbing', 'Electrical', 'HVAC', 'Handyman', 'Painting'].map((cat, idx) => (
              <TouchableOpacity key={idx} style={styles.categoryChip}>
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trendingEmoji: {
    fontSize: 24,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  trendingBookings: {
    fontSize: 12,
    color: '#999',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});