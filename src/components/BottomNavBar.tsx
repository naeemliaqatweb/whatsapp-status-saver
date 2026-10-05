import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PALETTE, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { TabType } from '@/types/status';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems: Array<{
    key: TabType;
    label: string;
    icon: 'photo_library' | 'smart_display' | 'bookmark' | 'chat';
  }> = [
    { key: 'images', label: 'Images', icon: 'photo_library' },
    { key: 'videos', label: 'Videos', icon: 'smart_display' },
    { key: 'saved', label: 'Saved', icon: 'bookmark' },
    { key: 'chats', label: 'Chats', icon: 'chat' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = activeTab === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            onPress={() => onSelectTab(item.key)}
            style={styles.navItem}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconPill]}>
              <Icon
                name={item.icon}
                size={22}
                color={
                  isActive ? PALETTE.onSecondaryContainer : PALETTE.onSurfaceVariant
                }
                fill={isActive}
              />
            </View>
            <Text
              style={[
                styles.navLabel,
                isActive && styles.activeNavLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: PALETTE.surfaceBright,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: 'rgba(190, 201, 197, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 2,
    borderRadius: 18,
  },
  iconContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  activeIconPill: {
    backgroundColor: PALETTE.secondaryContainer,
    borderRadius: 16,
    overflow: 'hidden',
  },
  navLabel: {
    ...TYPOGRAPHY.labelSm,
    fontSize: 11,
    color: PALETTE.onSurfaceVariant,
    marginTop: 4,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  activeNavLabel: {
    color: PALETTE.primaryContainer,
    fontWeight: '700',
  },
});

