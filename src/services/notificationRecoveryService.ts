import { NativeModules, Platform } from 'react-native';
import { RecoveredChat, RecoveredMessage } from '@/types/status';

const { NotificationRecoveryModule } = NativeModules;

export class NotificationRecoveryService {
  /**
   * Check if notification listener permission is granted
   */
  public static async isPermissionGranted(): Promise<boolean> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return false;
    }
    try {
      return await NotificationRecoveryModule.isNotificationAccessGranted();
    } catch (e) {
      console.error('Error checking notification access:', e);
      return false;
    }
  }

  /**
   * Open Android Notification Listener Access settings screen
   */
  public static async openSettings(): Promise<void> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return;
    }
    try {
      await NotificationRecoveryModule.openNotificationAccessSettings();
    } catch (e) {
      console.error('Error opening notification access settings:', e);
    }
  }

  /**
   * Get all recovered chats
   */
  public static async getChats(): Promise<RecoveredChat[]> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return [];
    }
    try {
      const raw = await NotificationRecoveryModule.getChats();
      if (!raw || !Array.isArray(raw)) return [];
      return raw as RecoveredChat[];
    } catch (e) {
      console.error('Error fetching recovered chats:', e);
      return [];
    }
  }

  /**
   * Get all messages for a specific sender/chat
   */
  public static async getChatMessages(senderName: string): Promise<RecoveredMessage[]> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return [];
    }
    try {
      const raw = await NotificationRecoveryModule.getChatMessages(senderName);
      if (!raw || !Array.isArray(raw)) return [];
      return raw as RecoveredMessage[];
    } catch (e) {
      console.error('Error fetching chat messages:', e);
      return [];
    }
  }

  /**
   * Delete a chat history
   */
  public static async deleteChat(senderName: string): Promise<boolean> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return false;
    }
    try {
      return await NotificationRecoveryModule.deleteChat(senderName);
    } catch (e) {
      console.error('Error deleting chat:', e);
      return false;
    }
  }

  /**
   * Clear all chats
   */
  public static async clearAll(): Promise<boolean> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return false;
    }
    try {
      return await NotificationRecoveryModule.clearAllChats();
    } catch (e) {
      console.error('Error clearing all chats:', e);
      return false;
    }
  }

  /**
   * Add sample messages for instant demo
   */
  public static async seedDemo(): Promise<void> {
    if (Platform.OS !== 'android' || !NotificationRecoveryModule) {
      return;
    }
    try {
      await NotificationRecoveryModule.seedSampleMessages();
    } catch (e) {
      console.error('Error seeding demo messages:', e);
    }
  }
}
