import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { TabType, StatusCounts } from '@/types/status';

interface CategoryTabsProps {
  activeTab: TabType;
  counts: StatusCounts;
  onSelectTab: (tab: TabType) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeTab,
  counts,
  onSelectTab,
}) => {
  const tabs: Array<{ key: TabType; label: string; count: number }> = [
    { key: 'images', label: 'Images', count: counts.images },
    { key: 'videos', label: 'Videos', count: counts.videos },
    { key: 'saved', label: 'Saved', count: counts.saved },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onSelectTab(tab.key)}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
          >
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
            <View
              style={[
                styles.badgeContainer,
                isActive ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isActive ? styles.activeBadgeText : styles.inactiveBadgeText,
                ]}
              >
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: PALETTE.primaryContainer,
    paddingHorizontal: SPACING.sm,
    paddingTop: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: PALETTE.accentGreen,
  },
  tabLabel: {
    ...TYPOGRAPHY.labelLg,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeTabLabel: {
    color: PALETTE.white,
    fontWeight: '700',
  },
  badgeContainer: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBadge: {
    backgroundColor: 'rgba(0, 97, 41, 0.65)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(0, 69, 61, 0.45)',
  },
  badgeText: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 10,
    fontWeight: '700',
  },
  activeBadgeText: {
    color: PALETTE.accentGreen,
  },
  inactiveBadgeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
