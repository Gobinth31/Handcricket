import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  playerMove: number;
  opponentMove: number;
  isOut: boolean;
  runs: number;
  onComplete: () => void;
}

const getEmoji = (val: number) => {
  const map: Record<number, string> = {
    1: '☝️', 2: '✌️', 3: '3️⃣', 4: '4️⃣', 5: '🖐️', 6: '✊'
  };
  return map[val] || '❓';
};

const RevealPhase: React.FC<Props> = ({ playerMove, opponentMove, isOut, runs, onComplete }) => {
  const [step, setStep] = useState<number>(0);

  useEffect(() => {
    const sequence = async () => {
      setStep(1); // "1"
      await new Promise(r => setTimeout(r, 600));
      setStep(2); // "2"
      await new Promise(r => setTimeout(r, 600));
      setStep(3); // "3!"
      await new Promise(r => setTimeout(r, 600));
      setStep(4); // Reveal hands
      await new Promise(r => setTimeout(r, 1000));
      setStep(5); // Result effect
      await new Promise(r => setTimeout(r, 1500));
      onComplete();
    };
    sequence();
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        {step >= 1 && step <= 3 && (
          <motion.div
            key={`countdown-${step}`}
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="text-8xl font-black text-white font-['Caveat'] drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]"
          >
            {step === 3 ? "3!" : step}
          </motion.div>
        )}

        {step >= 4 && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center w-full"
          >
            <div className="flex justify-around w-full max-w-2xl px-8 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="text-2xl font-['Patrick_Hand'] text-white mb-4 bg-black/50 px-4 py-1 rounded">You</div>
                <div className="text-9xl filter drop-shadow-xl">{getEmoji(playerMove)}</div>
              </motion.div>

              <div className="text-4xl text-white font-bold mx-4 font-['Kalam']">VS</div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="text-2xl font-['Patrick_Hand'] text-white mb-4 bg-black/50 px-4 py-1 rounded">Opponent</div>
                <div className="text-9xl filter drop-shadow-xl">{getEmoji(opponentMove)}</div>
              </motion.div>
            </div>

            {step >= 5 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.7 }}
                className="mt-12 absolute"
              >
                {isOut ? (
                  <div className="text-7xl md:text-9xl font-black text-red-600 font-['Caveat'] drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] rotate-[-10deg] border-8 border-red-600 p-4 rounded-lg bg-black/20 backdrop-blur-md uppercase tracking-wider">
                    OUT!
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-6xl md:text-8xl font-black text-yellow-400 font-['Caveat'] drop-shadow-[0_0_15px_rgba(252,211,77,0.8)]">
                      +{runs}
                    </div>
                    <div className="text-3xl text-white font-['Kalam'] mt-2">Runs Scored!</div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RevealPhase;
