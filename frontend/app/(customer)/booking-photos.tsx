import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function BookingPhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const bookingId = params.bookingId as string;

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/photos`);
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (photoType: 'before' | 'after') => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your photo library to upload images');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Compress to reduce size
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri, photoType);
    }
  };

  const takePhoto = async (photoType: 'before' | 'after') => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera access to take photos');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      uploadPhoto(result.assets[0].uri, photoType);
    }
  };

  const uploadPhoto = async (uri: string, photoType: 'before' | 'after') => {
    setUploading(true);
    try {
      // Convert image to base64
      const response = await fetch(uri);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Upload to backend
        const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const uploadResponse = await fetch(`${API_URL}/api/bookings/${bookingId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId,
            photo_data: base64data,
            photo_type: photoType,
            description: `${photoType} photo`
          })
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload photo');
        }

        Alert.alert('Success', 'Photo uploaded successfully');
        loadPhotos(); // Reload photos
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showPhotoOptions = (photoType: 'before' | 'after') => {
    Alert.alert(
      'Add Photo',
      'Choose how to add your photo',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(photoType)
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImage(photoType)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const beforePhotos = photos.filter(p => p.photo_type === 'before');
  const afterPhotos = photos.filter(p => p.photo_type === 'after');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text style={styles.loadingText}>Loading photos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Photos</Text>
      </View>

      <View style={styles.content}>
        {/* Before Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Before Photos</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => showPhotoOptions('before')}
              disabled={uploading}
            >
              <Ionicons name="add-circle" size={24} color="#FF6B00" />
            </TouchableOpacity>
          </View>

          {beforePhotos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="images-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No before photos</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {beforePhotos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.photo_data }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoDate}>
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* After Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>After Photos</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => showPhotoOptions('after')}
              disabled={uploading}
            >
              <Ionicons name="add-circle" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>

          {afterPhotos.length === 0 ? (
            <View style={styles.emptyPhotos}>
              <Ionicons name="images-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No after photos</Text>
            </View>
          ) : (
            <View style={styles.photosGrid}>
              {afterPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: photo.photo_data }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.photoDate}>
                    {new Date(photo.uploaded_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text style={styles.uploadingText}>Uploading photo...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
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
    color: '#111827',
  },
  addButton: {
    padding: 4,
  },
  emptyPhotos: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  photoDate: {
    fontSize: 12,
    color: '#6B7280',
    padding: 8,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
});
