import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function EarningsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  useEffect(() => {
    loadEarningsData();
  }, []);

  const loadEarningsData = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      // Load wallet
      const walletResponse = await fetch(`${API_URL}/api/handler/${user?.id}/wallet`);
      const walletData = await walletResponse.json();
      setWallet(walletData);

      // Load Stripe Connect status
      const stripeResponse = await fetch(`${API_URL}/api/stripe/connect/status/${user?.id}`);
      const stripeData = await stripeResponse.json();
      setStripeStatus(stripeData);

      // Load payout history
      const payoutsResponse = await fetch(`${API_URL}/api/stripe/payouts/${user?.id}`);
      const payoutsData = await payoutsResponse.json();
      setPayouts(payoutsData.payouts || []);

    } catch (error) {
      console.error('Error loading earnings data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEarningsData();
  };

  const handleConnectStripe = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      
      const response = await fetch(`${API_URL}/api/stripe/connect/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handler_id: user?.id,
          return_url: `expertraitapp://stripe-return`,
          refresh_url: `expertraitapp://stripe-refresh`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start Stripe onboarding');
      }

      const data = await response.json();
      
      // Open Stripe onboarding URL
      const supported = await Linking.canOpenURL(data.onboarding_url);
      if (supported) {
        await Linking.openURL(data.onboarding_url);
      } else {
        Alert.alert('Error', 'Unable to open Stripe onboarding');
      }

    } catch (error) {
      console.error('Error connecting Stripe:', error);
      Alert.alert('Error', 'Failed to start Stripe Connect. Please try again.');
    }
  };

  const handleRequestPayout = async () => {
    if (!stripeStatus?.payouts_enabled) {
      Alert.alert('Not Available', 'Please complete Stripe Connect setup to request payouts.');
      return;
    }

    const availableBalance = wallet?.balance || 0;
    if (availableBalance <= 0) {
      Alert.alert('No Balance', 'You have no available balance to withdraw.');
      return;
    }

    Alert.alert(
      'Request Payout',
      `Request payout of £${availableBalance.toFixed(2)} to your bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setRequestingPayout(true);
            try {
              const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
              const response = await fetch(`${API_URL}/api/stripe/payout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  handler_id: user?.id,
                  amount: availableBalance,
                  description: 'Handler requested payout'
                })
              });

              if (!response.ok) {
                throw new Error('Payout request failed');
              }

              Alert.alert('Success', 'Payout request submitted successfully! Funds will arrive in 2-3 business days.');
              loadEarningsData();
            } catch (error) {
              console.error('Error requesting payout:', error);
              Alert.alert('Error', 'Failed to process payout request. Please try again.');
            } finally {
              setRequestingPayout(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
      }
    >
      {/* Stripe Connect Status */}
      {!stripeStatus?.payouts_enabled ? (
        <View style={styles.stripeAlertCard}>
          <Ionicons name="alert-circle" size={48} color="#F59E0B" />
          <Text style={styles.stripeAlertTitle}>Connect Your Bank Account</Text>
          <Text style={styles.stripeAlertText}>
            Set up Stripe Connect to receive payouts directly to your bank account
          </Text>
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnectStripe}
          >
            <Ionicons name="card" size={20} color="#FFF" />
            <Text style={styles.connectButtonText}>
              {stripeStatus?.connected ? 'Complete Setup' : 'Connect Stripe'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.stripeConnectedCard}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          <Text style={styles.stripeConnectedText}>Bank account connected</Text>
        </View>
      )}

      {/* Earnings Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>£{wallet?.balance?.toFixed(2) || '0.00'}</Text>
          <TouchableOpacity
            style={[
              styles.payoutButton,
              (!stripeStatus?.payouts_enabled || wallet?.balance <= 0) && styles.payoutButtonDisabled
            ]}
            onPress={handleRequestPayout}
            disabled={!stripeStatus?.payouts_enabled || wallet?.balance <= 0 || requestingPayout}
          >
            {requestingPayout ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="cash" size={20} color="#FFF" />
                <Text style={styles.payoutButtonText}>Request Payout</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#10B981" />
            <Text style={styles.statValue}>£{wallet?.total_earnings?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="checkmark-done" size={24} color="#6366F1" />
            <Text style={styles.statValue}>£{wallet?.total_payouts?.toFixed(2) || '0.00'}</Text>
            <Text style={styles.statLabel}>Total Payouts</Text>
          </View>
        </View>
      </View>

      {/* Payout History */}
      <View style={styles.historyContainer}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Payout History</Text>
          <Text style={styles.historyCount}>{payouts.length} transactions</Text>
        </View>

        {payouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No payouts yet</Text>
            <Text style={styles.emptyText}>
              Your payout history will appear here once you request withdrawals
            </Text>
          </View>
        ) : (
          <View style={styles.payoutsList}>
            {payouts.map((payout) => (
              <View key={payout.id} style={styles.payoutCard}>
                <View style={styles.payoutIconContainer}>
                  <Ionicons name="arrow-down-circle" size={24} color="#10B981" />
                </View>
                <View style={styles.payoutContent}>
                  <Text style={styles.payoutDescription}>
                    {payout.description || 'Payout'}
                  </Text>
                  <Text style={styles.payoutDate}>
                    {new Date(payout.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.payoutAmountContainer}>
                  <Text style={styles.payoutAmount}>£{payout.amount?.toFixed(2)}</Text>
                  <View style={styles.payoutStatusBadge}>
                    <Text style={styles.payoutStatusText}>{payout.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#6B7280" />
        <Text style={styles.infoText}>
          Payouts typically arrive in your bank account within 2-3 business days.
        </Text>
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
  stripeAlertCard: {
    margin: 16,
    padding: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  stripeAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginTop: 12,
  },
  stripeAlertText: {
    fontSize: 14,
    color: '#78350F',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  stripeConnectedCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  stripeConnectedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
  },
  summaryContainer: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#D1FAE5',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  payoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#047857',
    paddingVertical: 14,
    borderRadius: 8,
  },
  payoutButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  payoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  historyContainer: {
    padding: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  historyCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  payoutsList: {
    gap: 8,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  payoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutContent: {
    flex: 1,
    marginLeft: 12,
  },
  payoutDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  payoutDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  payoutAmountContainer: {
    alignItems: 'flex-end',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  payoutStatusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  payoutStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#047857',
    textTransform: 'capitalize',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    margin: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});