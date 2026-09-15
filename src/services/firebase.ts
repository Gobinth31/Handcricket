import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { UserProfile, UserStats, AvatarType, CampaignProgress } from '@/types/game';
import { useAuthStore } from '@/stores/authStore';

// ─── Firebase Config ───────────────────────────────────────────────────
// Replace with your Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

// ─── Auth Functions ────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return await getOrCreateProfile(result.user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    return null;
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  avatar?: AvatarType | string
): Promise<UserProfile | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return await createProfile(result.user, displayName, avatar as AvatarType);
  } catch (error) {
    console.error('Email sign-up error:', error);
    throw error;
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await getOrCreateProfile(result.user);
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
  useAuthStore.getState().logout();
}

// ─── Profile Functions ─────────────────────────────────────────────────

const defaultStats: UserStats = {
  totalMatches: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  highestScore: 0,
  totalRuns: 0,
  wicketsTaken: 0,
  currentStreak: 0,
  bestStreak: 0,
};

const defaultCampaign: CampaignProgress = {
  currentRival: 0,
  rivalsDefeated: [],
  rewards: [],
  totalXP: 0,
};

async function createProfile(
  user: User,
  displayName?: string,
  avatar?: AvatarType
): Promise<UserProfile> {
  const profile: UserProfile = {
    uid: user.uid,
    displayName: displayName || user.displayName || 'Player',
    email: user.email || '',
    avatar: avatar || ('backbencher' as AvatarType),
    stats: defaultStats,
    campaign: defaultCampaign,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  });

  return profile;
}

async function getOrCreateProfile(user: User): Promise<UserProfile> {
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return createProfile(user);
}

export async function updateUserStats(
  uid: string,
  stats: Partial<UserStats>
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    stats,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserAvatar(
  uid: string,
  avatar: AvatarType
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { avatar, updatedAt: serverTimestamp() });
}

export async function updateCampaignProgress(
  uid: string,
  campaign: Partial<CampaignProgress>
): Promise<void> {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, { campaign, updatedAt: serverTimestamp() });
}

// ─── Auth State Listener ───────────────────────────────────────────────

export function initAuthListener(): () => void {
  return onAuthStateChanged(auth, async (user) => {
    const store = useAuthStore.getState();

    if (user) {
      store.setLoading(true);
      try {
        const profile = await getOrCreateProfile(user);
        store.setUser(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        store.setLoading(false);
      }
    } else {
      store.logout();
    }
  });
}
