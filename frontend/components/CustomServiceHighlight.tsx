import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CustomServiceHighlight() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="construct" size={40} color="#FF6B00" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Need Something Unique?</Text>
          <Text style={styles.description}>
            Can't find what you're looking for? Create a custom service request
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(customer)/custom-task')}
      >
        <Text style={styles.buttonText}>Learn More</Text>
        <Ionicons name="arrow-forward" size={18} color="#FF6B00" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FF6B00',
    borderStyle: 'dashed',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6B0020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#FF6B0020',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FF6B00',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});