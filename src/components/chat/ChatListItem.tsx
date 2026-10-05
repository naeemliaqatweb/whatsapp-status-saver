import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RecoveredChat } from '@/types/status';

interface ChatListItemProps {
  chat: RecoveredChat;
  onPress: (chat: RecoveredChat) => void;
  onLongPress?: (chat: RecoveredChat) => void;
}

const AVATAR_COLORS = [
  '#075E54',
  '#128C7E',
  '#25D366',
  '#00897B',
  '#0288D1',
  '#5C6BC0',
  '#8E24AA',
  '#D81B60',
  '#E53935',
  '#FB8C00',
];

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onPress,
  onLongPress,
}) => {
  // Generate consistent color based on sender name
  const colorIndex = Math.abs(
    chat.senderName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % AVATAR_COLORS.length;
  const avatarBg = AVATAR_COLORS[colorIndex];

  // Get initials (max 2 characters)
  const initials = chat.senderName
    .split(' ')
    .map((w) => w.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isBusiness = chat.appType === 'business';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(chat)}
      onLongPress={() => onLongPress && onLongPress(chat)}
      style={styles.container}
    >
      {/* Contact Avatar Circle */}
      <View style={[styles.avatarContainer, { backgroundColor: avatarBg }]}>
        <Text style={styles.avatarText}>{initials || '?'}</Text>
        {isBusiness && (
          <View style={styles.businessBadge}>
            <Text style={styles.businessBadgeText}>B</Text>
          </View>
        )}
      </View>

      {/* Chat Details */}
      <View style={styles.contentContainer}>
        <View style={styles.topRow}>
          <Text style={styles.senderName} numberOfLines={1}>
            {chat.senderName}
          </Text>
          <Text
            style={[
              styles.timeText,
              chat.isDeleted && styles.timeDeletedText,
            ]}
          >
            {chat.timeAgo}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          {chat.isDeleted ? (
            <View style={styles.deletedRow}>
              <View style={styles.deletedIconPill}>
                <Icon name="delete" size={13} color="#D32F2F" />
                <Text style={styles.deletedLabel}>Deleted Msg:</Text>
              </View>
              <Text style={styles.deletedMessagePreview} numberOfLines={1}>
                {chat.lastMessage}
              </Text>
            </View>
          ) : (
            <Text style={styles.messagePreview} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
          )}

          {/* Badges on right: Total / Deleted count */}
          <View style={styles.badgesContainer}>
            {chat.deletedCount > 0 && (
              <View style={styles.deletedCountBadge}>
                <Icon name="delete" size={10} color="#FFFFFF" />
                <Text style={styles.deletedCountText}>{chat.deletedCount}</Text>
              </View>
            )}
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{chat.totalMessages}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: PALETTE.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    ...TYPOGRAPHY.titleMedium,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  businessBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#00796B',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  businessBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 16,
    fontWeight: '700',
    color: PALETTE.onSurface,
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    ...TYPOGRAPHY.labelSmall,
    fontSize: 11,
    color: PALETTE.onSurfaceVariant,
    fontWeight: '500',
  },
  timeDeletedText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: PALETTE.onSurfaceVariant,
    flex: 1,
    marginRight: 8,
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  deletedIconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: 4,
  },
  deletedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D32F2F',
    marginLeft: 2,
  },
  deletedMessagePreview: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 10,
    marginRight: 4,
  },
  deletedCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  totalBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  totalBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: PALETTE.onSurfaceVariant,
  },
});
