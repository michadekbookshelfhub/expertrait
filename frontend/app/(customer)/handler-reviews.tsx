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

  const applyFiltersAndSort = () => {
    let filtered = [...reviews];

    // Filter by rating
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    setFilteredReviews(filtered);
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

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter & Sort</Text>
        
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.filterButton, sortBy === 'recent' && styles.filterButtonActive]}
              onPress={() => setSortBy('recent')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'recent' && styles.filterButtonTextActive]}>
                Recent
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, sortBy === 'highest' && styles.filterButtonActive]}
              onPress={() => setSortBy('highest')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'highest' && styles.filterButtonTextActive]}>
                Highest
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, sortBy === 'lowest' && styles.filterButtonActive]}
              onPress={() => setSortBy('lowest')}
            >
              <Text style={[styles.filterButtonText, sortBy === 'lowest' && styles.filterButtonTextActive]}>
                Lowest
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Rating:</Text>
          <View style={styles.ratingFilters}>
            <TouchableOpacity
              style={[styles.ratingFilterButton, filterRating === 0 && styles.filterButtonActive]}
              onPress={() => setFilterRating(0)}
            >
              <Text style={[styles.filterButtonText, filterRating === 0 && styles.filterButtonTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.ratingFilterButton, filterRating === rating && styles.filterButtonActive]}
                onPress={() => setFilterRating(rating)}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={filterRating === rating ? '#FFF' : '#F59E0B'}
                />
                <Text style={[styles.filterButtonText, filterRating === rating && styles.filterButtonTextActive]}>
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        {filteredReviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-ellipses-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyText}>
              Be the first to leave a review for this handler
            </Text>
          </View>
        ) : (
          filteredReviews.map((review) => (
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
  filtersContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  ratingFilters: {
    flexDirection: 'row',
    gap: 6,
  },
  ratingFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
