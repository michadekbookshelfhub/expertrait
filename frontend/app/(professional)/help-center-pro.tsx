import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FAQ_DATA = [
  { category: 'Getting Started', question: 'How do I start receiving job requests?', answer: 'Complete your profile, add your skills, set your availability, and add service areas. Make sure your profile is set to Available.' },
  { category: 'Getting Started', question: 'How do I update my skills?', answer: 'Go to Profile > My Skills and select all services you can provide.' },
  { category: 'Jobs & Bookings', question: 'How do I accept a job?', answer: 'Navigate to Jobs tab, view job details, and tap Accept. Check requirements and location first.' },
  { category: 'Jobs & Bookings', question: 'What is check-in/check-out?', answer: 'Check-in when you arrive at the job location, and check-out when finished. This tracks work time and triggers automatic payment.' },
  { category: 'Payments', question: 'How do I get paid?', answer: 'When you complete a job and check-out, payment is automatically added to your wallet.' },
  { category: 'Payments', question: 'How do I add my bank account?', answer: 'Go to Profile > Payment Methods > Add Bank Account. Enter details and verify via email.' },
  { category: 'Availability', question: 'How does availability work?', answer: 'Set available dates up to 30 days in advance to help match you with jobs.' },
  { category: 'Account', question: 'How do I delete my account?', answer: 'Go to Profile > Delete Account. You need to complete active bookings first.' },
];

export default function HelpCenterPro() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(FAQ_DATA.map(item => item.category)))];
  const filteredFAQs = selectedCategory === 'All' ? FAQ_DATA : FAQ_DATA.filter(item => item.category === selectedCategory);

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
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('mailto:support@expertrait.com')}>
              <Ionicons name="mail" size={24} color="#4CAF50" />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={() => Linking.openURL('tel:+442012345678')}>
              <Ionicons name="call" size={24} color="#4CAF50" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
          {categories.map((category) => (
            <TouchableOpacity key={category} style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]} onPress={() => setSelectedCategory(category)}>
              <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {filteredFAQs.map((item, index) => (
            <TouchableOpacity key={index} style={styles.faqItem} onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle" size={20} color="#4CAF50" style={styles.faqIcon} />
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons name={expandedIndex === index ? "chevron-up" : "chevron-down"} size={20} color="#999" />
              </View>
              {expandedIndex === index && <Text style={styles.faqAnswer}>{item.answer}</Text>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#2196F3" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>24/7 Support</Text>
            <Text style={styles.infoText}>support@expertrait.com</Text>
            <Text style={styles.infoText}>+44 20 1234 5678</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  placeholder: { width: 40 },
  content: { flex: 1 },
  contactSection: { backgroundColor: '#FFF', padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  contactButtons: { flexDirection: 'row', gap: 12 },
  contactButton: { flex: 1, backgroundColor: '#E8F5E9', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#4CAF50' },
  contactButtonText: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#2E7D32' },
  categoryScroll: { backgroundColor: '#FFF', paddingVertical: 12, marginBottom: 16 },
  categoryContent: { paddingHorizontal: 16 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 8 },
  categoryChipActive: { backgroundColor: '#4CAF50' },
  categoryChipText: { fontSize: 14, color: '#666' },
  categoryChipTextActive: { color: '#FFF', fontWeight: '600' },
  faqSection: { backgroundColor: '#FFF', padding: 16, marginBottom: 16 },
  faqItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqIcon: { marginRight: 8 },
  faqQuestion: { flex: 1, fontSize: 15, fontWeight: '600', color: '#333' },
  faqAnswer: { marginTop: 8, marginLeft: 28, fontSize: 14, color: '#666', lineHeight: 20 },
  infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', margin: 16, padding: 16, borderRadius: 12 },
  infoContent: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#1976D2', marginBottom: 4 },
});
