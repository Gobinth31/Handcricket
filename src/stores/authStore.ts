import { create } from 'zustand';
import type { AvatarType, UserProfile, UserStats, CampaignProgress } from '@/types/game';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showLoginModal: boolean;
  showSignUpModal: boolean;

  profile?: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
  setShowSignUpModal: (show: boolean) => void;
  setAuthModal: (modal: 'login' | 'signup', show: boolean) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateAvatar: (avatar: AvatarType) => void;
  updateDisplayName: (name: string) => void;
  updateCampaign: (campaign: Partial<CampaignProgress>) => void;
  logout: () => void;
}

const guestProfile: UserProfile = {
  uid: 'guest',
  displayName: 'Guest Player',
  email: '',
  avatar: 'backbencher',
  stats: {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    highestScore: 0,
    totalRuns: 0,
    wicketsTaken: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
  campaign: {
    currentRival: 0,
    rivalsDefeated: [],
    rewards: [],
    totalXP: 0,
  },
  createdAt: Date.now(),
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: guestProfile,
  profile: guestProfile,
  isAuthenticated: false,
  isLoading: false,
  showLoginModal: false,
  showSignUpModal: false,

  setUser: (user) =>
    set({
      user,
      profile: user,
      isAuthenticated: user !== null && user.uid !== 'guest',
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setShowLoginModal: (showLoginModal) => set({ showLoginModal, showSignUpModal: false }),
  setShowSignUpModal: (showSignUpModal) => set({ showSignUpModal, showLoginModal: false }),
  setAuthModal: (modal, show) => {
    if (modal === 'login') {
      set({ showLoginModal: show, showSignUpModal: false });
    } else {
      set({ showSignUpModal: show, showLoginModal: false });
    }
  },

  updateStats: (stats) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, stats: { ...state.user.stats, ...stats } }
        : state.user,
    })),

  updateAvatar: (avatar) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatar } : state.user,
    })),

  updateDisplayName: (displayName) =>
    set((state) => ({
      user: state.user ? { ...state.user, displayName } : state.user,
    })),

  updateCampaign: (campaign) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            campaign: { ...state.user.campaign, ...campaign },
          }
        : state.user,
    })),

  logout: () => set({ user: guestProfile, isAuthenticated: false }),
}));
