# Push Notifications & In-App Chat - Setup Guide

## Overview
This document explains how to set up and use the Push Notifications and In-App Chat features in the ExperTrait mobile app.

---

## 🔔 Push Notifications Setup

### Features Implemented:
- ✅ Expo Notifications integration
- ✅ Push token registration on login
- ✅ Backend endpoints for push notification management
- ✅ Notification history storage
- ✅ Badge count management

### Setup Steps:

#### 1. Expo Configuration (Already Done)
The app is configured to use Expo Notifications. The package `expo-notifications` has been installed.

#### 2. Firebase Configuration Required
To enable push notifications on physical devices, you need an Expo project with push notification credentials:

```bash
# Install Expo CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure push notifications
eas credentials
```

#### 3. Backend APIs (Already Implemented)

**Register Push Token:**
```
POST /api/notifications/register
Body: {
  "user_id": "user_id_here",
  "user_type": "customer" | "professional" | "partner",
  "push_token": "ExponentPushToken[xxx]",
  "platform": "ios" | "android"
}
```

**Get User Notifications:**
```
GET /api/notifications/{user_id}?limit=50
Response: {
  "notifications": [...],
  "total": 10,
  "unread": 5
}
```

**Mark Notification as Read:**
```
POST /api/notifications/{notification_id}/read
```

**Mark All as Read:**
```
POST /api/notifications/{user_id}/read-all
```

#### 4. Sending Push Notifications from Backend

The `send_push_notification()` function is available in `server.py`:

```python
await send_push_notification(
    user_id="user123",
    title="New Booking!",
    body="You have a new service request",
    data={"bookingId": "booking123", "type": "new_booking"}
)
```

**Use Cases:**
- Booking created → Notify handler
- Booking accepted → Notify customer
- Job started → Notify customer
- Job completed → Notify both parties
- Payment received → Notify handler

#### 5. Frontend Implementation (Already Integrated)

The notification service is integrated into `AuthContext.tsx` and automatically registers push tokens when users log in.

**Available Methods:**
```typescript
import notificationService from '../services/notificationService';

// Register for notifications
await notificationService.registerForPushNotifications();

// Save token to backend
await notificationService.savePushTokenToBackend(userId, userType);

// Set up listeners
const cleanup = notificationService.setupNotificationListeners(
  (notification) => {
    // Handle notification received
  },
  (response) => {
    // Handle notification tapped
  }
);

// Send local notification
await notificationService.sendLocalNotification(
  "Title",
  "Body",
  { data: "value" }
);

// Badge management
await notificationService.setBadgeCount(5);
await notificationService.clearBadge();
```

#### 6. Testing Push Notifications

**On Simulator/Emulator:**
Push notifications don't work on simulators. Use local notifications for testing:
```typescript
await notificationService.sendLocalNotification(
  "Test",
  "This is a test notification"
);
```

**On Physical Device:**
1. Build the app with EAS Build
2. Install on device
3. Log in to register push token
4. Trigger a notification from backend
5. Check notification appears

---

## 💬 In-App Chat Setup

### Features Implemented:
- ✅ Real-time chat using Firebase Realtime Database
- ✅ Chat linked to bookings
- ✅ Unread message tracking
- ✅ Message history
- ✅ Auto-scroll to latest message
- ✅ Keyboard handling

### Setup Steps:

#### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable **Realtime Database**:
   - Go to Realtime Database
   - Click "Create Database"
   - Start in **test mode** (for development)
   - Copy the database URL

4. Get Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps"
   - Click "Add app" → Web
   - Copy the configuration object

#### 2. Update Environment Variables

Add to `/app/frontend/.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

#### 3. Firebase Security Rules

Update your Firebase Realtime Database rules:
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

**For Production:** Implement proper authentication-based rules.

#### 4. Chat Screen Usage

Navigate to chat from booking detail screen:
```typescript
router.push({
  pathname: '/(customer)/booking-chat',
  params: {
    bookingId: 'booking_id',
    professionalId: 'handler_id',
    professionalName: 'Handler Name'
  }
});
```

#### 5. Chat Service API

```typescript
import chatService from '../services/chatService';

// Send message
await chatService.sendMessage(
  bookingId,
  userId,
  userName,
  'customer', // or 'professional'
  'Hello!'
);

// Listen to messages (returns cleanup function)
const unsubscribe = chatService.listenToMessages(bookingId, (messages) => {
  setMessages(messages);
});

// Mark as read
await chatService.markMessagesAsRead(bookingId, userId, 'customer');

// Get unread count
const count = await chatService.getUnreadCount(bookingId, 'customer');

// Get all chats for a user
const chats = await chatService.getUserChats(userId, 'customer');

