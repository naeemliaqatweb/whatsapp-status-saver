import { NativeModules, DeviceEventEmitter, Platform, EmitterSubscription } from 'react-native';

const { AudioPlayerModule } = NativeModules;

export interface AudioProgressEvent {
  currentPosition: number; // in ms
  duration: number; // in ms
  uri: string;
  isPlaying: boolean;
}

export type AudioProgressCallback = (currentPosMs: number, durationMs: number) => void;
export type AudioCompletionCallback = () => void;

class AudioPlayerService {
  private activeUri: string | null = null;
  private progressCallback: AudioProgressCallback | null = null;
  private completionCallback: AudioCompletionCallback | null = null;
  private subscriptions: EmitterSubscription[] = [];

  constructor() {
    this.initListeners();
  }

  private initListeners() {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return;

    this.subscriptions.push(
      DeviceEventEmitter.addListener('onAudioProgress', (event: AudioProgressEvent) => {
        if (this.activeUri && event.uri === this.activeUri) {
          this.progressCallback?.(event.currentPosition, event.duration);
        }
      })
    );

    this.subscriptions.push(
      DeviceEventEmitter.addListener('onAudioCompletion', (event: { uri: string; duration: number }) => {
        if (this.activeUri && event.uri === this.activeUri) {
          this.completionCallback?.();
          this.activeUri = null;
          this.progressCallback = null;
          this.completionCallback = null;
        }
      })
    );

    this.subscriptions.push(
      DeviceEventEmitter.addListener('onAudioError', () => {
        this.completionCallback?.();
        this.activeUri = null;
      })
    );
  }

  public async play(
    uri: string,
    onProgress?: AudioProgressCallback,
    onComplete?: AudioCompletionCallback
  ): Promise<boolean> {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return false;

    try {
      this.activeUri = uri;
      this.progressCallback = onProgress || null;
      this.completionCallback = onComplete || null;

      await AudioPlayerModule.play(uri);
      return true;
    } catch (e) {
      console.error('AudioPlayerService play error:', e);
      this.activeUri = null;
      return false;
    }
  }

  public async pause(): Promise<void> {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return;
    try {
      await AudioPlayerModule.pause();
    } catch (e) {
      console.error('AudioPlayerService pause error:', e);
    }
  }

  public async resume(): Promise<void> {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return;
    try {
      await AudioPlayerModule.resume();
    } catch (e) {
      console.error('AudioPlayerService resume error:', e);
    }
  }

  public async stop(): Promise<void> {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return;
    try {
      await AudioPlayerModule.stop();
      this.activeUri = null;
      this.progressCallback = null;
      this.completionCallback = null;
    } catch (e) {
      console.error('AudioPlayerService stop error:', e);
    }
  }

  public async seekTo(positionMs: number): Promise<void> {
    if (Platform.OS !== 'android' || !AudioPlayerModule) return;
    try {
      await AudioPlayerModule.seekTo(positionMs);
    } catch (e) {
      console.error('AudioPlayerService seek error:', e);
    }
  }

  public getActiveUri(): string | null {
    return this.activeUri;
  }
}

export const audioPlayer = new AudioPlayerService();
