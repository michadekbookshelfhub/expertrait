import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const { user, loading, login, partnerLogin, register, partnerRegister } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userType, setUserType] = useState<'customer' | 'professional' | 'partner'>('customer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // Partner specific fields
  const [representativeName, setRepresentativeName] = useState('');
  const [representativeAddress, setRepresentativeAddress] = useState('');
  const [representativeJobRole, setRepresentativeJobRole] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [healthcareCategory, setHealthcareCategory] = useState('');

  const healthcareCategories = [
    'Child Minding',
    'Dog Sitter',
    'Mental Support Worker',
    'Domiciliary Care Worker',
    'Support Worker (Sit-in)'
  ];

  // Define health services group
  const healthServices = [
    'Pet Care',
    'Dog Sitter',
    'Child Minding',
    'Mental Support Worker',
    'Domiciliary Care Worker',
    'Support Worker (Sit-in)',
    'Care Worker'
  ];

  // Available service categories for professionals
  const serviceCategories = [
    'Cleaning', 'Plumbing', 'Electrical', 'Painting', 'Gardening',
    'Carpentry', 'HVAC', 'Appliance Repair', 'Moving', 'Pet Care',
    'Child Minding', 'Dog Sitter', 'Mental Support Worker', 
    'Domiciliary Care Worker', 'Support Worker (Sit-in)', 'Care Worker'
  ];

  const isHealthService = (skill: string) => {
    return healthServices.includes(skill);
  };

  const canSelectSkill = (skill: string) => {
    // If already selected, can always deselect
    if (selectedSkills.includes(skill)) {
      return true;
    }

    // Maximum 3 skills total
    if (selectedSkills.length >= 3) {
      return false;
    }

    const healthSkillsCount = selectedSkills.filter(s => isHealthService(s)).length;
    const nonHealthSkillsCount = selectedSkills.length - healthSkillsCount;
    const hasHealthService = healthSkillsCount > 0;

    // If trying to add a health service
    if (isHealthService(skill)) {
      // If no health services selected yet, can add (up to 3 total)
      if (!hasHealthService) {
        return true;
      }
      // If health services already selected, can add up to 2 health services total
      return healthSkillsCount < 2;
    } else {
      // If trying to add a non-health service
      // If health services are selected, can only add 1 non-health service
      if (hasHealthService) {
        return nonHealthSkillsCount < 1;
      }
      // If no health services selected, can add freely (up to 3 total)
      return true;
    }
  };

  const toggleSkill = (skill: string) => {
    if (!canSelectSkill(skill) && !selectedSkills.includes(skill)) {
      const healthSkillsCount = selectedSkills.filter(s => isHealthService(s)).length;
      const hasHealthService = healthSkillsCount > 0;
      
      if (selectedSkills.length >= 3) {
        Alert.alert('Maximum Skills', 'You can select a maximum of 3 skills.');
      } else if (hasHealthService && isHealthService(skill) && healthSkillsCount >= 2) {
        Alert.alert('Health Services Limit', 'You can select a maximum of 2 health services.');
      } else if (hasHealthService && !isHealthService(skill)) {
        Alert.alert('Skill Limit', 'When health services are selected, you can only add 1 non-health service.');
      }
      return;
    }

    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  useEffect(() => {
    if (!loading && user) {
      // Navigate based on user type
      if (user.user_type === 'professional') {
        router.replace('/(professional)/dashboard');
      } else if (user.user_type === 'partner') {
        router.replace('/(partner)/dashboard');
      } else {
        router.replace('/(customer)/home');
      }
    }
  }, [user, loading]);

  const handleAuth = async () => {
    if (isLogin) {
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      setIsLoading(true);
      try {
        // Use partner login for partners, regular login for others
        if (userType === 'partner') {
          await partnerLogin(email, password);
        } else {
          await login(email, password);
        }
      } catch (error: any) {
        Alert.alert('Login Failed', error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email || !password || !name || !phone) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      // Validate skills for professionals
      if (userType === 'professional' && selectedSkills.length === 0) {
        Alert.alert('Error', 'Please select at least one skill/service you can provide');
        return;
      }

      // Validate partner fields
      if (userType === 'partner') {
        if (!organizationName || !companyPhone || !companyAddress || !licenseNumber || 
            !healthcareCategory || !representativeName || !representativeAddress || !representativeJobRole) {
          Alert.alert('Error', 'Please fill in all required partner fields');
          return;
        }
      }
      
      setIsLoading(true);
      try {
        if (userType === 'partner') {
          await partnerRegister({
            email,
            password,
            organization_name: organizationName,
            company_phone: companyPhone,
            company_address: companyAddress,
            healthcare_license_number: licenseNumber,
            healthcare_category: healthcareCategory,
            representative_full_name: representativeName,
            representative_address: representativeAddress,
            representative_job_role: representativeJobRole
          });
        } else {
          await register({
            name,
            email,
            password,
            phone,
            user_type: userType,
            skills: userType === 'professional' ? selectedSkills : [],
          });
        }
      } catch (error: any) {
        Alert.alert('Registration Status', error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image 
            source={require('../assets/images/explogo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>EXPERTRAIT</Text>
          <Text style={styles.subtitle}>Professional Services Platform</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isLogin 
              ? 'Sign in to continue to ExperTrait' 
              : 'Join our professional services platform'}
          </Text>

          {!isLogin && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.userTypeContainer}>
                <Text style={styles.inputLabel}>Account Type</Text>
                <Text style={styles.helperText}>Choose how you'll use ExperTrait</Text>
                <View style={styles.userTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'customer' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('customer')}
                  >
                    <Ionicons 
                      name="person" 
                      size={24} 
                      color={userType === 'customer' ? '#FF6B00' : '#999'} 
                    />
                    <Text
                      style={[
                        styles.userTypeText,
                        userType === 'customer' && styles.userTypeTextActive,
                      ]}
                    >
                      Customer
                    </Text>
                    <Text style={styles.userTypeDesc}>
                      Book services
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'professional' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('professional')}
                  >
                    <Ionicons 
                      name="briefcase" 
                      size={24} 
                      color={userType === 'professional' ? '#FF6B00' : '#999'} 
                    />
                    <Text
                      style={[
                        styles.userTypeText,
                        userType === 'professional' && styles.userTypeTextActive,
                      ]}
                    >
                      Professional
                    </Text>
                    <Text style={styles.userTypeDesc}>
                      Offer services
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.userTypeButton,
                      userType === 'partner' && styles.userTypeButtonActive,
                    ]}
                    onPress={() => setUserType('partner')}
                  >
                    <Ionicons 
                      name="business" 
                      size={24} 
                      color={userType === 'partner' ? '#FF6B00' : '#999'} 
                    />
                    <Text
                      style={[
                        styles.userTypeText,
                        userType === 'partner' && styles.userTypeTextActive,
                      ]}
                    >
                      Partner
                    </Text>
                    <Text style={styles.userTypeDesc}>
                      Healthcare org
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {userType === 'professional' && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.inputLabel}>Skills & Services</Text>
                  <Text style={styles.helperText}>Select the services you can provide (select at least one)</Text>
                  <View style={styles.skillsGrid}>
                    {serviceCategories.map((skill) => (
                      <TouchableOpacity
                        key={skill}
                        style={[
                          styles.skillChip,
                          selectedSkills.includes(skill) && styles.skillChipActive,
                        ]}
                        onPress={() => toggleSkill(skill)}
                      >
                        <Text
                          style={[
                            styles.skillChipText,
                            selectedSkills.includes(skill) && styles.skillChipTextActive,
                          ]}
                        >
                          {skill}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  {selectedSkills.length > 0 && (
                    <Text style={styles.selectedCountText}>
                      {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                    </Text>
                  )}
                </View>
              )}

              {userType === 'partner' && (
                <View style={styles.partnerFieldsContainer}>
                  <Text style={styles.sectionTitle}>Organization Details</Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Organization Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter organization name"
                      value={organizationName}
                      onChangeText={setOrganizationName}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Company Phone *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Company phone number"
                      value={companyPhone}
                      onChangeText={setCompanyPhone}
                      keyboardType="phone-pad"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Company Address *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Company address"
                      value={companyAddress}
                      onChangeText={setCompanyAddress}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Healthcare License Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="License number"
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Healthcare Category *</Text>
                    <View style={styles.pickerContainer}>
                      {healthcareCategories.map((category) => (
                        <TouchableOpacity
                          key={category}
                          style={[
                            styles.categoryChip,
                            healthcareCategory === category && styles.categoryChipActive,
                          ]}
                          onPress={() => setHealthcareCategory(category)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              healthcareCategory === category && styles.categoryChipTextActive,
                            ]}
                          >
                            {category}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Representative Details</Text>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Representative Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Full name of representative"
                      value={representativeName}
                      onChangeText={setRepresentativeName}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Representative Address *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Representative address"
                      value={representativeAddress}
                      onChangeText={setRepresentativeAddress}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Job Role *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Director, Manager"
                      value={representativeJobRole}
                      onChangeText={setRepresentativeJobRole}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              )}
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
            {!isLogin && (
              <Text style={styles.helperText}>
                Must be at least 8 characters
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  userTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  userTypeButtonActive: {
    borderColor: '#FF6B00',
    backgroundColor: '#FF6B0015',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
  },
  userTypeTextActive: {
    color: '#FF6B00',
    fontWeight: 'bold',
  },
  userTypeDesc: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  skillsContainer: {
    marginBottom: 20,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  skillChipText: {
    fontSize: 13,
    color: '#666',
  },
  skillChipTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  selectedCountText: {
    fontSize: 12,
    color: '#FF6B00',
    marginTop: 8,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  switchText: {
    color: '#FF6B00',
    fontSize: 15,
    fontWeight: '600',
  },
  partnerFieldsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  categoryChipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});