import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onTossComplete: (choice: 'odd' | 'even', isWinner: boolean, tossResult: number, computerChoice: number) => void;
  onChoiceComplete: (choice: 'bat' | 'bowl') => void;
}

const TossPhase: React.FC<Props> = ({ onTossComplete, onChoiceComplete }) => {
  const [phase, setPhase] = useState<'pick' | 'flip' | 'result' | 'choice'>('pick');
  const [playerOddEven, setPlayerOddEven] = useState<'odd' | 'even' | null>(null);
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [tossSum, setTossSum] = useState<number>(0);
  const [computerNum, setComputerNum] = useState<number>(0);
  const [playerNum, setPlayerNum] = useState<number>(0);

  const handlePick = (choice: 'odd' | 'even') => {
    setPlayerOddEven(choice);
    setPhase('flip');
    
    // Simulate toss
    setTimeout(() => {
      const pNum = Math.floor(Math.random() * 6) + 1;
      const cNum = Math.floor(Math.random() * 6) + 1;
      const sum = pNum + cNum;
      const isSumEven = sum % 2 === 0;
      const won = (choice === 'even' && isSumEven) || (choice === 'odd' && !isSumEven);
      
      setPlayerNum(pNum);
      setComputerNum(cNum);
      setTossSum(sum);
      setIsWinner(won);
      
      setPhase('result');
      
      setTimeout(() => {
        if (won) {
          setPhase('choice');
        } else {
          onTossComplete(choice, won, sum, cNum);
          setTimeout(() => {
            onChoiceComplete(Math.random() > 0.5 ? 'bat' : 'bowl'); // Computer choice
          }, 2000);
        }
      }, 3000);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full font-['Kalam']">
      <AnimatePresence mode="wait">
        {phase === 'pick' && (
          <motion.div
            key="pick"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-blue-800 mb-8 font-['Caveat']">Odd or Even?</h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => handlePick('odd')}
                className="px-8 py-4 bg-white border-2 border-blue-800 text-blue-800 text-2xl font-bold rounded shadow-[4px_4px_0_rgba(30,64,175,1)] hover:bg-blue-50 transition-all active:translate-y-1 active:shadow-[0px_0px_0_rgba(30,64,175,1)]"
              >
                ODD
              </button>
              <button
                onClick={() => handlePick('even')}
                className="px-8 py-4 bg-white border-2 border-blue-800 text-blue-800 text-2xl font-bold rounded shadow-[4px_4px_0_rgba(30,64,175,1)] hover:bg-blue-50 transition-all active:translate-y-1 active:shadow-[0px_0px_0_rgba(30,64,175,1)]"
              >
                EVEN
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'flip' && (
          <motion.div
            key="flip"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotateY: [0, 180, 360, 540, 720, 900, 1080] }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-32 h-32 bg-yellow-400 rounded-full border-4 border-yellow-600 flex items-center justify-center mx-auto shadow-lg mb-6"
            >
              <span className="text-4xl text-yellow-800 font-bold">?</span>
            </motion.div>
            <h2 className="text-3xl text-blue-800 font-['Caveat']">Tossing...</h2>
          </motion.div>
        )}

        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="text-2xl mb-4 text-gray-700">
              You played {playerNum} • Opponent played {computerNum}
            </div>
            <div className="text-3xl mb-6 font-bold text-blue-900">
              Total = {tossSum} ({tossSum % 2 === 0 ? 'Even' : 'Odd'})
            </div>
            <h2 className={`text-5xl font-bold font-['Caveat'] ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
              {isWinner ? 'You won the toss!' : 'Opponent won the toss!'}
            </h2>
          </motion.div>
        )}

        {phase === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-blue-800 mb-8 font-['Caveat']">What will you do?</h2>
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => {
                  onTossComplete(playerOddEven!, isWinner, tossSum, computerNum);
                  onChoiceComplete('bat');
                }}
                className="px-8 py-4 bg-white border-2 border-blue-800 text-blue-800 text-2xl font-bold rounded shadow-[4px_4px_0_rgba(30,64,175,1)] hover:bg-blue-50 transition-all active:translate-y-1 active:shadow-[0px_0px_0_rgba(30,64,175,1)] flex items-center gap-2"
              >
                <span>🏏</span> BAT
              </button>
              <button
                onClick={() => {
                  onTossComplete(playerOddEven!, isWinner, tossSum, computerNum);
                  onChoiceComplete('bowl');
                }}
                className="px-8 py-4 bg-white border-2 border-blue-800 text-blue-800 text-2xl font-bold rounded shadow-[4px_4px_0_rgba(30,64,175,1)] hover:bg-blue-50 transition-all active:translate-y-1 active:shadow-[0px_0px_0_rgba(30,64,175,1)] flex items-center gap-2"
              >
                <span>🎯</span> BOWL
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TossPhase;
