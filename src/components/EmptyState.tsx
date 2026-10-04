import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { TabType, WhatsAppType } from '@/types/status';
import { StatusScannerService } from '@/services/statusScannerService';

interface EmptyStateProps {
  activeTab: TabType;
  appType: WhatsAppType;
  onRefresh: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  activeTab,
  appType,
  onRefresh,
}) => {
  const isBusiness = appType === 'business';
  const appName = isBusiness ? 'WhatsApp Business' : 'WhatsApp';

  const getTitle = () => {
    switch (activeTab) {
      case 'saved':
        return 'No Saved Statuses Yet';
      case 'videos':
        return 'No Video Statuses';
      case 'images':
      default:
        return 'No Statuses Available';
    }
  };

  const getMessage = () => {
    switch (activeTab) {
      case 'saved':
        return `Statuses you download will stay safely saved in your Gallery permanently.`;
      case 'videos':
        return `Open ${appName} and watch video statuses from your friends to display them here.`;
      case 'images':
      default:
        return `Open ${appName} and view your contacts' statuses. They will automatically show up here ready to save and share!`;
    }
  };

  const handleOpenWhatsApp = () => {
    StatusScannerService.launchWhatsApp(appType);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon
          name={activeTab === 'saved' ? 'bookmark' : 'photo_library'}
          size={52}
          color={PALETTE.primaryContainer}
        />
      </View>

      <Text style={styles.title}>{getTitle()}</Text>
      <Text style={styles.subtitle}>{getMessage()}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenWhatsApp}
          style={styles.primaryButton}
        >
          <Icon
            name={isBusiness ? 'business' : 'whatsapp'}
            size={20}
            color={PALETTE.white}
          />
          <Text style={styles.primaryButtonText}>Open {appName}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRefresh}
          style={styles.secondaryButton}
        >
          <Icon name="refresh" size={18} color={PALETTE.primaryContainer} />
          <Text style={styles.secondaryButtonText}>Check Again</Text>
        </TouchableOpacity>
      </View>

      {/* Informative Guidance Card */}
      <View style={styles.guideCard}>
        <View style={styles.guideIcon}>
          <Icon name="info" size={20} color={PALETTE.secondary} />
        </View>
        <View style={styles.guideTextContainer}>
          <Text style={styles.guideTitle}>How does it work?</Text>
          <Text style={styles.guideDescription}>
            1. Open {appName} & view any status.{'\n'}
            2. Come back to this app.{'\n'}
            3. Tap download to keep it forever!
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(7, 94, 84, 0.09)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 94, 84, 0.15)',
  },
  title: {
    ...TYPOGRAPHY.headlineSm,
    color: PALETTE.onSurface,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xs + 4,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: PALETTE.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: SPACING.xl,
    maxWidth: 320,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.accentGreen,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 3,
    borderRadius: 24,
    marginRight: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.labelMd,
    color: PALETTE.white,
    fontWeight: '700',
    marginLeft: 6,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.surfaceContainerLowest,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(111, 121, 118, 0.3)',
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.labelMd,
    color: PALETTE.primaryContainer,
    fontWeight: '600',
    marginLeft: 4,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: PALETTE.surfaceContainerLowest,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 197, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxWidth: 340,
  },
  guideIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PALETTE.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  guideTextContainer: {
    flex: 1,
  },
  guideTitle: {
    ...TYPOGRAPHY.labelMd,
    color: PALETTE.onSurface,
    fontWeight: '700',
    marginBottom: 2,
  },
  guideDescription: {
    ...TYPOGRAPHY.bodySm,
    color: PALETTE.onSurfaceVariant,
    lineHeight: 18,
  },
});
