import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Handler {
  id: string;
  name: string;
  email: string;
  profile_image_url?: string;
  bio: string;
  rating: number;
  review_count: number;
  skills: string[];
  years_experience: number;
  completed_jobs: number;
}

export default function BookingDetail() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [handler, setHandler] = useState<Handler | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHandlerProfile();
  }, []);

  const loadHandlerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/bookings/${bookingId}/handler-profile`
      );
      if (response.ok) {
        const data = await response.json();
        setHandler(data.handler);
      }
    } catch (error) {
      console.error('Failed to load handler profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = () => {
    router.push({
      pathname: '/(customer)/booking-chat',
      params: { bookingId }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
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
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {!handler ? (
          <View style={styles.pendingCard}>
            <Ionicons name="time-outline" size={48} color="#FFA500" />
            <Text style={styles.pendingTitle}>Booking Pending</Text>
            <Text style={styles.pendingText}>
              Your booking is waiting to be accepted by a handler.
              You'll be notified once a handler is assigned.
            </Text>
          </View>
        ) : (
          <View>
            {/* Handler Accepted Card */}
            <View style={styles.acceptedCard}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.acceptedTitle}>Booking Accepted!</Text>
              <Text style={styles.acceptedText}>
                A handler has been assigned to your booking.
              </Text>
            </View>

            {/* Handler Profile */}
            <View style={styles.handlerCard}>
              <View style={styles.handlerHeader}>
                {handler.profile_image_url ? (
                  <Image
                    source={{ uri: handler.profile_image_url }}
                    style={styles.handlerImage}
                  />
                ) : (
                  <View style={styles.handlerImagePlaceholder}>
                    <Ionicons name="person" size={40} color="#FFF" />
                  </View>
                )}
                <View style={styles.handlerInfo}>
                  <Text style={styles.handlerName}>{handler.name}</Text>
                  <View style={styles.handlerRating}>
                    <Ionicons name="star" size={16} color="#FFB800" />
                    <Text style={styles.ratingText}>
                      {handler.rating.toFixed(1)} ({handler.review_count} reviews)
                    </Text>
                  </View>
                  <Text style={styles.handlerExperience}>
                    {handler.years_experience} years experience
                  </Text>
                </View>
              </View>

              {handler.bio && (
                <Text style={styles.handlerBio}>{handler.bio}</Text>
              )}

              {handler.skills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsTitle}>Skills:</Text>
                  <View style={styles.skillsChips}>
                    {handler.skills.map((skill, index) => (
                      <View key={index} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{handler.completed_jobs}</Text>
                  <Text style={styles.statLabel}>Completed Jobs</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{handler.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
              </View>

              {/* Contact Handler */}
              <View style={styles.contactSection}>
                <Text style={styles.contactTitle}>Contact Handler</Text>
                <View style={styles.contactButtons}>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleChatPress}
                  >
                    <Ionicons name="chatbubbles" size={20} color="#FFF" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.emailButton}>
                    <Ionicons name="mail" size={20} color="#FF6B00" />
                    <Text style={styles.emailButtonText}>Email</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* View Reviews Button */}
              <TouchableOpacity
                style={styles.viewReviewsButton}
                onPress={() => router.push({
                  pathname: '/(customer)/handler-reviews',
                  params: { 
                    handlerId: handler.id,
                    handlerName: handler.name
                  }
                })}
              >
                <Ionicons name="star-outline" size={20} color="#FF6B00" />
                <Text style={styles.viewReviewsText}>
                  View All Reviews ({handler.review_count})
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#FF6B00" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 16,
  },
  pendingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  pendingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  acceptedCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
  acceptedText: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    marginTop: 8,
  },
  handlerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  handlerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  handlerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  handlerImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handlerInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  handlerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  handlerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  handlerExperience: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  handlerBio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  skillsContainer: {
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  skillsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#FF6B0020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#FF6B00',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  contactSection: {
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#FF6B00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emailButtonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
