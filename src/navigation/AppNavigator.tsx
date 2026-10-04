import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { PALETTE } from '@/constants/theme';

export const AppNavigator: React.FC = () => {
  return (
    <View style={styles.container}>
      <HomeScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },
});
