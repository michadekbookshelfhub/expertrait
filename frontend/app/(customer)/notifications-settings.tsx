import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificationsSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    bookingUpdates: true,
    promotions: true,
    newServices: false,
    professionalArrival: true,
    paymentConfirmation: true,
    reviewReminders: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="calendar" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Booking Updates</Text>
                <Text style={styles.settingDescription}>
                  Get notified about booking status changes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.bookingUpdates}
              onValueChange={() => toggleSetting('bookingUpdates')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.bookingUpdates ? '#FF6B00' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="navigate" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Professional Arrival</Text>
                <Text style={styles.settingDescription}>
                  Alert when professional is arriving
                </Text>
              </View>
            </View>
            <Switch
              value={settings.professionalArrival}
              onValueChange={() => toggleSetting('professionalArrival')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.professionalArrival ? '#FF6B00' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="star" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Review Reminders</Text>
                <Text style={styles.settingDescription}>
                  Remind me to review completed services
                </Text>
              </View>
            </View>
            <Switch
              value={settings.reviewReminders}
              onValueChange={() => toggleSetting('reviewReminders')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.reviewReminders ? '#FF6B00' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="pricetag" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>
                  Receive special deals and discounts
                </Text>
              </View>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.promotions ? '#FF6B00' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="sparkles" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>New Services</Text>
                <Text style={styles.settingDescription}>
                  Be first to know about new services
                </Text>
              </View>
            </View>
            <Switch
              value={settings.newServices}
              onValueChange={() => toggleSetting('newServices')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.newServices ? '#FF6B00' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="card" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Payment Confirmation</Text>
                <Text style={styles.settingDescription}>
                  Receipts and payment confirmations
                </Text>
              </View>
            </View>
            <Switch
              value={settings.paymentConfirmation}
              onValueChange={() => toggleSetting('paymentConfirmation')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.paymentConfirmation ? '#FF6B00' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive push notifications on this device
                </Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.pushNotifications ? '#FF6B00' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.emailNotifications ? '#FF6B00' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble" size={24} color="#FF6B00" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive text messages (carrier charges apply)
                </Text>
              </View>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={() => toggleSetting('smsNotifications')}
              trackColor={{ false: '#CCC', true: '#FF6B0080' }}
              thumbColor={settings.smsNotifications ? '#FF6B00' : '#f4f3f4'}
            />
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
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
});