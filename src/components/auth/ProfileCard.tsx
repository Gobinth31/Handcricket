import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AVATAR_CONFIG, AvatarType } from '../../types/game';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { logOut } from '../../services/firebase';

const AVATAR_OPTIONS: AvatarType[] = [
  'backbencher',
  'class-monitor',
  'sports-captain',
  'nerd',
  'artist',
  'prankster',
];

export const ProfileCard: React.FC = () => {
  const { user, updateAvatar } = useAuthStore();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  if (!user) return null;

  const currentAvatar = AVATAR_CONFIG[user.avatar] || AVATAR_CONFIG['backbencher'];
  const totalMatches = user.stats?.totalMatches ?? user.stats?.matchesPlayed ?? 0;
  const wins = user.stats?.wins ?? user.stats?.matchesWon ?? 0;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const rivalsDefeated = user.campaign?.rivalsDefeated?.length ?? user.campaign?.currentRival ?? 0;

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleAvatarSelect = (id: AvatarType) => {
    updateAvatar(id);
    setIsEditingAvatar(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#fdfbf7] p-6 rounded-lg shadow-xl relative border-2 border-gray-300 max-w-2xl w-full mx-auto"
      style={{
        backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 95%)',
        backgroundSize: '100% 2rem',
        lineHeight: '2rem'
      }}
    >
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-400/60 z-0" />
      
      <div className="relative z-10 pl-8">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center border-b-2 border-gray-300 border-dashed pb-6 mb-6">
          <div className="flex-shrink-0 relative cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
            <div className="w-24 h-24 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center text-5xl shadow-md transform -rotate-3 hover:rotate-0 transition-transform">
              {currentAvatar.emoji}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded border border-blue-300 transform rotate-6" style={{ fontFamily: '"Patrick Hand", cursive' }}>
              {currentAvatar.label}
            </div>
          </div>
          
          <div className="flex-grow">
            <h2 className="text-5xl font-bold text-gray-800" style={{ fontFamily: '"Caveat", cursive' }}>
              {user.displayName}
            </h2>
            <p className="text-gray-500 text-lg" style={{ fontFamily: '"Kalam", cursive' }}>
              Joined class: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="self-start md:self-center flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 border-2 border-transparent hover:border-red-200 rounded-lg transition-colors"
            style={{ fontFamily: '"Patrick Hand", cursive' }}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xl">Sign Out</span>
          </button>
        </div>

        {isEditingAvatar && (
          <div className="mb-6 p-4 bg-white/50 border-2 border-gray-200 rounded-lg shadow-inner">
            <h3 className="text-lg mb-2 text-gray-700" style={{ fontFamily: '"Kalam", cursive' }}>Pick a new avatar:</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {AVATAR_OPTIONS.map(id => {
                const avatar = AVATAR_CONFIG[id];
                return (
                  <button
                    key={id}
                    onClick={() => handleAvatarSelect(id)}
                    className={`w-16 h-16 flex-shrink-0 bg-white border-2 rounded-lg text-3xl hover:bg-gray-50 transition-colors ${user.avatar === id ? 'border-blue-500 shadow-md scale-105' : 'border-gray-200'}`}
                  >
                    {avatar.emoji}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-3xl font-bold text-gray-700 mb-4" style={{ fontFamily: '"Caveat", cursive' }}>Report Card</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatBox label="Matches" value={totalMatches} />
            <StatBox label="Wins" value={wins} color="text-green-600" />
            <StatBox label="Losses" value={user.stats.losses} color="text-red-500" />
            <StatBox label="High Score" value={user.stats.highestScore} />
            <StatBox label="Total Runs" value={user.stats.totalRuns} />
            <StatBox label="Wickets" value={user.stats.wicketsTaken} />
            <StatBox label="Win Rate" value={`${winRate}%`} />
            <StatBox label="Current Streak" value={user.stats.currentStreak} />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-bold text-gray-700 mb-2" style={{ fontFamily: '"Caveat", cursive' }}>Campaign Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 border-2 border-gray-400 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (rivalsDefeated / 11) * 100)}%` }}
            >
              <div className="w-full h-full opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')]"></div>
            </div>
          </div>
          <p className="text-right mt-1 text-gray-600 font-bold" style={{ fontFamily: '"Kalam", cursive' }}>
            {rivalsDefeated} / 11 Defeated
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const StatBox = ({ label, value, color = "text-gray-800" }: { label: string; value: string | number; color?: string }) => (
  <div className="bg-white border-2 border-gray-300 p-3 rounded-lg shadow-sm flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
    <span className="text-gray-500 text-sm md:text-base text-center" style={{ fontFamily: '"Patrick Hand", cursive' }}>{label}</span>
    <span className={`text-2xl md:text-3xl font-bold ${color}`} style={{ fontFamily: '"Kalam", cursive' }}>{value}</span>
  </div>
);

export default ProfileCard;
