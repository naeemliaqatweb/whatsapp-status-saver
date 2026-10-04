import React from 'react';
import {
  requireNativeComponent,
  ViewStyle,
  StyleProp,
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface NativeStatusVideoViewProps {
  style?: StyleProp<ViewStyle>;
  src: string;
  paused?: boolean;
  loop?: boolean;
  onPrepared?: (event: { nativeEvent: { duration: number; width: number; height: number } }) => void;
  onCompletion?: () => void;
  onError?: (event: { nativeEvent: { what: number; extra: number } }) => void;
}

const NativeStatusVideo = Platform.OS === 'android'
  ? requireNativeComponent<NativeStatusVideoViewProps>('StatusVideoView')
  : View;

interface StatusVideoPlayerProps {
  sourceUri: string;
  paused?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const StatusVideoPlayer: React.FC<StatusVideoPlayerProps> = ({
  sourceUri,
  paused = false,
  loop = true,
  style,
}) => {
  if (Platform.OS !== 'android') {
    return (
      <View style={[styles.fallbackContainer, style]}>
        <Text style={styles.fallbackText}>Video playback supported on Android</Text>
      </View>
    );
  }

  return (
    <NativeStatusVideo
      style={[styles.player, style]}
      src={sourceUri}
      paused={paused}
      loop={loop}
    />
  );
};

const styles = StyleSheet.create({
  player: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
  },
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  fallbackText: {
    color: '#ffffff',
  },
});
