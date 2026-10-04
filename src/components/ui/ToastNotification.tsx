import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastConfig {
  message: string;
  subMessage?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastNotificationProps {
  visible: boolean;
  config: ToastConfig | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  config,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && config) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, config.duration || 3200);

      return () => {
        clearTimeout(timer);
      };
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      return undefined;
    }
  }, [visible, config]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible || !config) return null;

  const getIconName = () => {
    switch (config.type) {
      case 'success':
        return 'check_circle';
      case 'warning':
      case 'error':
        return 'info';
      case 'info':
      default:
        return 'info';
    }
  };

  const getBackgroundColor = () => {
    switch (config.type) {
      case 'success':
        return '#00453d'; // Stitch deep emerald
      case 'error':
        return '#8C1D18';
      case 'warning':
        return '#6E4D00';
      case 'info':
      default:
        return '#075E54';
    }
  };

  const getAccentColor = () => {
    switch (config.type) {
      case 'success':
        return PALETTE.accentGreen;
      case 'error':
        return '#FFB4AB';
      case 'warning':
        return '#FFDD80';
      case 'info':
      default:
        return '#8cf1e1';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 24) + 8,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleDismiss}
        style={[
          styles.toastCard,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getAccentColor(),
          },
        ]}
      >
        <View
          style={[
            styles.iconWrapper,
            { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
          ]}
        >
          <Icon name={getIconName()} size={22} color={getAccentColor()} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.messageText}>{config.message}</Text>
          {config.subMessage && (
            <Text style={styles.subMessageText}>{config.subMessage}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          accessibilityLabel="Close notification"
        >
          <Icon name="close" size={16} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    ...TYPOGRAPHY.labelLg,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  subMessageText: {
    ...TYPOGRAPHY.bodySm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
    fontSize: 12,
  },
  closeButton: {
    padding: 6,
    marginLeft: 8,
  },
});
