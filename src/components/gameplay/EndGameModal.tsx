import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  result: 'win' | 'loss' | 'tie';
  playerRuns: number;
  opponentRuns: number;
  xpGained: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

const EndGameModal: React.FC<Props> = ({ result, playerRuns, opponentRuns, xpGained, onPlayAgain, onMenu }) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {result === 'win' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Simple CSS Confetti placeholder */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ top: '-10%', left: `${Math.random() * 100}%`, backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)] }}
              animate={{ top: '110%', rotate: Math.random() * 360 }}
              transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: 'linear' }}
              className="absolute w-3 h-3 rounded-sm"
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-amber-50 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border-2 border-gray-300 relative bg-[url('https://www.transparenttextures.com/patterns/notebook-dark.png')]"
      >
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-400/60 z-0"></div>
        <div className="absolute left-0 top-12 right-0 h-px bg-blue-300/40 z-0"></div>
        <div className="absolute left-0 top-24 right-0 h-px bg-blue-300/40 z-0"></div>
        <div className="absolute left-0 top-36 right-0 h-px bg-blue-300/40 z-0"></div>

        <div className="relative z-10 p-8 pl-12 text-center">
          <motion.h2 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`text-6xl font-black font-['Caveat'] mb-6 transform -rotate-2
              ${result === 'win' ? 'text-green-600' : result === 'loss' ? 'text-red-600' : 'text-blue-600'}
            `}
          >
            {result === 'win' ? 'YOU WON! 🎉' : result === 'loss' ? 'YOU LOST 😢' : "IT'S A TIE! 🤝"}
          </motion.h2>

          <div className="bg-white/60 p-6 rounded-lg mb-8 border border-gray-200 transform rotate-1">
            <h3 className="text-2xl font-bold font-['Patrick_Hand'] text-gray-800 mb-4 border-b pb-2">Match Summary</h3>
            <div className="flex justify-between items-center text-xl font-['Kalam'] mb-2">
              <span className="text-gray-700">Your Score:</span>
              <span className="font-bold text-blue-800 text-2xl">{playerRuns}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-['Kalam']">
              <span className="text-gray-700">Opponent Score:</span>
              <span className="font-bold text-red-800 text-2xl">{opponentRuns}</span>
            </div>
          </div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <div className="text-xl font-['Patrick_Hand'] text-gray-600">XP Gained</div>
            <div className="text-4xl font-bold font-['Caveat'] text-purple-600">+{xpGained} XP</div>
          </motion.div>

          <div className="flex flex-col gap-4">
            <button
              onClick={onPlayAgain}
              className="w-full py-4 bg-blue-600 text-white text-2xl font-bold font-['Patrick_Hand'] rounded-lg shadow-[4px_4px_0_rgba(30,58,138,1)] hover:bg-blue-700 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(30,58,138,1)] transition-all"
            >
              Play Again
            </button>
            <button
              onClick={onMenu}
              className="w-full py-4 bg-white text-gray-800 border-2 border-gray-800 text-2xl font-bold font-['Patrick_Hand'] rounded-lg shadow-[4px_4px_0_rgba(31,41,55,1)] hover:bg-gray-50 hover:translate-y-1 hover:shadow-[2px_2px_0_rgba(31,41,55,1)] transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EndGameModal;
