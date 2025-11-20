import { database } from '../config/firebase';
import { ref, push, onValue, off, query, orderByChild, limitToLast, set, get } from 'firebase/database';

export interface ChatMessage {
  id?: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'professional';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ChatMetadata {
  bookingId: string;
  customerId: string;
  customerName: string;
  professionalId: string;
  professionalName: string;
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadCountCustomer: number;
  unreadCountProfessional: number;
}

class ChatService {
  // Send a message
  async sendMessage(
    bookingId: string,
    senderId: string,
    senderName: string,
    senderType: 'customer' | 'professional',
    message: string
  ): Promise<void> {
    try {
      const messagesRef = ref(database, `chats/${bookingId}/messages`);
      const newMessage: Omit<ChatMessage, 'id'> = {
        bookingId,
        senderId,
        senderName,
        senderType,
        message,
        timestamp: Date.now(),
        read: false,
      };

      await push(messagesRef, newMessage);

      // Update chat metadata
      await this.updateChatMetadata(bookingId, message, senderType);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Listen to messages in real-time
  listenToMessages(
    bookingId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    const messagesRef = query(
      ref(database, `chats/${bookingId}/messages`),
      orderByChild('timestamp'),
      limitToLast(100)
    );

    const listener = onValue(messagesRef, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key || undefined,
          ...childSnapshot.val(),
        });
      });
      callback(messages);
    });

    // Return cleanup function
    return () => {
      off(messagesRef);
    };
  }

  // Mark messages as read
  async markMessagesAsRead(
    bookingId: string,
    userId: string,
    userType: 'customer' | 'professional'
  ): Promise<void> {
    try {
      const messagesRef = ref(database, `chats/${bookingId}/messages`);
      const snapshot = await get(messagesRef);

      const updates: { [key: string]: any } = {};
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        // Mark as read if the message is from the other party
        if (message.senderId !== userId && !message.read) {
          updates[`${childSnapshot.key}/read`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        const messagesRefWithUpdates = ref(database, `chats/${bookingId}/messages`);
        await set(messagesRefWithUpdates, updates);
      }

      // Reset unread count
      const metadataRef = ref(database, `chats/${bookingId}/metadata`);
      if (userType === 'customer') {
        await set(ref(database, `chats/${bookingId}/metadata/unreadCountCustomer`), 0);
      } else {
        await set(ref(database, `chats/${bookingId}/metadata/unreadCountProfessional`), 0);
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Update chat metadata
  private async updateChatMetadata(
    bookingId: string,
    lastMessage: string,
    senderType: 'customer' | 'professional'
  ): Promise<void> {
    try {
      const metadataRef = ref(database, `chats/${bookingId}/metadata`);
      const snapshot = await get(metadataRef);
      const currentMetadata = snapshot.val() || {};

      const updates = {
        lastMessage: lastMessage.substring(0, 100),
        lastMessageTimestamp: Date.now(),
      };

      // Increment unread count for the receiver
      if (senderType === 'customer') {
        updates['unreadCountProfessional'] = (currentMetadata.unreadCountProfessional || 0) + 1;
      } else {
        updates['unreadCountCustomer'] = (currentMetadata.unreadCountCustomer || 0) + 1;
      }

      await set(metadataRef, { ...currentMetadata, ...updates });
    } catch (error) {
      console.error('Error updating chat metadata:', error);
    }
  }

  // Initialize chat metadata
  async initializeChatMetadata(
    bookingId: string,
    customerId: string,
    customerName: string,
    professionalId: string,
    professionalName: string
  ): Promise<void> {
    try {
      const metadataRef = ref(database, `chats/${bookingId}/metadata`);
      const snapshot = await get(metadataRef);

      if (!snapshot.exists()) {
        const metadata: ChatMetadata = {
          bookingId,
          customerId,
          customerName,
          professionalId,
          professionalName,
          lastMessage: '',
          lastMessageTimestamp: Date.now(),
          unreadCountCustomer: 0,
          unreadCountProfessional: 0,
        };
        await set(metadataRef, metadata);
      }
    } catch (error) {
      console.error('Error initializing chat metadata:', error);
    }
  }

  // Get unread count
  async getUnreadCount(bookingId: string, userType: 'customer' | 'professional'): Promise<number> {
    try {
      const field = userType === 'customer' ? 'unreadCountCustomer' : 'unreadCountProfessional';
      const unreadRef = ref(database, `chats/${bookingId}/metadata/${field}`);
      const snapshot = await get(unreadRef);
      return snapshot.val() || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get all chats for a user
  async getUserChats(userId: string, userType: 'customer' | 'professional'): Promise<ChatMetadata[]> {
    try {
      const chatsRef = ref(database, 'chats');
      const snapshot = await get(chatsRef);
      const chats: ChatMetadata[] = [];

      snapshot.forEach((childSnapshot) => {
        const metadata = childSnapshot.val().metadata;
        if (metadata) {
          const isUserChat =
            userType === 'customer'
              ? metadata.customerId === userId
              : metadata.professionalId === userId;

          if (isUserChat) {
            chats.push(metadata);
          }
        }
      });

      // Sort by last message timestamp
      chats.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
      return chats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }
}

export default new ChatService();
