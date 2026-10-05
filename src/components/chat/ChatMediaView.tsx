import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { RecoveredMessage } from '@/types/status';

interface ChatMediaViewProps {
  message: RecoveredMessage;
  onOpenMedia?: (uri: string, type: 'image' | 'video') => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ChatMediaView: React.FC<ChatMediaViewProps> = ({
  message,
  onOpenMedia,
}) => {
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const { mediaType, mediaUri, isDeleted, text, mediaDuration } = message;

  // Voice Note or Audio
  if (mediaType === 'voice' || mediaType === 'audio' || text.includes('Voice message')) {
    return (
      <View style={styles.mediaContainer}>
        <VoiceMessagePlayer
          mediaUri={mediaUri}
          durationSeconds={mediaDuration || 8}
          isDeleted={isDeleted}
        />
      </View>
    );
  }

  // Image Photo Preview
  if (mediaType === 'image' || text.includes('Photo') || text.includes('📷')) {
    const hasRealUri = !!mediaUri && mediaUri.startsWith('file://');

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (hasRealUri && mediaUri) {
              setFullscreenVisible(true);
              onOpenMedia?.(mediaUri, 'image');
            }
          }}
          style={styles.imageCard}
        >
          {hasRealUri && mediaUri ? (
            <Image
              source={{ uri: mediaUri }}
              style={styles.imageThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={36} color={isDeleted ? '#D32F2F' : '#075E54'} />
              <Text style={styles.placeholderText}>
                {isDeleted ? 'Recovered Photo' : 'WhatsApp Photo'}
              </Text>
            </View>
          )}

          {isDeleted && (
            <View style={styles.deletedOverlayBadge}>
              <Icon name="delete" size={12} color="#FFFFFF" />
              <Text style={styles.deletedOverlayText}>Deleted</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Fullscreen Photo Viewer Modal */}
        {hasRealUri && mediaUri && (
          <Modal
            visible={fullscreenVisible}
            transparent={false}
            animationType="fade"
            onRequestClose={() => setFullscreenVisible(false)}
          >
            <SafeAreaView style={styles.fullscreenContainer}>
              <StatusBar backgroundColor="#000000" barStyle="light-content" />
              <View style={styles.fullscreenHeader}>
                <TouchableOpacity
                  onPress={() => setFullscreenVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="arrow_back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.fullscreenTitle}>{message.senderName}</Text>
              </View>

              <View style={styles.fullscreenImageWrapper}>
                <Image
                  source={{ uri: mediaUri }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </View>
    );
  }

  // Video Preview
  if (mediaType === 'video' || text.includes('Video') || text.includes('🎥')) {
    const hasRealUri = !!mediaUri && mediaUri.startsWith('file://');

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (hasRealUri && mediaUri) {
              onOpenMedia?.(mediaUri, 'video');
            }
          }}
          style={styles.videoCard}
        >
          {hasRealUri && mediaUri ? (
            <Image
              source={{ uri: mediaUri }}
              style={styles.imageThumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <View style={styles.playIconCircle}>
                <Icon name="play_arrow" size={32} color="#FFFFFF" />
              </View>
              <Text style={styles.placeholderText}>
                {isDeleted ? 'Recovered Video' : 'WhatsApp Video'}
              </Text>
            </View>
          )}

          {isDeleted && (
            <View style={styles.deletedOverlayBadge}>
              <Icon name="delete" size={12} color="#FFFFFF" />
              <Text style={styles.deletedOverlayText}>Deleted</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback to text
  return (
    <Text style={[styles.messageText, isDeleted && styles.deletedMessageText]}>
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    marginVertical: 2,
  },
  imageCard: {
    width: 220,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
  },
  videoCard: {
    width: 220,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#263238',
    position: 'relative',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E282D',
  },
  playIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 12,
    color: '#607D8B',
    fontWeight: '600',
    marginTop: 4,
  },
  deletedOverlayBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  deletedOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  closeButton: {
    padding: 6,
    marginRight: 12,
  },
  fullscreenTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  fullscreenImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
});
