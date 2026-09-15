import { create } from 'zustand';

interface AudioStore {
  isMuted: boolean;
  ambientVolume: number;
  sfxVolume: number;
  isAmbientPlaying: boolean;

  toggleMute: () => void;
  setAmbientVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setAmbientPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  isMuted: false,
  ambientVolume: 0.3,
  sfxVolume: 0.7,
  isAmbientPlaying: false,

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  setAmbientVolume: (ambientVolume) => set({ ambientVolume }),
  setSfxVolume: (sfxVolume) => set({ sfxVolume }),
  setAmbientPlaying: (isAmbientPlaying) => set({ isAmbientPlaying }),
}));
