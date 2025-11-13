import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PrivacyPolicy() {
  const router = useRouter();

  const privacyContent = `
EXPERTRAIT PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INTRODUCTION

ExperTrait ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.

2. INFORMATION WE COLLECT

2.1. Personal Information:
- Name, email address, phone number
- Profile picture
- Payment information
- Service address and location data

2.2. Usage Information:
- Service booking history
- Communication with handlers
- App usage patterns
- Device information

2.3. Location Data:
- GPS location for service delivery
- Address information
- Handler proximity data

3. HOW WE USE YOUR INFORMATION

We use your information to:

3.1. Provide and improve our services
3.2. Match you with appropriate handlers
3.3. Process payments and transactions
3.4. Communicate about bookings and updates
3.5. Ensure platform security and fraud prevention
3.6. Analyze usage patterns and improve user experience
3.7. Send promotional communications (with your consent)

4. INFORMATION SHARING

4.1. With Handlers:
We share necessary information with handlers to complete your service bookings, including your name, contact information, and service address.

4.2. With Service Providers:
We may share data with third-party providers who help us operate our platform, including payment processors, hosting services, and analytics providers.

4.3. Legal Requirements:
We may disclose information when required by law or to protect our rights and safety.

4.4. Business Transfers:
In case of merger, acquisition, or sale of assets, your information may be transferred.

5. DATA SECURITY

5.1. We implement industry-standard security measures to protect your data.
5.2. All payment information is encrypted and processed securely.
5.3. Access to personal data is restricted to authorized personnel only.
5.4. Regular security audits are conducted.

6. YOUR RIGHTS

You have the right to:

6.1. Access your personal data
6.2. Correct inaccurate information
6.3. Request deletion of your data
6.4. Opt-out of marketing communications
6.5. Export your data
6.6. Lodge a complaint with supervisory authorities

7. DATA RETENTION

We retain your personal data for as long as necessary to provide our services and comply with legal obligations. Account data is retained for 7 years after account closure.

8. COOKIES AND TRACKING

8.1. We use cookies and similar technologies to enhance user experience.
8.2. You can control cookie preferences through your device settings.
8.3. Analytics tools help us understand how our platform is used.

9. CHILDREN'S PRIVACY

Our services are not intended for users under 18 years of age. We do not knowingly collect data from children.

10. INTERNATIONAL DATA TRANSFERS

Your data may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place.

11. THIRD-PARTY LINKS

Our platform may contain links to third-party websites. We are not responsible for their privacy practices.

12. CHANGES TO THIS POLICY

We may update this privacy policy from time to time. We will notify you of significant changes via email or app notification.

13. CALIFORNIA PRIVACY RIGHTS

California residents have additional rights under the CCPA:
- Right to know what personal information is collected
- Right to know if personal information is sold or disclosed
- Right to opt-out of the sale of personal information
- Right to non-discrimination

14. GDPR COMPLIANCE

For users in the European Economic Area, we comply with GDPR requirements including:
- Lawful basis for processing
- Data protection by design
- Right to data portability
- Right to be forgotten

15. CONTACT US

For questions about this Privacy Policy or to exercise your rights, contact us at:

Email: privacy@expertrait.com
Phone: 1-800-EXPERTRAIT
Address: ExperTrait Privacy Office

16. DATA PROTECTION OFFICER

For GDPR-related inquiries:
Email: dpo@expertrait.com

BY USING EXPERTRAIT, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY AND AGREE TO ITS TERMS.
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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.document}>
          <Text style={styles.documentText}>{privacyContent}</Text>
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
