import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function HandlerTermsOfService() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.termsContainer}>
          <Text style={styles.title}>ExperTrait Handler Terms of Service</Text>
          
          <Text style={styles.sectionTitle}>1. Service Agreement</Text>
          <Text style={styles.text}>
            By registering as a handler on ExperTrait, you agree to provide professional services to customers through our platform. You are responsible for the quality of work you provide and maintaining professional standards.
          </Text>

          <Text style={styles.sectionTitle}>2. Handler Responsibilities</Text>
          <Text style={styles.text}>
            • Complete all accepted bookings in a timely and professional manner{'\n'}
            • Maintain accurate availability schedules{'\n'}
            • Respond promptly to customer messages{'\n'}
            • Arrive on time for scheduled appointments{'\n'}
            • Use proper tools and equipment for the job
          </Text>

          <Text style={styles.sectionTitle}>3. Payments and Earnings</Text>
          <Text style={styles.text}>
            You will receive payment for completed jobs according to the agreed-upon rates. Payments are processed through Stripe and transferred to your registered bank account. ExperTrait retains a service fee from each booking.
          </Text>

          <Text style={styles.sectionTitle}>4. Cancellations</Text>
          <Text style={styles.text}>
            If you need to cancel an accepted booking, you must do so at least 24 hours in advance. Repeated cancellations may result in penalties or account suspension.
          </Text>

          <Text style={styles.sectionTitle}>5. Account Suspension</Text>
          <Text style={styles.text}>
            ExperTrait reserves the right to suspend or terminate your handler account if you violate these terms, receive consistent poor ratings, or engage in fraudulent activities.
          </Text>

          <Text style={styles.sectionTitle}>6. Background Checks</Text>
          <Text style={styles.text}>
            You consent to background checks and verification of your professional credentials. You must provide accurate information about your skills and experience.
          </Text>

          <Text style={styles.sectionTitle}>7. Liability</Text>
          <Text style={styles.text}>
            You are responsible for any damage caused during service delivery. You should maintain appropriate insurance coverage for your professional activities.
          </Text>

          <Text style={styles.sectionTitle}>8. Contact Us</Text>
          <Text style={styles.text}>
            For any questions about these terms, please contact us at support@expertrait.com
          </Text>

          <Text style={styles.footer}>Last updated: November 2024</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  termsContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    margin: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
    marginBottom: 12,
  },
  footer: {
    fontSize: 13,
    color: '#999',
    marginTop: 24,
    fontStyle: 'italic',
  },
});
