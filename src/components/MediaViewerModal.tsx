import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { StatusVideoPlayer } from '@/components/ui/StatusVideoPlayer';
import { ToastNotification, ToastConfig } from '@/components/ui/ToastNotification';
import { StatusMediaItem } from '@/types/status';
import { StatusScannerService } from '@/services/statusScannerService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MediaViewerModalProps {
  visible: boolean;
  media: StatusMediaItem | null;
  onClose: () => void;
  onToggleSave: (item: StatusMediaItem) => void;
  onDelete?: (item: StatusMediaItem) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  visible,
  media,
  onClose,
  onToggleSave,
  onDelete,
  onNext,
  onPrev,
}) => {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const showToast = (message: string, subMessage?: string, type: ToastConfig['type'] = 'success') => {
    setToastConfig({ message, subMessage, type });
    setToastVisible(true);
  };

  useEffect(() => {
    if (media) {
      setIsPlaying(true);
    }
  }, [media?.id]);

  if (!media) return null;

  const isVideo = media.type === 'video';
  const isSaved = media.isSaved;

  const handleSavePress = () => {
    onToggleSave(media);
    if (!isSaved) {
      showToast('Status Saved! 🎉', 'Saved to your Gallery (StatusSaver)', 'success');
    } else {
      showToast('Status Removed', 'Removed from saved collection', 'info');
    }
  };

  const handleSharePress = async () => {
    showToast('Opening Share Sheet...', undefined, 'info');
    await StatusScannerService.shareMedia(media);
  };

  const handleRepostPress = async () => {
    showToast('Reposting to WhatsApp...', undefined, 'success');
    await StatusScannerService.repostToWhatsApp(media, media.appSource);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Status',
      'Are you sure you want to remove this saved status from your gallery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (onDelete) onDelete(media);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <StatusBar barStyle="light-content" />

        {/* Top Notify Popup */}
        <ToastNotification
          visible={toastVisible}
          config={toastConfig}
          onDismiss={() => setToastVisible(false)}
        />

        {/* Top Header Overlay Bar */}
        <View style={[styles.topBarContainer, { paddingTop: Math.max(insets.top, 24) }]}>
          <View style={styles.topBar}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.backButtonCircle}
              accessibilityLabel="Back"
            >
              <Icon name="arrow_back" size={24} color={PALETTE.white} />
            </TouchableOpacity>

            <View style={styles.topInfo}>
              <Text style={styles.mediaTitle}>
                {media.appSource === 'business' ? 'WA Business' : 'WhatsApp'}{' '}
                {isVideo ? 'Video' : 'Status'}
              </Text>
              <Text style={styles.mediaTime}>{media.timeAgo}</Text>
            </View>

            {onDelete && isSaved && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDeletePress}
                style={styles.deleteButtonCircle}
                accessibilityLabel="Delete"
              >
                <Icon name="delete" size={20} color={PALETTE.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Media Presentation Viewport */}
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={styles.videoWrapper}>
              <StatusVideoPlayer
                sourceUri={media.filePath || media.uri}
                paused={!isPlaying}
                loop={true}
                style={styles.fullVideo}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsPlaying(!isPlaying)}
                style={styles.videoPlayOverlay}
              >
                {!isPlaying && (
                  <View style={styles.videoPlayCircle}>
                    <Icon
                      name="play"
                      size={36}
                      color={PALETTE.white}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <Image
              source={{ uri: media.uri }}
              style={styles.fullMedia}
              resizeMode="contain"
            />
          )}

          {/* Left / Right Quick Navigator Touch Targets */}
          {onPrev && (
            <TouchableOpacity
              activeOpacity={0.4}
              onPress={onPrev}
              style={styles.leftNavArrow}
            >
              <View style={styles.navArrowCircle}>
                <Icon name="arrow_back" size={20} color={PALETTE.white} />
              </View>
            </TouchableOpacity>
          )}
          {onNext && (
            <TouchableOpacity
              activeOpacity={0.4}
              onPress={onNext}
              style={styles.rightNavArrow}
            >
              <View
                style={[
                  styles.navArrowCircle,
                  { transform: [{ rotate: '180deg' }] },
                ]}
              >
                <Icon name="arrow_back" size={20} color={PALETTE.white} />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Glassmorphism Action Bar */}
        <View style={[styles.bottomSafeArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.bottomBarContainer}>
            {/* Save Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSavePress}
              style={[
                styles.actionButton,
                isSaved ? styles.savedActiveBtn : styles.saveNormalBtn,
              ]}
            >
              <Icon
                name={isSaved ? 'check_circle' : 'download'}
                size={22}
                color={PALETTE.white}
              />
              <Text style={styles.actionLabel}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSharePress}
              style={styles.actionButton}
            >
              <Icon name="share" size={22} color={PALETTE.white} />
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>

            {/* Repost Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRepostPress}
              style={[styles.actionButton, styles.repostHighlightBtn]}
            >
              <Icon name="repeat" size={22} color={PALETTE.white} />
              <Text style={styles.actionLabel}>Repost</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  topBarContainer: {
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  mediaTitle: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.white,
    fontWeight: '700',
  },
  mediaTime: {
    ...TYPOGRAPHY.bodySm,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  deleteButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(186, 26, 26, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000000',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  fullMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderWidth: 2,
    borderColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 4,
  },
  leftNavArrow: {
    position: 'absolute',
    left: 12,
    top: '45%',
    zIndex: 20,
    padding: 8,
  },
  rightNavArrow: {
    position: 'absolute',
    right: 12,
    top: '45%',
    zIndex: 20,
    padding: 8,
  },
  navArrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSafeArea: {
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    minWidth: 84,
  },
  saveNormalBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  savedActiveBtn: {
    backgroundColor: PALETTE.secondary,
  },
  repostHighlightBtn: {
    backgroundColor: PALETTE.accentGreen,
  },
  actionLabel: {
    ...TYPOGRAPHY.labelSm,
    color: PALETTE.white,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
