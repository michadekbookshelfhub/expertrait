import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TermsOfService() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const termsContent = `
EXPERTRAIT TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS

By accessing and using ExperTrait's platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.

2. DESCRIPTION OF SERVICE

ExperTrait provides an online platform connecting customers with service handlers for various home services including but not limited to cleaning, plumbing, electrical work, and other professional services.

3. USER ACCOUNTS

3.1. You must register for an account to use our services.
3.2. You are responsible for maintaining the confidentiality of your account credentials.
3.3. You agree to provide accurate, current, and complete information.
3.4. You must be at least 18 years old to use our services.

4. SERVICE BOOKINGS

4.1. All bookings are subject to handler availability.
4.2. Prices are determined by the service type and handler.
4.3. Payment is required before service completion.
4.4. Cancellation policies apply as stated in the booking confirmation.

5. HANDLER RESPONSIBILITIES

5.1. Handlers must provide accurate information about their skills and qualifications.
5.2. Handlers must maintain professional standards.
5.3. Handlers are independent contractors, not employees of ExperTrait.

6. CUSTOMER RESPONSIBILITIES

6.1. Customers must provide accurate service requirements.
6.2. Customers must be present or arrange access for service delivery.
6.3. Customers must pay for services as agreed.

7. PAYMENTS AND REFUNDS

7.1. All payments are processed securely through our payment partners.
7.2. Refunds are subject to our refund policy.
7.3. Disputed charges must be reported within 48 hours.

8. INTELLECTUAL PROPERTY

8.1. All content on ExperTrait is protected by copyright and trademark laws.
8.2. Users may not reproduce, distribute, or create derivative works without permission.

9. LIMITATION OF LIABILITY

ExperTrait is not liable for damages arising from the use or inability to use our services, including but not limited to direct, indirect, incidental, punitive, and consequential damages.

10. DISPUTE RESOLUTION

Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.

11. PRIVACY

Your use of ExperTrait is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.

12. MODIFICATIONS

ExperTrait reserves the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.

13. TERMINATION

ExperTrait may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.

14. GOVERNING LAW

These terms shall be governed by and construed in accordance with the laws of the United States.

15. CONTACT INFORMATION

For questions about these Terms of Service, please contact us at:
Email: legal@expertrait.com
Phone: 1-800-EXPERTRAIT

16. ENTIRE AGREEMENT

These terms constitute the entire agreement between you and ExperTrait regarding the use of our services.

BY USING EXPERTRAIT, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE AND AGREE TO BE BOUND BY THEM.
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.document}>
          <Text style={styles.documentText}>{termsContent}</Text>
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
  content: {
    flex: 1,
  },
  document: {
    backgroundColor: '#FFF',
    padding: 20,
    margin: 16,
    borderRadius: 12,
  },
  documentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },
});
