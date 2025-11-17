import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  service_name: string;
  created_at: string;
}

export default function Reviews() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    average_rating: 0,
    total_reviews: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0,
  });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/reviews/handler/${user?.id}`);

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        
        // Calculate stats
        const total = data.reviews?.length || 0;
        const avgRating = total > 0 
          ? data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / total 
          : 0;
        
        const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.reviews?.forEach((r: Review) => {
          starCounts[r.rating as keyof typeof starCounts]++;
        });

        setStats({
          average_rating: avgRating,
          total_reviews: total,
          five_star: starCounts[5],
          four_star: starCounts[4],
          three_star: starCounts[3],
          two_star: starCounts[2],
          one_star: starCounts[1],
        });
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReviews();
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
    return (
      <View style={styles.ratingBarContainer}>
        <Text style={styles.ratingBarLabel}>{stars} ⭐</Text>
        <View style={styles.ratingBarTrack}>
          <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingBarCount}>{count}</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reviews</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Rating Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.averageRating}>{stats.average_rating.toFixed(1)}</Text>
            {renderStars(Math.round(stats.average_rating))}
            <Text style={styles.totalReviews}>{stats.total_reviews} reviews</Text>
          </View>
          <View style={styles.summaryRight}>
            {renderRatingBar(5, stats.five_star)}
            {renderRatingBar(4, stats.four_star)}
            {renderRatingBar(3, stats.three_star)}
            {renderRatingBar(2, stats.two_star)}
            {renderRatingBar(1, stats.one_star)}
          </View>
        </View>

        {/* Reviews List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          
          {reviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No reviews yet</Text>
              <Text style={styles.emptySubtext}>
                Complete jobs to receive customer reviews
              </Text>
            </View>
          ) : (
            reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {review.customer_name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reviewerName}>{review.customer_name}</Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                  {renderStars(review.rating)}
                </View>
                <Text style={styles.serviceName}>{review.service_name}</Text>
                {review.comment && (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                )}
              </View>
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  totalReviews: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  summaryRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  ratingBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  ratingBarLabel: {
    fontSize: 12,
    width: 40,
    color: '#666',
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFB800',
  },
  ratingBarCount: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
    color: '#666',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  reviewCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  serviceName: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    textAlign: 'center',
  },
});