import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPACING_GUTTER = 6;
const NUM_COLUMNS = 3;
const ITEM_SIZE =
  (SCREEN_WIDTH - SPACING.md * 2 - SPACING_GUTTER * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

interface StatusLoadingSkeletonProps {
  appName?: string;
}

export const StatusLoadingSkeleton: React.FC<StatusLoadingSkeletonProps> = ({
  appName = 'WhatsApp',
}) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Spin animation
    const spin = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      })
    );
    spin.start();

    return () => {
      pulse.stop();
      spin.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const spinInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Centered Loading Indicator */}
      <View style={styles.centerCard}>
        <Animated.View
          style={[
            styles.spinnerWrapper,
            { transform: [{ rotate: spinInterpolate }] },
          ]}
        >
          <Icon name="refresh" size={32} color={PALETTE.accentGreen} />
        </Animated.View>
        <Text style={styles.loadingTitle}>Checking {appName} Statuses</Text>
        <Text style={styles.loadingSubtitle}>
          Scanning recent photos & videos...
        </Text>
      </View>

      {/* 3x3 Grid Skeletons */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 9 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.skeletonCard,
              {
                opacity: pulseAnim,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  spinnerWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(7, 94, 84, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 211, 102, 0.3)',
  },
  loadingTitle: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.onSurface,
    fontWeight: '700',
    marginBottom: 4,
  },
  loadingSubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: PALETTE.onSurfaceVariant,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  skeletonCard: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: SPACING_GUTTER,
    borderRadius: 8,
    backgroundColor: PALETTE.surfaceContainerHighest,
  },
});
