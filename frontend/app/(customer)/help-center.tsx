import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const FAQs = [
  {
    question: 'How do I book a service?',
    answer: 'Browse services, add to cart, and checkout. You can book multiple services at once.'
  },
  {
    question: 'When will a handler be assigned?',
    answer: 'Handlers are assigned within 24 hours. You\'ll receive a notification once assigned.'
  },
  {
    question: 'How do I contact my handler?',
    answer: 'Once a handler accepts your booking, you can chat with them directly from the booking details.'
  },
  {
    question: 'What if I need to cancel?',
    answer: 'You can cancel bookings from the bookings screen. Cancellation policy applies based on timing.'
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are processed securely through Stripe. You can pay with card or other methods.'
  },
  {
    question: 'Can I rate my handler?',
    answer: 'Yes! After service completion, you can rate and review your handler.'
  },
];

export default function HelpCenter() {
  const router = useRouter();
  const { user } = useAuth();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitTicket = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/support/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          subject,
          message,
          priority: 'normal'
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Support ticket created! We\'ll respond within 24 hours.');
        setSubject('');
        setMessage('');
        setShowContactForm(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create support ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setShowContactForm(!showContactForm)}
          >
            <Ionicons name="chatbubbles" size={24} color="#FF6B00" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionSubtitle}>Get help from our team</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(customer)/my-tickets')}
          >
            <Ionicons name="ticket" size={24} color="#FF6B00" />
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>My Tickets</Text>
              <Text style={styles.actionSubtitle}>View support history</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Contact Form */}
        {showContactForm && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Support Ticket</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={subject}
                onChangeText={setSubject}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue..."
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitTicket}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Ticket</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqCard}
              onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </View>
              {expandedIndex === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoCard}>
            <Ionicons name="mail" size={20} color="#FF6B00" />
            <Text style={styles.infoText}>support@expertrait.com</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="call" size={20} color="#FF6B00" />
            <Text style={styles.infoText}>1-800-EXPERTRAIT</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={20} color="#FF6B00" />
            <Text style={styles.infoText}>Mon-Fri: 9AM-6PM EST</Text>
          </View>
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  form: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});
