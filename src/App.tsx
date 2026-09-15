import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';
import Navbar from './components/ui/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Campaign from './pages/Campaign';
import Lobby from './pages/Lobby';
import Profile from './pages/Profile';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';

const App: React.FC = () => {
  const { setUser, setAuthModal, showLoginModal, showSignUpModal } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          displayName: user.displayName || 'Player',
          email: user.email || '',
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
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-paper)]">
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Game />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>

        {showLoginModal && (
          <LoginModal 
            onClose={() => setAuthModal('login', false)} 
            onSwitchToSignUp={() => {
              setAuthModal('login', false);
              setAuthModal('signup', true);
            }} 
          />
        )}
        
        {showSignUpModal && (
          <SignUpModal 
            isOpen={showSignUpModal}
            onClose={() => setAuthModal('signup', false)} 
            onSwitchToLogin={() => {
              setAuthModal('signup', false);
              setAuthModal('login', true);
            }} 
          />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
