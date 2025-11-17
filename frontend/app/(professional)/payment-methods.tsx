import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PaymentMethods() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bankAccount, setBankAccount] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    account_holder_name: '',
    account_number: '',
    sort_code: '',
    bank_name: '',
  });

  useEffect(() => {
    loadBankAccount();
  }, []);

  const loadBankAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/handler/${user?.id}/bank-account`);

      if (response.ok) {
        const data = await response.json();
        setBankAccount(data.bank_account);
      }
    } catch (error) {
      console.error('Failed to load bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.account_holder_name || !formData.account_number || !formData.sort_code || !formData.bank_name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/handler/bank-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handler_id: user?.id,
          bank_account: formData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert(
          'Verification Email Sent',
          'Please check your email to verify this bank account change. The link will expire in 24 hours.',
          [
            {
              text: 'OK',
              onPress: () => {
                setEditing(false);
                loadBankAccount();
              },
            },
          ]
        );
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to update bank account');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update bank account');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Bank Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Account</Text>
            {bankAccount && !editing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setFormData({
                    account_holder_name: user?.name || '',
                    account_number: '',
                    sort_code: '',
                    bank_name: '',
                  });
                  setEditing(true);
                }}
              >
                <Ionicons name="pencil" size={20} color="#4CAF50" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {!bankAccount && !editing ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No bank account on file</Text>
              <Text style={styles.emptySubtext}>
                Add your bank account to receive payments
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setFormData({
                    account_holder_name: user?.name || '',
                    account_number: '',
                    sort_code: '',
                    bank_name: '',
                  });
                  setEditing(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add Bank Account</Text>
              </TouchableOpacity>
            </View>
          ) : editing ? (
            <View style={styles.form}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={formData.account_holder_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, account_holder_name: text })
                }
                placeholder="Full name as on account"
              />

              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                style={styles.input}
                value={formData.bank_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, bank_name: text })
                }
                placeholder="e.g. Barclays, HSBC"
              />

              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={formData.account_number}
                onChangeText={(text) =>
                  setFormData({ ...formData, account_number: text })
                }
                placeholder="12345678"
                keyboardType="numeric"
                maxLength={8}
              />

              <Text style={styles.label}>Sort Code</Text>
              <TextInput
                style={styles.input}
                value={formData.sort_code}
                onChangeText={(text) =>
                  setFormData({ ...formData, sort_code: text })
                }
                placeholder="12-34-56"
                maxLength={8}
              />

              <View style={styles.warningBox}>
                <Ionicons name="warning-outline" size={20} color="#FF9800" />
                <Text style={styles.warningText}>
                  Account name must match your registered name. You'll receive an email to verify any changes.
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditing(false);
                    setFormData({
                      account_holder_name: '',
                      account_number: '',
                      sort_code: '',
                      bank_name: '',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.bankInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Holder</Text>
                <Text style={styles.infoValue}>{bankAccount.account_holder_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bank</Text>
                <Text style={styles.infoValue}>{bankAccount.bank_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Number</Text>
                <Text style={styles.infoValue}>{bankAccount.account_number}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sort Code</Text>
                <Text style={styles.infoValue}>{bankAccount.sort_code}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={24} color="#4CAF50" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Secure Payment Processing</Text>
            <Text style={styles.infoDescription}>
              Your bank details are encrypted and secure. Payments are processed via Stripe Connect.
            </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#F57C00',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bankInfo: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#558B2F',
    lineHeight: 18,
  },
});
