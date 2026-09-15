import React from 'react';
import { CampaignRival, AVATAR_CONFIG } from '../../types/game';
import { Lock, CheckCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

interface RivalCardProps {
  rival: CampaignRival;
  state: 'locked' | 'available' | 'defeated';
  onChallenge: (rival: CampaignRival) => void;
}

export const RivalCard: React.FC<RivalCardProps> = ({ rival, state, onChallenge }) => {
  const isLocked = state === 'locked';
  const isDefeated = state === 'defeated';
  const isAvailable = state === 'available';

  const renderStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  const avatarEmoji = (rival.avatar && AVATAR_CONFIG[rival.avatar]?.emoji) || '🏏';

  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.05, rotate: 0 } : {}}
      className={`relative w-full max-w-sm p-4 rounded-xl shadow-lg border-2 border-gray-400 bg-white transform ${isAvailable ? 'rotate-1' : '-rotate-1'} transition-all`}
      style={{
        opacity: isLocked ? 0.7 : 1,
        filter: isLocked ? 'grayscale(0.8)' : 'none',
      }}
    >
      {/* Background doodle pattern lightly overlaid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-xl" style={{ backgroundImage: 'radial-gradient(circle at center, black 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

      {/* Top section: Avatar and Header */}
      <div className="flex gap-4 items-start mb-4 relative z-10">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-5xl border-2 border-gray-300 shadow-inner overflow-hidden">
          {avatarEmoji}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-3xl font-bold text-gray-800" style={{ fontFamily: '"Caveat", cursive', lineHeight: '1' }}>
              {rival.name}
            </h3>
            {isLocked && <Lock className="w-6 h-6 text-gray-400" />}
          </div>
          <p className="text-lg text-blue-600 font-bold" style={{ fontFamily: '"Patrick Hand", cursive' }}>
            {rival.title}
          </p>
          <div className="flex items-center gap-1 mt-1 text-yellow-500" style={{ fontFamily: '"Kalam", cursive' }}>
            <span className="text-gray-500 text-sm">Diff:</span> {renderStars(rival.difficulty)}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-lg mb-4 leading-snug relative z-10" style={{ fontFamily: '"Kalam", cursive' }}>
        "{rival.description}"
      </p>

      {/* Details box */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-2 mb-4 relative z-10">
        <div className="flex justify-between text-sm md:text-base" style={{ fontFamily: '"Patrick Hand", cursive' }}>
          <span className="text-gray-500">Location:</span>
          <span className="font-bold text-gray-700">{rival.location}</span>
        </div>
        {rival.reward && (
          <div className="flex justify-between text-sm md:text-base mt-1" style={{ fontFamily: '"Patrick Hand", cursive' }}>
            <span className="text-gray-500 flex items-center gap-1"><Gift className="w-3 h-3"/> Reward:</span>
            <span className="font-bold text-green-600">{rival.reward}</span>
          </div>
        )}
      </div>

      {/* Action / Status */}
      <div className="relative z-10">
        {isAvailable && (
          <button
            onClick={() => onChallenge(rival)}
            className="w-full bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-md py-2 px-4 text-2xl font-bold transition-colors shadow-sm"
            style={{ fontFamily: '"Caveat", cursive' }}
          >
            Challenge!
          </button>
        )}
        {isLocked && (
          <div className="text-center py-2 text-gray-400 text-xl font-bold" style={{ fontFamily: '"Caveat", cursive' }}>
            Defeat previous rivals
          </div>
        )}
      </div>

      {/* Defeated Stamp */}
      {isDefeated && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="border-4 border-green-500 text-green-500 rounded-lg p-2 transform -rotate-12 bg-white/80 backdrop-blur-sm shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="w-8 h-8" />
            <span className="text-4xl font-bold uppercase tracking-wider" style={{ fontFamily: '"Caveat", cursive' }}>
              Defeated
            </span>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RivalCard;
