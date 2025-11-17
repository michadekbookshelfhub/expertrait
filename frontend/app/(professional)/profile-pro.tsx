import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfilePro() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.prompt(
      'Delete Account',
      'This action cannot be undone. Please enter your password to confirm:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async (password) => {
            if (!password) {
              Alert.alert('Error', 'Password is required');
              return;
            }

            try {
              const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
              const response = await fetch(`${API_URL}/api/user/${user?.id}/account?password=${password}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                Alert.alert('Account Deleted', 'Your account has been deleted successfully');
                await logout();
                router.replace('/');
              } else {
                const error = await response.json();
                Alert.alert('Error', error.detail || 'Failed to delete account');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color="#4CAF50" />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFB800" />
            <Text style={styles.rating}>{user?.rating || 5.0}</Text>
            <Text style={styles.ratingLabel}>Professional Rating</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/edit-profile-pro')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/my-skills')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="briefcase-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>My Skills</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/payment-methods')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/availability')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="time-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Availability</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/service-areas')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Service Areas</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/reviews')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="star-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/notifications')}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/language')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(professional)/help-center-pro')}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#4CAF50" />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(customer)/terms-of-service')}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.menuItemText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(customer)/privacy-policy')}>
            <View style={styles.menuItemLeft}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={24} color="#D32F2F" />
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB80010',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
    marginRight: 8,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    marginBottom: 20,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    marginHorizontal: 16,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  deleteAccountText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
  },
});
