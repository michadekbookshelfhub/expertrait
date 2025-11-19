import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HandlerReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest'>('recent');
  const [filterRating, setFilterRating] = useState<number>(0); // 0 = all ratings

  const handlerId = params.handlerId as string;
  const handlerName = params.handlerName as string;

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [reviews, sortBy, filterRating]);

  const loadReviews = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/reviews/handler/${handlerId}`);
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.ratingDisplay}>
          <Text style={styles.averageRating}>{calculateAverageRating()}</Text>
          <View>
            {renderStars(Math.round(parseFloat(calculateAverageRating())))}
            <Text style={styles.reviewCount}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Text>
          </View>
        </View>
        <Text style={styles.handlerName}>{handlerName}</Text>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to leave a review for this handler
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerInitial}>
                    {review.customer_name?.charAt(0).toUpperCase() || 'C'}
                  </Text>
                </View>
                <View style={styles.reviewHeaderContent}>
                  <Text style={styles.customerName}>{review.customer_name || 'Customer'}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {renderStars(review.rating)}
              </View>

              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}

              {/* Detailed Ratings */}
              <View style={styles.detailedRatings}>
                <View style={styles.detailRatingItem}>
                  <Text style={styles.detailRatingLabel}>Service Quality</Text>
                  <View style={styles.detailRatingBar}>
                    <View style={[styles.detailRatingFill, { width: `${(review.service_quality / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.detailRatingValue}>{review.service_quality}/5</Text>
                </View>

                <View style={styles.detailRatingItem}>
                  <Text style={styles.detailRatingLabel}>Professionalism</Text>
                  <View style={styles.detailRatingBar}>
                    <View style={[styles.detailRatingFill, { width: `${(review.handlerism / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.detailRatingValue}>{review.handlerism}/5</Text>
                </View>

                <View style={styles.detailRatingItem}>
                  <Text style={styles.detailRatingLabel}>Timeliness</Text>
                  <View style={styles.detailRatingBar}>
                    <View style={[styles.detailRatingFill, { width: `${(review.timeliness / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.detailRatingValue}>{review.timeliness}/5</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
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
  summaryCard: {
    backgroundColor: '#FFF',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  handlerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewsList: {
    padding: 16,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  reviewCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  customerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  reviewHeaderContent: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailedRatings: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  detailRatingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailRatingLabel: {
    fontSize: 12,
    color: '#6B7280',
    width: 100,
  },
  detailRatingBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  detailRatingFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  detailRatingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    width: 30,
  },
});
