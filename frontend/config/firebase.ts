import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration for ExperTrait
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyBYourActualAPIKey",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "expertrait-solutions-limited.firebaseapp.com",
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL || "https://expertrait-solutions-limited-default-rtdb.firebaseio.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "expertrait-solutions-limited",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "expertrait-solutions-limited.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1009839252274",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1009839252274:android:39b5a85069e0703288ad2b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { app, database };
