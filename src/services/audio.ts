import { Howl } from 'howler';
import { useAudioStore } from '@/stores/audioStore';

// ─── Sound Effect Definitions ──────────────────────────────────────────
// Using synthesized/placeholder sounds - replace with actual audio files

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private ambient: Howl | null = null;

  constructor() {
    this.initSounds();
  }

  private initSounds() {
    // We'll create sounds programmatically using Web Audio API as fallback
    // These can be replaced with actual .mp3/.wav files in /public/audio/
    const soundConfigs: Record<string, { src: string; volume: number; loop?: boolean }> = {
      'door-creak': { src: '/audio/door-creak.mp3', volume: 0.6 },
      'coin-flip': { src: '/audio/coin-flip.mp3', volume: 0.5 },
      'hand-tap': { src: '/audio/hand-tap.mp3', volume: 0.4 },
      'desk-slam': { src: '/audio/desk-slam.mp3', volume: 0.7 },
      'school-bell': { src: '/audio/school-bell.mp3', volume: 0.8 },
      'cheer': { src: '/audio/cheer.mp3', volume: 0.5 },
      'scribble': { src: '/audio/scribble.mp3', volume: 0.3 },
      'page-flip': { src: '/audio/page-flip.mp3', volume: 0.4 },
      'whistle': { src: '/audio/whistle.mp3', volume: 0.5 },
      'countdown': { src: '/audio/countdown.mp3', volume: 0.6 },
    };

    for (const [key, config] of Object.entries(soundConfigs)) {
      try {
        this.sounds.set(
          key,
          new Howl({
            src: [config.src],
            volume: config.volume,
            loop: config.loop ?? false,
            preload: true,
            onloaderror: () => {
              // Silently handle missing audio files - game works without them
              console.debug(`Audio file not found: ${config.src} — using silent fallback`);
            },
          })
        );
      } catch {
        // Swallow errors for missing audio
      }
    }

    // Ambient classroom chatter
    try {
      this.ambient = new Howl({
        src: ['/audio/classroom-ambient.mp3'],
        volume: 0.15,
        loop: true,
        preload: true,
        onloaderror: () => {
          console.debug('Ambient audio not found — running silent');
        },
      });
    } catch {
      // Swallow
    }
  }

  play(soundName: string) {
    const store = useAudioStore.getState();
    if (store.isMuted) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.volume(store.sfxVolume);
      sound.play();
    }
  }

  startAmbient() {
    const store = useAudioStore.getState();
    if (store.isMuted || !this.ambient) return;

    this.ambient.volume(store.ambientVolume);
    this.ambient.play();
    useAudioStore.getState().setAmbientPlaying(true);
  }

  stopAmbient() {
    if (this.ambient) {
      this.ambient.fade(this.ambient.volume(), 0, 500);
      setTimeout(() => {
        this.ambient?.stop();
        useAudioStore.getState().setAmbientPlaying(false);
      }, 500);
    }
  }

  stopAll() {
    this.sounds.forEach((sound) => sound.stop());
    this.stopAmbient();
  }

  // Synthesized beep fallback for countdown
  playCountdownBeep(pitch: number = 440) {
    const store = useAudioStore.getState();
    if (store.isMuted) return;

    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = pitch;
      osc.type = 'sine';
      gain.gain.value = store.sfxVolume * 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
      setTimeout(() => ctx.close(), 200);
    } catch {
      // Web Audio not available
    }
  }

  // School bell synthesized sound
  playSchoolBell() {
    this.play('school-bell');
    // Fallback: synthesize a bell-like sound
    const store = useAudioStore.getState();
    if (store.isMuted) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'triangle';
      gain.gain.value = store.sfxVolume * 0.5;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
      setTimeout(() => ctx.close(), 1600);
    } catch {
      // Fallback failed silently
    }
  }
}

export const audioManager = new AudioManager();
