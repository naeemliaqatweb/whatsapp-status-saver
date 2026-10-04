import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface BatchActionBarProps {
  selectedCount: number;
  onSaveAll: () => void;
  onShareAll: () => void;
  onDeleteAll?: () => void;
  onCancel: () => void;
  isSavedTab?: boolean;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onSaveAll,
  onShareAll,
  onDeleteAll,
  onCancel,
  isSavedTab = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.leftInfo}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCancel}
          style={styles.closeBtn}
        >
          <Icon name="close" size={20} color={PALETTE.white} />
        </TouchableOpacity>
        <Text style={styles.countText}>{selectedCount} Selected</Text>
      </View>

      <View style={styles.actionsRight}>
        {!isSavedTab ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSaveAll}
            style={styles.actionBtn}
          >
            <Icon name="download" size={20} color={PALETTE.white} />
            <Text style={styles.actionText}>Save All</Text>
          </TouchableOpacity>
        ) : (
          onDeleteAll && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onDeleteAll}
              style={[styles.actionBtn, styles.deleteBtn]}
            >
              <Icon name="delete" size={20} color={PALETTE.white} />
              <Text style={styles.actionText}>Remove</Text>
            </TouchableOpacity>
          )
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShareAll}
          style={styles.actionBtn}
        >
          <Icon name="share" size={20} color={PALETTE.white} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 74,
    left: 16,
    right: 16,
    backgroundColor: PALETTE.primaryContainer,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 50,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
    marginRight: 8,
  },
  countText: {
    ...TYPOGRAPHY.labelLg,
    color: PALETTE.white,
    fontWeight: '700',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  deleteBtn: {
    backgroundColor: PALETTE.error,
  },
  actionText: {
    ...TYPOGRAPHY.labelSm,
    color: PALETTE.white,
    fontWeight: '700',
    marginLeft: 4,
  },
});