// Initialize chat
await chatService.initializeChatMetadata(
  bookingId,
  customerId,
  customerName,
  professionalId,
  professionalName
);
```

#### 6. Firebase Database Structure

```
chats/
  {bookingId}/
    messages/
      {messageId}/
        bookingId: string
        senderId: string
        senderName: string
        senderType: "customer" | "professional"
        message: string
        timestamp: number
        read: boolean
    metadata/
      bookingId: string
      customerId: string
      customerName: string
      professionalId: string
      professionalName: string
      lastMessage: string
      lastMessageTimestamp: number
      unreadCountCustomer: number
      unreadCountProfessional: number
```

---

## 🧪 Testing Checklist

### Push Notifications:
- [ ] User registers/logs in
- [ ] Push token is saved to backend
- [ ] Create a booking and check if handler receives notification
- [ ] Accept booking and check if customer receives notification
- [ ] Test notification tapping (opens correct screen)
- [ ] Test badge count updates

### In-App Chat:
- [ ] Customer opens chat from booking detail
- [ ] Messages are sent in real-time
- [ ] Messages appear for both parties instantly
- [ ] Unread count updates correctly
- [ ] Mark as read functionality works
- [ ] Chat persists after closing and reopening
- [ ] Keyboard doesn't cover input field
- [ ] Auto-scroll to latest message works

---

## 📝 Notes

### Push Notifications:
- **Simulators:** Push notifications don't work. Use local notifications for testing.
- **Expo Go:** Limited push notification support. Build standalone app for full functionality.
- **Production:** Implement the actual Expo Push API call in `send_push_notification()` function.

### In-App Chat:
- **Firebase Free Tier:** Sufficient for development and small-scale production
- **Security:** Update Firebase rules before production deployment
- **Scalability:** Firebase Realtime Database scales well for chat applications
- **Offline Support:** Firebase handles offline mode automatically

---

## 🚀 Integration Examples

### Trigger Notification on Booking Created:
```python
# In booking creation endpoint
booking_result = await db.bookings.insert_one(booking_dict)

# Notify handler
await send_push_notification(
    user_id=handler_id,
    title="New Job Request!",
    body=f"New {service_name} request from {customer_name}",
    data={
        "type": "new_booking",
        "bookingId": str(booking_result.inserted_id),
        "screen": "/(professional)/jobs"
    }
)
```

### Open Chat from Booking Detail:
```typescript
<TouchableOpacity
  style={styles.chatButton}
  onPress={() => router.push({
    pathname: '/(customer)/booking-chat',
    params: {
      bookingId: booking.id,
      professionalId: booking.professional_id,
      professionalName: booking.professional_name
    }
  })}
>
  <Ionicons name="chatbubbles" size={20} color="#FFF" />
  <Text style={styles.chatButtonText}>Chat</Text>
</TouchableOpacity>
```

---

## 🆘 Troubleshooting

### Push Notifications Not Working:
1. Check if running on physical device (not simulator)
2. Verify push token is registered: Check MongoDB `push_tokens` collection
3. Check device notification permissions
4. Verify Expo project is configured for push notifications

### Chat Not Working:
1. Verify Firebase configuration in `/app/frontend/config/firebase.ts`
2. Check Firebase console for database activity
3. Verify Firebase rules allow read/write
4. Check browser/app console for Firebase errors
5. Ensure environment variables are set correctly

### Messages Not Real-time:
1. Check Firebase connection status
2. Verify listener is properly attached
3. Check for Firebase quota limits
4. Ensure cleanup function is called on unmount

---

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)

---

## ✅ Production Checklist

Before deploying to production:

**Push Notifications:**
- [ ] Implement actual Expo Push API integration in backend
- [ ] Set up proper error handling and retry logic
- [ ] Configure notification channels for Android
- [ ] Test on multiple devices and OS versions
- [ ] Implement notification scheduling if needed

**In-App Chat:**
- [ ] Update Firebase security rules for authentication
- [ ] Implement message encryption for sensitive data
- [ ] Set up Firebase backup/export
- [ ] Monitor Firebase usage and costs
- [ ] Implement message moderation if needed
- [ ] Add typing indicators (optional)
- [ ] Add message delivery/read receipts (optional)

---

## 🎉 You're All Set!

Both Push Notifications and In-App Chat are now integrated into your ExperTrait app. Follow the setup steps above and refer back to this guide as needed.

For questions or issues, check the troubleshooting section or review the implementation in:
- `/app/frontend/services/notificationService.ts`
- `/app/frontend/services/chatService.ts`
- `/app/frontend/config/firebase.ts`
- `/app/frontend/app/(customer)/booking-chat.tsx`
- `/app/backend/server.py` (search for "PUSH NOTIFICATIONS")
