import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminRedirect() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.message}>
        The admin dashboard is a separate web application.
      </Text>
      <Text style={styles.info}>
        To access the admin panel, please use:
      </Text>
      <Text style={styles.url}>
        http://localhost:3001/Admin
      </Text>
      <Text style={styles.note}>
        (Available when running locally)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  url: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
    marginBottom: 10,
  },
  note: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
