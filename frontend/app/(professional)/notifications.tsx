import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function Notifications() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    newJobs: true,
    jobUpdates: true,
    messages: true,
    payments: true,
    reviews: true,
    marketing: false,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_settings: settings }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Notification settings updated');
      } else {
        Alert.alert('Error', 'Failed to update settings');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const renderSettingItem = (title: string, description: string, key: string, icon: string) => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon as any} size={24} color="#4CAF50" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[key as keyof typeof settings] as boolean}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#CCC', true: '#4CAF50' }}
        thumbColor={settings[key as keyof typeof settings] ? '#FFF' : '#F4F3F4'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Notifications</Text>
          {renderSettingItem('New Job Requests','Get notified when customers request your services','newJobs','briefcase')}
          {renderSettingItem('Job Updates','Notifications about job status changes','jobUpdates','refresh-circle')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          {renderSettingItem('Messages','New messages from customers or admin','messages','chatbubble')}
          {renderSettingItem('Payment Updates','Payment received and withdrawal notifications','payments','wallet')}
          {renderSettingItem('Reviews','New customer reviews and ratings','reviews','star')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing</Text>
          {renderSettingItem('Promotional Offers','Special offers, tips, and platform updates','marketing','megaphone')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Methods</Text>
          {renderSettingItem('Email Notifications','Receive notifications via email','emailNotifications','mail')}
          {renderSettingItem('Push Notifications','Receive push notifications on your device','pushNotifications','notifications')}
          {renderSettingItem('SMS Notifications','Receive SMS for urgent updates','smsNotifications','phone-portrait')}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>Important: Job-related notifications cannot be disabled to ensure you don't miss opportunities.</Text>
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
  saveText: { fontSize: 16, fontWeight: '600', color: '#4CAF50', padding: 8 },
  content: { flex: 1 },
  section: { backgroundColor: '#FFF', marginTop: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: 12, flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  settingDescription: { fontSize: 12, color: '#999', lineHeight: 16 },
  infoBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', margin: 16, padding: 12, borderRadius: 8, alignItems: 'flex-start' },
  infoText: { flex: 1, marginLeft: 8, fontSize: 12, color: '#1976D2', lineHeight: 18 },
});