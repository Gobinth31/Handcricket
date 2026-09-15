import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onMove: (move: number) => void;
  disabled: boolean;
  role: 'batter' | 'bowler';
}

const MOVES = [
  { value: 1, emoji: '☝️', label: 'One' },
  { value: 2, emoji: '✌️', label: 'Two' },
  { value: 3, emoji: '3️⃣', label: 'Three' },
  { value: 4, emoji: '4️⃣', label: 'Four' },
  { value: 5, emoji: '🖐️', label: 'Five' },
  { value: 6, emoji: '✊', label: 'Six' },
];

const MoveSelector: React.FC<Props> = ({ onMove, disabled, role }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  useEffect(() => {
    if (disabled) return;
    
    setTimeLeft(10);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto select random move
          if (!selectedMove) {
            const randomMove = Math.floor(Math.random() * 6) + 1;
            handleMove(randomMove);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [disabled, selectedMove]);

  const handleMove = (move: number) => {
    if (disabled || selectedMove) return;
    setSelectedMove(move);
    onMove(move);
    
    // Reset selection after delay
    setTimeout(() => {
      setSelectedMove(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className={`text-2xl font-bold font-['Patrick_Hand'] ${role === 'batter' ? 'text-blue-700' : 'text-red-700'}`}>
          You are {role === 'batter' ? 'BATTING 🏏' : 'BOWLING 🎯'}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xl font-['Kalam']">{timeLeft}s</span>
          <div className="w-24 h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-400">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: '100%' }}
              animate={{ width: `${(timeLeft / 10) * 100}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {MOVES.map((move) => (
          <motion.button
            key={move.value}
            disabled={disabled || selectedMove !== null}
            whileHover={{ y: -5, rotate: Math.random() * 4 - 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMove(move.value)}
            className={`
              relative flex flex-col items-center justify-center p-4 bg-white 
              border-2 border-gray-800 rounded-lg shadow-[3px_3px_0_rgba(31,41,55,1)]
              transition-colors duration-200 aspect-square
              ${selectedMove === move.value ? 'bg-blue-50 border-blue-600' : 'hover:bg-gray-50'}
              ${(disabled && selectedMove !== move.value) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {selectedMove === move.value && (
              <motion.div
                layoutId="selection-ring"
                className="absolute inset-0 border-4 border-blue-500 rounded-lg rounded-tl-2xl rounded-br-xl opacity-70"
                style={{ borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}
              />
            )}
            <span className="text-4xl mb-2">{move.emoji}</span>
            <span className="text-2xl font-bold font-['Caveat'] text-gray-800">
              {move.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoveSelector;
