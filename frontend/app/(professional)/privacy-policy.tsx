import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HandlerPrivacyPolicy() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.policyContainer}>
          <Text style={styles.title}>ExperTrait Handler Privacy Policy</Text>
          
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect information you provide when registering as a handler, including your name, email, phone number, address, and professional skills. We also collect information about the services you provide and your earnings.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.text}>
            Your information is used to connect you with customers seeking your services, process payments, and improve our platform. We may also use your information to send you important updates about your account and bookings.
          </Text>

          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.text}>
            We share your name, rating, and service information with customers when they book your services. Your contact information is shared only after a booking is confirmed. We do not sell your personal information to third parties.
          </Text>

          <Text style={styles.sectionTitle}>4. Payment Information</Text>
          <Text style={styles.text}>
            Payment processing is handled securely through Stripe. Your bank account details are encrypted and stored securely. We do not have direct access to your full banking information.
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.text}>
            We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to access, update, or delete your personal information at any time. You can do this through your profile settings or by contacting our support team.
          </Text>

          <Text style={styles.sectionTitle}>7. Contact Us</Text>
          <Text style={styles.text}>
            If you have any questions about this privacy policy, please contact us at support@expertrait.com
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
  policyContainer: {
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
