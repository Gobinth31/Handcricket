import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StickyTab } from './StickyTab';
import { useAuthStore } from '../../stores/authStore';
import { useAudioStore } from '../../stores/audioStore';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setShowLoginModal } = useAuthStore();
  const isMuted = useAudioStore((state) => state.isMuted);
  const toggleMute = useAudioStore((state) => state.toggleMute);

  const tabs = [
    { label: 'PLAY', path: '/', color: '#ffb3ba' },
    { label: 'CAMPAIGN', path: '/campaign', color: '#ffdfba' },
    { label: 'COMMUNITY', path: '/lobby?mode=instant', color: '#ffffba' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4 pointer-events-auto">
      <div className="flex gap-2 mr-4">
        {tabs.map((tab) => (
          <StickyTab 
            key={tab.label}
            label={tab.label}
            color={tab.color}
            isActive={location.pathname === tab.path || (tab.path === '/' && (location.pathname === '/' || location.pathname === '/play'))}
            onClick={() => navigate(tab.path)}
          />
        ))}
        
        <StickyTab 
          label={user && user.uid !== 'guest' ? (user.displayName || 'PROFILE') : 'SIGN IN'}
          color="#baffc9"
          isActive={location.pathname === '/profile'}
          onClick={() => {
            if (user && user.uid !== 'guest') {
              navigate('/profile');
            } else {
              setShowLoginModal(true);
            }
          }}
        />
      </div>

      <button 
        onClick={toggleMute}
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        className="bg-[#bae1ff] p-3 rounded-full shadow-md hover:scale-110 transition-transform font-[var(--font-patrick)] text-xl w-12 h-12 flex items-center justify-center cursor-pointer border-2 border-white"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default Navbar;
