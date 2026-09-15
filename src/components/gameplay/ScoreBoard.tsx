import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  runs: number;
  balls: number;
  innings: 1 | 2;
  target?: number;
  role: 'batter' | 'bowler';
  history: (number | 'W')[];
}

const ScoreBoard: React.FC<Props> = ({ runs, balls, innings, target, role, history }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 bg-[url('https://www.transparenttextures.com/patterns/notebook-dark.png')] bg-amber-50 rounded-lg border border-gray-300 shadow-[2px_4px_10px_rgba(0,0,0,0.1)] p-4 relative overflow-hidden">
      {/* Notebook line decoration */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-400/60 z-0"></div>
      
      <div className="relative z-10 pl-8 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <h2 className="text-sm font-['Patrick_Hand'] text-gray-500 uppercase tracking-wider">Score</h2>
            <div className="text-4xl font-bold font-['Caveat'] text-blue-900 leading-none">
              {runs} <span className="text-xl text-gray-600">runs</span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-gray-300"></div>
          
          <div className="text-center">
            <h2 className="text-sm font-['Patrick_Hand'] text-gray-500 uppercase tracking-wider">Balls</h2>
            <div className="text-3xl font-bold font-['Caveat'] text-gray-800 leading-none">
              {balls}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <div className="flex items-center gap-2 text-lg font-['Kalam']">
            <span className="px-3 py-1 bg-gray-200/50 rounded text-gray-700">
              Innings: {innings}
            </span>
            <span className={`px-3 py-1 rounded flex items-center gap-1 font-bold ${role === 'batter' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
              {role === 'batter' ? '🏏 Batting' : '🎯 Bowling'}
            </span>
          </div>

          {innings === 2 && target !== undefined && (
            <div className="mt-2 text-xl font-['Patrick_Hand'] text-gray-800 bg-yellow-100/80 px-4 py-1 rounded shadow-sm">
              Target: <span className="font-bold">{target}</span> | Need <span className="text-red-600 font-bold">{target - runs}</span> more
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 pl-8 mt-4 pt-3 border-t border-blue-200/50 flex items-center gap-2 overflow-x-auto">
        <span className="text-sm font-['Patrick_Hand'] text-gray-500 whitespace-nowrap">Recent:</span>
        <div className="flex gap-2">
          {history.length === 0 && <span className="text-gray-400 italic text-sm">No balls yet</span>}
          {history.slice(-6).map((res, i) => (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-['Caveat'] text-lg shadow-sm
                ${res === 'W' ? 'bg-red-500 text-white' : 
                  res === 6 ? 'bg-purple-500 text-white' : 
                  res === 4 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {res}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
