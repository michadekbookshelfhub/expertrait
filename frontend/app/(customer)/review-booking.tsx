import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function ReviewBookingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  
  const [rating, setRating] = useState(0);
  const [serviceQuality, setServiceQuality] = useState(0);
  const [professionalism, setProfessionalism] = useState(0);
  const [timeliness, setTimeliness] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const bookingId = params.bookingId as string;
  const handlerId = params.handlerId as string;
  const handlerName = params.handlerName as string;

  const renderStars = (currentRating: number, onPress: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={36}
              color={star <= currentRating ? '#F59E0B' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    if (serviceQuality === 0 || professionalism === 0 || timeliness === 0) {
      Alert.alert('Complete Rating', 'Please rate all aspects of the service');
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          customer_id: user?.id,
          handler_id: handlerId,
          rating: rating,
          service_quality: serviceQuality,
          handlerism: professionalism,
          timeliness: timeliness,
          comment: comment.trim() || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      Alert.alert(
        'Thank You!',
        'Your review has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
      </View>

      <View style={styles.content}>
        {/* Handler Info */}
        <View style={styles.handlerCard}>
          <View style={styles.handlerAvatar}>
            <Ionicons name="person" size={32} color="#FF6B00" />
          </View>
          <View>
            <Text style={styles.handlerName}>{handlerName || 'Handler'}</Text>
            <Text style={styles.handlerLabel}>Service Provider</Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          <Text style={styles.sectionSubtitle}>How was your experience?</Text>
          {renderStars(rating, setRating)}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Below Average' : 'Poor'}
            </Text>
          )}
        </View>

        {/* Detailed Ratings */}
        <View style={styles.detailedRatingsContainer}>
          <Text style={styles.sectionTitle}>Detailed Rating</Text>

          <View style={styles.ratingItem}>
            <View style={styles.ratingItemHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.ratingItemLabel}>Service Quality</Text>
            </View>
            {renderStars(serviceQuality, setServiceQuality)}
          </View>

          <View style={styles.ratingItem}>
            <View style={styles.ratingItemHeader}>
              <Ionicons name="person-circle" size={20} color="#3B82F6" />
              <Text style={styles.ratingItemLabel}>Professionalism</Text>
            </View>
            {renderStars(professionalism, setProfessionalism)}
          </View>

          <View style={styles.ratingItem}>
            <View style={styles.ratingItemHeader}>
              <Ionicons name="time" size={20} color="#8B5CF6" />
              <Text style={styles.ratingItemLabel}>Timeliness</Text>
            </View>
            {renderStars(timeliness, setTimeliness)}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Share Your Experience (Optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.commentHint}>
            Your review helps others make informed decisions
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  handlerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  handlerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  handlerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  handlerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 12,
  },
  detailedRatingsContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingItem: {
    marginTop: 16,
  },
  ratingItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  commentSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 100,
    marginBottom: 8,
  },
  commentHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B00',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
