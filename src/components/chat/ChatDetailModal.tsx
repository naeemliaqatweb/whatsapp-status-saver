import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { RecoveredChat, RecoveredMessage } from '@/types/status';
import { NotificationRecoveryService } from '@/services/notificationRecoveryService';

interface ChatDetailModalProps {
  visible: boolean;
  chat: RecoveredChat | null;
  onClose: () => void;
  onDeleteChat: (chat: RecoveredChat) => void;
}

export const ChatDetailModal: React.FC<ChatDetailModalProps> = ({
  visible,
  chat,
  onClose,
  onDeleteChat,
}) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<RecoveredMessage[]>([]);

  // Exact matching safe top padding ensuring battery / time / wifi status bar doesn't overlap
  const safeTopPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20
  );

  useEffect(() => {
    if (visible && chat) {
      loadMessages();
    }
  }, [visible, chat]);

  const loadMessages = async () => {
    if (!chat) return;
    try {
      const msgs = await NotificationRecoveryService.getChatMessages(chat.senderName);
      setMessages(msgs);
    } catch (e) {
      console.error('Error loading chat messages:', e);
    }
  };

  const handleOpenInWhatsApp = async () => {
    if (!chat) return;
    const isBusiness = chat.appType === 'business';
    const scheme = isBusiness ? 'whatsapp-business://app' : 'whatsapp://app';
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
      } else {
        Alert.alert('Open WhatsApp', 'Please open WhatsApp directly to respond to this message.');
      }
    } catch (e) {
      // fallback
    }
  };

  const handleDeleteConfirm = () => {
    if (!chat) return;
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete all recovered messages for "${chat.senderName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteChat(chat);
            onClose();
          },
        },
      ]
    );
  };

  if (!chat) return null;

  const isBusiness = chat.appType === 'business';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* WhatsApp Chat Room Top Header with safe status bar padding */}
        <View style={[styles.headerContainer, { paddingTop: safeTopPadding + 8 }]}>
          <View style={styles.topBarRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.backButton}
              accessibilityLabel="Back"
            >
              <Icon name="arrow_back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Contact Avatar & Info */}
            <View style={styles.headerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {chat.senderName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.titleColumn}>
                <Text style={styles.senderTitle} numberOfLines={1}>
                  {chat.senderName}
                </Text>
                <Text style={styles.senderSubtitle}>
                  {isBusiness ? 'WhatsApp Business' : 'WhatsApp'} • {messages.length} messages
                </Text>
              </View>
            </View>

            {/* Top Actions: WhatsApp App Link & Delete */}
            <View style={styles.headerActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleOpenInWhatsApp}
                style={styles.headerIconButton}
                accessibilityLabel="Open in WhatsApp"
              >
                <Icon
                  name={isBusiness ? 'business' : 'whatsapp'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDeleteConfirm}
                style={styles.headerIconButton}
                accessibilityLabel="Delete Conversation"
              >
                <Icon name="delete" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* WhatsApp Chat Wallpaper Background */}
        <View style={styles.chatContainer}>
          {/* Privacy & Info Banner */}
          <View style={styles.encryptionBanner}>
            <Icon name="security" size={14} color="#856404" />
            <Text style={styles.encryptionText}>
              Recovered from notification history. Messages are stored 100% locally on your phone.
            </Text>
          </View>

          {/* Message List */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isDeleted = item.isDeleted;
              return (
                <View
                  style={[
                    styles.messageBubble,
                    isDeleted ? styles.deletedBubble : styles.normalBubble,
                  ]}
                >
                  {isDeleted && (
                    <View style={styles.deletedHeaderTag}>
                      <Icon name="delete" size={12} color="#D32F2F" />
                      <Text style={styles.deletedTagText}>
                        🚫 This message was deleted by sender
                      </Text>
                    </View>
                  )}

                  <Text
                    style={[
                      styles.messageText,
                      isDeleted && styles.deletedMessageText,
                    ]}
                  >
                    {item.text}
                  </Text>

                  <View style={styles.messageFooter}>
                    <Text style={styles.timestampText}>
                      {item.timeFormatted || item.timeAgo}
                    </Text>
                    <Icon name="done_all" size={14} color={isDeleted ? '#D32F2F' : '#34B7F1'} />
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#075E54',
  },
  headerContainer: {
    backgroundColor: '#075E54',
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 6,
    marginRight: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#128C7E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  titleColumn: {
    flex: 1,
  },
  senderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  senderSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 2,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ECE5DD', // Classic WhatsApp wallpaper background color
  },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  encryptionText: {
    fontSize: 11,
    color: '#856404',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    paddingTop: 8,
  },
  messageBubble: {
    maxWidth: '85%',
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderTopLeftRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    elevation: 2,
  },
  normalBubble: {
    backgroundColor: '#FFFFFF',
  },
  deletedBubble: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deletedHeaderTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  deletedTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D32F2F',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#303030',
    lineHeight: 20,
  },
  deletedMessageText: {
    color: '#B71C1C',
    fontWeight: '600',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 10,
    color: '#8696A0',
    marginRight: 4,
  },
});
