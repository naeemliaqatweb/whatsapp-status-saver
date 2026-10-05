import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  AppState,
} from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RecoveredChat, WhatsAppType } from '@/types/status';
import { NotificationRecoveryService } from '@/services/notificationRecoveryService';
import { ChatListItem } from './ChatListItem';
import { ChatDetailModal } from './ChatDetailModal';

interface ChatsRecoveryViewProps {
  appType: WhatsAppType;
  searchQuery?: string;
  onShowToast: (msg: string, sub?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatsRecoveryView: React.FC<ChatsRecoveryViewProps> = ({
  appType,
  searchQuery = '',
  onShowToast,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(true);
  const [chats, setChats] = useState<RecoveredChat[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedChat, setSelectedChat] = useState<RecoveredChat | null>(null);
  const [detailVisible, setDetailVisible] = useState<boolean>(false);

  const checkPermissionAndLoad = useCallback(async () => {
    const granted = await NotificationRecoveryService.isPermissionGranted();
    setHasPermission(granted);
    if (granted) {
      const data = await NotificationRecoveryService.getChats();
      setChats(data);
    } else {
      setChats([]);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    checkPermissionAndLoad();

    // Check on app resume
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkPermissionAndLoad();
      }
    });

    return () => {
      sub.remove();
    };
  }, [checkPermissionAndLoad]);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkPermissionAndLoad();
  };

  const handleOpenSettings = async () => {
    await NotificationRecoveryService.openSettings();
    onShowToast('Notification Access', 'Enable "Status Saver" in notification access settings to start recovering messages.', 'info');
  };

  const handleAddSampleData = async () => {
    await NotificationRecoveryService.seedDemo();
    await checkPermissionAndLoad();
    onShowToast('Sample Data Added', 'Demo WhatsApp chats loaded to preview recovery feature!', 'success');
  };

  const handleDeleteChat = async (chat: RecoveredChat) => {
    await NotificationRecoveryService.deleteChat(chat.senderName);
    onShowToast('Chat Deleted', `Messages for ${chat.senderName} removed.`, 'info');
    await checkPermissionAndLoad();
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Recovered Messages',
      'Are you sure you want to clear all recovered chat histories?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await NotificationRecoveryService.clearAll();
            onShowToast('All Cleared', 'Recovered chats cleared.', 'info');
            await checkPermissionAndLoad();
          },
        },
      ]
    );
  };

  // Filter chats by appType and searchQuery
  const filteredChats = chats.filter((c) => {
    const matchesApp = c.appType === appType;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.senderName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q);
      return matchesApp && matchesSearch;
    }
    return matchesApp;
  });

  return (
    <View style={styles.container}>
      {/* If Notification permission is NOT enabled */}
      {!hasPermission ? (
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconWrapper}>
            <Icon name="notifications" size={32} color="#075E54" />
          </View>
          <Text style={styles.permissionTitle}>
            Enable Deleted Messages Recovery
          </Text>
          <Text style={styles.permissionDesc}>
            Status Saver needs Notification Access to automatically backup incoming WhatsApp messages and reveal deleted messages!
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenSettings}
            style={styles.enableButton}
          >
            <Icon name="security" size={18} color="#FFFFFF" />
            <Text style={styles.enableButtonText}>Enable Notification Access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddSampleData}
            style={styles.sampleButton}
          >
            <Text style={styles.sampleButtonText}>✨ Try Demo Sample Chats</Text>
          </TouchableOpacity>
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="chat_bubble" size={42} color={PALETTE.accentGreen} />
          </View>
          <Text style={styles.emptyTitle}>
            No Recovered Messages Yet
          </Text>
          <Text style={styles.emptyDesc}>
            Incoming {appType === 'business' ? 'WhatsApp Business' : 'WhatsApp'} messages will automatically be recorded here. When someone deletes a message, it will be saved!
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAddSampleData}
            style={styles.sampleButtonEmpty}
          >
            <Text style={styles.sampleButtonText}>✨ Load Demo WhatsApp Chats</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem
              chat={item}
              onPress={(chat) => {
                setSelectedChat(chat);
                setDetailVisible(true);
              }}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PALETTE.accentGreen, PALETTE.primaryContainer]}
              tintColor={PALETTE.accentGreen}
            />
          }
          ListFooterComponent={
            <View style={styles.footerRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleClearAll}
                style={styles.clearAllBtn}
              >
                <Icon name="delete" size={16} color="#D32F2F" />
                <Text style={styles.clearAllText}>Clear All History</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* WhatsApp Chat Room Detail View */}
      <ChatDetailModal
        visible={detailVisible}
        chat={selectedChat}
        onClose={() => {
          setDetailVisible(false);
          setSelectedChat(null);
        }}
        onDeleteChat={handleDeleteChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.surface,
  },
  permissionCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  permissionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 17,
    fontWeight: '700',
    color: '#075E54',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075E54',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    width: '100%',
    shadowColor: '#075E54',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  sampleButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  sampleButtonEmpty: {
    marginTop: 16,
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  sampleButtonText: {
    color: '#075E54',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...TYPOGRAPHY.titleMd,
    fontSize: 18,
    fontWeight: '700',
    color: PALETTE.onSurface,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    ...TYPOGRAPHY.bodyMd,
    fontSize: 13,
    color: PALETTE.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 19,
  },
  footerRow: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
  },
  clearAllText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
});
