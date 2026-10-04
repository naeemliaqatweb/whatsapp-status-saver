import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { WhatsAppType } from '@/types/status';

interface HeaderProps {
  appType: WhatsAppType;
  onToggleAppType: (type: WhatsAppType) => void;
  onRefresh: () => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
  onOpenHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appType,
  onToggleAppType,
  onRefresh,
  onOpenSearch,
  onOpenMenu,
  onOpenHelp,
}) => {
  const insets = useSafeAreaInsets();
  const isBusiness = appType === 'business';

  // Calculate safe top padding ensuring battery / time status bar doesn't overlap
  const safeTopPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 20
  );

  return (
    <View style={[styles.headerContainer, { paddingTop: safeTopPadding + 4 }]}>


      {/* Top App Bar Row */}
      <View style={styles.topBarRow}>
        <View style={styles.titleSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenMenu}
            style={styles.iconButton}
            accessibilityLabel="Menu"
          >
            <Icon name="menu" size={24} color={PALETTE.white} />
          </TouchableOpacity>
          <View>
            <Text style={styles.appTitle}>Status Saver</Text>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenSearch}
            style={styles.iconButton}
            accessibilityLabel="Search"
          >
            <Icon name="search" size={22} color={PALETTE.white} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRefresh}
            style={styles.iconButton}
            accessibilityLabel="Refresh"
          >
            <Icon name="refresh" size={22} color={PALETTE.white} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenHelp || onOpenMenu}
            style={styles.iconButton}
            accessibilityLabel="More options"
          >
            <Icon name="more_vert" size={22} color={PALETTE.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* WhatsApp vs WhatsApp Business Switcher Pill Toggle */}
      <View style={styles.switcherRow}>
        <View style={styles.switcherContainer}>
          {/* Regular WhatsApp Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onToggleAppType('whatsapp')}
            style={[
              styles.switchPill,
              !isBusiness && styles.activeSwitchPill,
            ]}
          >
            <Icon
              name="whatsapp"
              size={18}
              color={!isBusiness ? PALETTE.onPrimary : 'rgba(255, 255, 255, 0.65)'}
            />
            <Text
              style={[
                styles.switchText,
                !isBusiness && styles.activeSwitchText,
              ]}
            >
              WhatsApp
            </Text>
            {!isBusiness && <View style={styles.activeDot} />}
          </TouchableOpacity>

          {/* WA Business Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onToggleAppType('business')}
            style={[
              styles.switchPill,
              isBusiness && styles.activeBusinessPill,
            ]}
          >
            <Icon
              name="business"
              size={18}
              color={isBusiness ? PALETTE.onPrimary : 'rgba(255, 255, 255, 0.65)'}
            />
            <Text
              style={[
                styles.switchText,
                isBusiness && styles.activeSwitchText,
              ]}
            >
              WA Business
            </Text>
            {isBusiness && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: PALETTE.primaryContainer,
    paddingTop: SPACING.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: PALETTE.white,
    marginLeft: SPACING.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: SPACING.xs + 2,
    borderRadius: 20,
    marginLeft: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switcherRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    paddingTop: 2,
  },
  switcherContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 24,
    padding: 3,
  },
  switchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeSwitchPill: {
    backgroundColor: PALETTE.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeBusinessPill: {
    backgroundColor: '#00796b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchText: {
    ...TYPOGRAPHY.labelMd,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 6,
    fontWeight: '600',
  },
  activeSwitchText: {
    color: PALETTE.white,
    fontWeight: '700',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PALETTE.accentGreen,
    marginLeft: 6,
  },
});
