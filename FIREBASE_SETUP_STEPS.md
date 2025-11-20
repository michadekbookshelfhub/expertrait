# 🔥 Firebase Setup - Next Steps

## ✅ What's Already Done:
- Firebase project credentials configured
- Firebase config file updated with your project details
- `.env` file partially configured with your Firebase project info

---

## 📋 What You Need to Do:

### Step 1: Get Firebase Web API Key

1. Go to [Firebase Console](https://console.firebase.google.com/project/expertrait-solutions-limited/settings/general)
2. Scroll down to "Your apps" section
3. You should see your Android and iOS apps listed
4. Click **"Add app"** → Select **"Web"** (</> icon)
5. Register the app with nickname: "ExperTrait Web"
6. Copy the **API Key** from the Firebase SDK snippet
7. Update `/app/frontend/.env` file:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy... (paste your key here)
   ```

### Step 2: Enable Firebase Realtime Database

1. Go to [Firebase Realtime Database](https://console.firebase.google.com/project/expertrait-solutions-limited/database)
2. Click **"Create Database"**
3. Choose location: **United States (us-central1)** (or closest to you)
4. Start in **"Test mode"** (for development)
5. Click **"Enable"**
6. Once created, copy the database URL (it will look like: `https://expertrait-solutions-limited-default-rtdb.firebaseio.com`)
7. Update `/app/frontend/.env` if the URL is different:
   ```env
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://expertrait-solutions-limited-default-rtdb.firebaseio.com
   ```

### Step 3: Configure Firebase Security Rules

1. In Firebase Realtime Database console, click on **"Rules"** tab
2. Replace the rules with:
   ```json
   {
     "rules": {
       "chats": {
         "$bookingId": {
           ".read": true,
           ".write": true,
           "messages": {
             ".indexOn": ["timestamp"]
           }
         }
       }
     }
   }
   ```
3. Click **"Publish"**

**Note:** These are permissive rules for development. For production, implement proper authentication-based rules.

### Step 4: Restart the Frontend

After updating the `.env` file with the Web API Key:

```bash
# The app will automatically pick up the new environment variables
# Just refresh your browser or restart Expo if needed
```

---

## 🧪 Testing the Chat Feature

### Test Steps:

1. **Login** as a customer (or create a new account)
2. **Create a booking** or find an existing one
3. **Navigate to booking detail** screen
4. You should see a **"Chat"** button
5. **Tap on Chat** to open the chat screen
6. **Send a message** - it should appear immediately
7. **Open another browser/device** and login as the professional
8. **Navigate to the same booking's chat**
9. **Messages should sync in real-time** ⚡

### Expected Behavior:
- ✅ Messages appear instantly for both users
- ✅ Unread count updates automatically
- ✅ Chat history persists across sessions
- ✅ Keyboard doesn't cover input field
- ✅ Auto-scrolls to latest message

---

## 🔔 Testing Push Notifications

Push notifications are already configured but require a physical device to test fully.

### On Web/Simulator:
```typescript
// Use local notifications for testing
import notificationService from './services/notificationService';

// Test local notification
await notificationService.sendLocalNotification(
  "Test Title",
  "This is a test notification",
  { data: "test" }
);
```

### On Physical Device:
1. Build the app with EAS Build
2. Install on device
3. Login
4. Push token will auto-register
5. Trigger a notification from backend
6. Check notification appears

---

## 📁 Files Updated:

1. **`/app/frontend/config/firebase.ts`** - Firebase configuration
2. **`/app/frontend/.env`** - Environment variables (partially configured)
3. **`/app/frontend/services/chatService.ts`** - Chat logic (ready)
4. **`/app/frontend/services/notificationService.ts`** - Notifications (ready)
5. **`/app/backend/server.py`** - Notification endpoints (ready)

---

## ⚠️ Important Notes:

### For Production:
1. **Update Firebase Rules:** Implement authentication-based security rules
2. **Secure API Keys:** Move sensitive keys to secure storage
3. **Enable App Check:** Protect your Firebase resources from abuse
4. **Set up billing alerts:** Monitor Firebase usage
5. **Implement rate limiting:** Prevent spam/abuse

### Current Status:
- ✅ Code is complete and ready
- ⚙️ Need Web API Key from Firebase Console
- ✅ Firebase project is configured
- ✅ Realtime Database will work once enabled

---

## 🆘 Troubleshooting:

### "Permission denied" error in chat:
- Check Firebase Database Rules are set to test mode
- Verify database URL is correct in `.env`

### Chat messages not appearing:
- Check browser console for Firebase errors
- Verify Firebase Database is created and enabled
- Check that the Web API Key is added to `.env`

### Firebase initialization error:
- Restart Expo: `sudo supervisorctl restart expo`
- Clear cache if needed
- Check all env variables are set

---

## 🎉 Once Complete:

After adding the Web API Key and enabling Realtime Database:

1. ✅ In-App Chat will work in real-time
2. ✅ Push Notifications will register tokens on login
3. ✅ All features will be fully functional

**Next:** Add the Web API Key to `.env` and enable Realtime Database, then test the chat feature!
