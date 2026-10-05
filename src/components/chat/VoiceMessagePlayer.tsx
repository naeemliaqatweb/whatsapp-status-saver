import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Icon } from '@/components/ui/Icon';
import { audioPlayer } from '@/services/audioPlayerService';

interface VoiceMessagePlayerProps {
  mediaUri?: string | null;
  durationSeconds?: number;
  isDeleted?: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  mediaUri,
  durationSeconds = 8,
  isDeleted = false,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPositionMs, setCurrentPositionMs] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(
    (durationSeconds || 8) * 1000
  );

  useEffect(() => {
    return () => {
      // Clean up when unmounting
      if (audioPlayer.getActiveUri() === mediaUri) {
        audioPlayer.stop();
      }
    };
  }, [mediaUri]);

  const handleTogglePlay = async () => {
    if (!mediaUri) {
      // If simulated / demo voice note
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        // Simulate playback progress
        let pos = 0;
        const interval = setInterval(() => {
          pos += 500;
          if (pos >= totalDurationMs) {
            clearInterval(interval);
            setIsPlaying(false);
            setCurrentPositionMs(0);
          } else {
            setCurrentPositionMs(pos);
          }
        }, 500);
      }
      return;
    }

    if (isPlaying) {
      await audioPlayer.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const success = await audioPlayer.play(
        mediaUri,
        (posMs, durMs) => {
          setCurrentPositionMs(posMs);
          if (durMs > 0) setTotalDurationMs(durMs);
        },
        () => {
          setIsPlaying(false);
          setCurrentPositionMs(0);
        }
      );
      if (!success) {
        setIsPlaying(false);
      }
    }
  };

  const formatSeconds = (ms: number): string => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressRatio = totalDurationMs > 0 ? currentPositionMs / totalDurationMs : 0;
  const barCount = 24;
  const activeBars = Math.floor(progressRatio * barCount);

  // Pre-calculated aesthetic bar heights for WhatsApp-like waveform
  const barHeights = [
    6, 12, 18, 10, 14, 22, 16, 26, 20, 14, 22, 18, 24, 16, 20, 12, 22, 18, 14,
    16, 10, 14, 8, 6,
  ];

  return (
    <View style={styles.container}>
      {/* Play/Pause Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleTogglePlay}
        style={[
          styles.playButton,
          isDeleted ? styles.deletedPlayButton : styles.normalPlayButton,
        ]}
        accessibilityLabel={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        <Icon
          name={isPlaying ? 'pause' : 'play_arrow'}
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Waveform and Duration Column */}
      <View style={styles.waveformContainer}>
        <View style={styles.barsRow}>
          {barHeights.map((h, index) => {
            const isActive = index <= activeBars;
            return (
              <View
                key={index}
                style={[
                  styles.bar,
                  { height: h },
                  isActive
                    ? isDeleted
                      ? styles.deletedActiveBar
                      : styles.activeBar
                    : styles.inactiveBar,
                ]}
              />
            );
          })}
        </View>

        {/* Duration Timer Row */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {isPlaying
              ? formatSeconds(currentPositionMs)
              : formatSeconds(totalDurationMs)}
          </Text>
          <View style={styles.micTag}>
            <Icon
              name="mic"
              size={13}
              color={isDeleted ? '#D32F2F' : '#075E54'}
            />
            <Text style={[styles.micLabel, isDeleted && styles.deletedMicLabel]}>
              Voice Note
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minWidth: 230,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  normalPlayButton: {
    backgroundColor: '#075E54',
  },
  deletedPlayButton: {
    backgroundColor: '#D32F2F',
  },
  waveformContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    justifyContent: 'space-between',
  },
  bar: {
    width: 3,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  activeBar: {
    backgroundColor: '#075E54',
  },
  deletedActiveBar: {
    backgroundColor: '#D32F2F',
  },
  inactiveBar: {
    backgroundColor: '#C5D0D6',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#667781',
    fontWeight: '600',
  },
  micTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micLabel: {
    fontSize: 10,
    color: '#075E54',
    fontWeight: '700',
    marginLeft: 2,
  },
  deletedMicLabel: {
    color: '#D32F2F',
  },
});
