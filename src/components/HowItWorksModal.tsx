import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { WhatsAppType } from '@/types/status';
import { StatusScannerService } from '@/services/statusScannerService';

interface HowItWorksModalProps {
  visible: boolean;
  onClose: () => void;
  appType: WhatsAppType;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  visible,
  onClose,
  appType,
}) => {
  const isBusiness = appType === 'business';
  const appName = isBusiness ? 'WhatsApp Business' : 'WhatsApp';

  const steps = [
    {
      step: '1',
      title: `Open ${appName}`,
      desc: `Open your official ${appName} application and go to the "Updates" or "Status" tab.`,
      icon: isBusiness ? 'business' : 'whatsapp',
    },
    {
      step: '2',
      title: 'View Desired Statuses',
      desc: 'Watch the entire image or video status of your friend or contact so that WhatsApp caches it on your device.',
      icon: 'photo_library',
    },
    {
      step: '3',
      title: 'Open Status Saver App',
      desc: 'Switch back to Status Saver. All the statuses you just viewed will instantly appear on your screen.',
      icon: 'refresh',
    },
    {
      step: '4',
      title: 'Save & Share Forever',
      desc: 'Tap any photo or video to download to your phone Gallery, repost directly to your own status, or share with friends!',
      icon: 'download',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <Icon name="info" size={24} color={PALETTE.primaryContainer} />
              <Text style={styles.modalTitle}>How Status Saver Works</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Icon name="close" size={22} color={PALETTE.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.introSubtitle}>
              Follow these simple steps to save any status photos and videos in HD quality:
            </Text>

            {steps.map((item, index) => (
              <View key={index} style={styles.stepCard}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{item.step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}

            {/* Pro Tip Box */}
            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>💡 Dual WhatsApp Tip</Text>
              <Text style={styles.tipText}>
                You can easily switch between normal WhatsApp and WhatsApp Business using the toggle pill at the top of the app!
              </Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                StatusScannerService.launchWhatsApp(appType);
              }}
              style={styles.actionBtn}
            >
              <Icon
                name={isBusiness ? 'business' : 'whatsapp'}
                size={20}
                color={PALETTE.white}
              />
              <Text style={styles.actionBtnText}>Open {appName} Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: PALETTE.surfaceBright,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(190, 201, 197, 0.5)',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: PALETTE.onSurface,
    fontWeight: '700',
    marginLeft: 8,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
  },
  contentScroll: {
    marginVertical: SPACING.md,
  },
  introSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: PALETTE.onSurfaceVariant,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: PALETTE.surfaceContainerLow,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 197, 0.4)',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    ...TYPOGRAPHY.labelMd,
    color: PALETTE.white,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.onSurface,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDesc: {
    ...TYPOGRAPHY.bodySm,
    color: PALETTE.onSurfaceVariant,
    lineHeight: 18,
  },
  tipBox: {
    backgroundColor: 'rgba(254, 243, 199, 0.6)',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginTop: SPACING.xs,
  },
  tipTitle: {
    ...TYPOGRAPHY.labelMd,
    color: '#92400e',
    fontWeight: '700',
    marginBottom: 2,
  },
  tipText: {
    ...TYPOGRAPHY.bodySm,
    color: '#78350f',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingTop: SPACING.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PALETTE.accentGreen,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.white,
    fontWeight: '700',
    marginLeft: 8,
  },
});
