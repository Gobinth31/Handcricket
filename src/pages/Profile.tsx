import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotebookOverlay from '../components/ui/NotebookOverlay';
import ProfileCard from '../components/auth/ProfileCard';
import { useAuthStore } from '../stores/authStore';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuthModal } = useAuthStore();

  return (
    <NotebookOverlay>
      <div className="min-h-[calc(100vh-80px)] p-4 md:p-8 pl-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl handwritten-caveat text-[var(--color-ink-blue)] font-bold">
              Report Card
            </h1>
            <p className="text-xl handwritten-indie text-[var(--color-ink-red)]">
              Your hand cricket statistics
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="paper-card doodle-border px-4 py-2 text-xl handwritten-patrick hover:bg-gray-100"
          >
            ← Back Home
          </button>
        </div>

        <div className="flex justify-center mt-10">
          {user ? (
            <ProfileCard />
          ) : (
            <div className="paper-card doodle-border p-10 text-center max-w-md w-full bg-white/80">
              <div className="text-6xl mb-6">📝</div>
              <h2 className="text-3xl handwritten-caveat mb-4 text-[var(--color-ink-blue)]">
                Not signed in!
              </h2>
              <p className="text-xl handwritten-patrick mb-8 text-gray-600">
                You need to sign in to save your stats and campaign progress.
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setAuthModal('login', true)}
                  className="w-full paper-card doodle-border py-3 text-2xl handwritten-indie text-[var(--color-ink-blue)] hover:text-[var(--color-ink-red)]"
                >
                  Log In
                </button>
                <button 
                  onClick={() => setAuthModal('signup', true)}
                  className="w-full paper-card doodle-border py-3 text-2xl handwritten-indie text-[var(--color-ink-blue)] hover:text-[var(--color-ink-red)]"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </NotebookOverlay>
  );
};

export default Profile;
