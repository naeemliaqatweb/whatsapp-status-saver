import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface FilterStripProps {
  isSelectionMode: boolean;
  isAllSelected: boolean;
  selectedCount: number;
  onToggleSelectAll: () => void;
  activeTab: string;
}

export const FilterStrip: React.FC<FilterStripProps> = ({
  isSelectionMode,
  isAllSelected,
  selectedCount,
  onToggleSelectAll,
  activeTab,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoLeft}>
        <Icon name="schedule" size={16} color={PALETTE.primaryLight} />
        <Text style={styles.infoText}>
          {activeTab === 'saved'
            ? 'Stored permanently in Gallery'
            : 'Disappears in 24h'}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggleSelectAll}
        style={[
          styles.selectAllButton,
          isSelectionMode && styles.activeSelectionButton,
        ]}
      >
        <Icon
          name="done_all"
          size={14}
          color={isSelectionMode ? PALETTE.onPrimary : PALETTE.onSurface}
        />
        <Text
          style={[
            styles.selectAllText,
            isSelectionMode && styles.activeSelectionText,
          ]}
        >
          {isSelectionMode
            ? isAllSelected
              ? 'Deselect All'
              : `Select All (${selectedCount})`
            : 'Select All'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surfaceContainerLow,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(111, 121, 118, 0.2)',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.bodySm,
    color: PALETTE.onSurfaceVariant,
    marginLeft: 5,
    fontWeight: '500',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: PALETTE.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(190, 201, 197, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  activeSelectionButton: {
    backgroundColor: PALETTE.primaryContainer,
    borderColor: PALETTE.primaryContainer,
  },
  selectAllText: {
    ...TYPOGRAPHY.labelSm,
    color: PALETTE.onSurface,
    marginLeft: 4,
    fontWeight: '600',
  },
  activeSelectionText: {
    color: PALETTE.white,
  },
});
