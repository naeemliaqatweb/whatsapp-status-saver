import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { StatusMediaItem } from '@/types/status';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPACING_GUTTER = 6;
const NUM_COLUMNS = 3;
const ITEM_SIZE =
  (SCREEN_WIDTH - SPACING.md * 2 - SPACING_GUTTER * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

interface MediaCardProps {
  item: StatusMediaItem;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onPress: (item: StatusMediaItem) => void;
  onLongPress: (item: StatusMediaItem) => void;
  onToggleSelect?: (item: StatusMediaItem) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  isSelected = false,
  isSelectionMode = false,
  onPress,
  onLongPress,
  onToggleSelect,
}) => {
  const isVideo = item.type === 'video';

  const handleCardPress = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(item);
    } else {
      onPress(item);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handleCardPress}
      onLongPress={() => onLongPress(item)}
      style={[
        styles.cardContainer,
        isSelected && styles.selectedCardBorder,
      ]}
    >
      {/* Media Image / Thumbnail */}
      <Image
        source={{ uri: item.thumbnailUri || item.uri }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Top & Bottom Gradient Scrims */}
      <View style={styles.topScrim} />
      <View style={styles.bottomScrim} />

      {/* Video Indicator Center Badge */}
      {isVideo && (
        <View style={styles.videoOverlayCenter}>
          <View style={styles.playButtonCircle}>
            <Icon name="play" size={16} color={PALETTE.white} />
          </View>
        </View>
      )}

      {/* Top Right: Selection Checkbox or Saved Checkmark */}
      {isSelectionMode ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onToggleSelect && onToggleSelect(item)}
          style={[
            styles.selectionCircle,
            isSelected && styles.selectionCircleSelected,
          ]}
        >
          {isSelected && (
            <Icon name="check" size={14} color={PALETTE.white} />
          )}
        </TouchableOpacity>
      ) : (
        item.isSaved && (
          <View style={styles.savedBadge}>
            <Icon name="check" size={14} color={PALETTE.onTertiaryFixed} />
          </View>
        )
      )}

      {/* Bottom Info: Timestamp & Type */}
      <View style={styles.bottomInfoRow}>
        <Text style={styles.timeText} numberOfLines={1}>
          {item.timeAgo}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: SPACING_GUTTER / 2,
    borderRadius: 8,
    backgroundColor: PALETTE.surfaceContainer,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 197, 0.3)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
  },
  selectedCardBorder: {
    borderColor: PALETTE.accentGreen,
    borderWidth: 2.5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  bottomScrim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  videoOverlayCenter: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1.5,
    borderColor: PALETTE.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  savedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PALETTE.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 3,
  },
  selectionCircle: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: PALETTE.white,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleSelected: {
    backgroundColor: PALETTE.accentGreen,
    borderColor: PALETTE.white,
  },
  bottomInfoRow: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    color: PALETTE.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
