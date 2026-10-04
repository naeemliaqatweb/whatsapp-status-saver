import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { PALETTE } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

interface FABProps {
  onPress: () => void;
  visible?: boolean;
}

export const FAB: React.FC<FABProps> = ({ onPress, visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.fabButton}
        accessibilityLabel="Batch save or download statuses"
      >
        <Icon name="download" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 40,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PALETTE.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PALETTE.accentGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
