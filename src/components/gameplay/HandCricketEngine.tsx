import React from 'react';
import { useSearchParams } from 'react-router-dom';
import TossPhase from './TossPhase';
import MoveSelector from './MoveSelector';
import ScoreBoard from './ScoreBoard';
import RevealPhase from './RevealPhase';
import EndGameModal from './EndGameModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { CAMPAIGN_RIVALS } from '@/data/campaign';
import type { CampaignRival } from '@/types/game';

interface Props {
  mode: 'solo' | 'online';
  roomId?: string;
}

const HandCricketEngine: React.FC<Props> = ({ mode, roomId }) => {
  const [searchParams] = useSearchParams();
  const rivalId = searchParams.get('rival');

  // Look up rival strategy and difficulty from campaign data
  const rival: CampaignRival | undefined = rivalId
    ? CAMPAIGN_RIVALS.find((r) => r.id === rivalId)
    : undefined;

  const rivalStrategy = rival?.strategy ?? 'random';
  const rivalDifficulty = rival?.difficulty ?? 1;

  const gameStore = useGameStore();
  const {
    isRevealing,
    lastPlayerMove,
    lastOpponentMove,
    handleToss,
    chooseTossAction,
    submitMove,
    completeReveal,
    startNewGame,
  } = useGameEngine(mode, roomId, rivalStrategy, rivalDifficulty);

  const {
    phase,
    playerRole: role,
    currentInnings: innings,
    innings1,
    innings2,
    target,
    winner,
  } = gameStore;

  // Derive scores based on who batted when
  const currentInningsState = innings === 1 ? innings1 : innings2;
  const battingRuns = currentInningsState.runs;
  const balls = currentInningsState.balls;
  const history: (number | 'W')[] = currentInningsState.turnHistory.map((t) =>
    t.isOut ? 'W' : t.runsScored
  );

  // For the result screen, figure out total scores
  const playerBattedFirst = role === 'bowler'; // in innings 2, if player is bowling, they batted first
  const playerRuns = playerBattedFirst ? innings1.runs : innings2.runs;
  const opponentRuns = playerBattedFirst ? innings2.runs : innings1.runs;

  const handleTossComplete = (choice: string, _isWinner: boolean, _result: number, _comp: number) => {
    handleToss(choice as 'odd' | 'even');
  };

  const handleChoiceComplete = (choice: 'bat' | 'bowl') => {
    chooseTossAction(choice);
  };

  const handleMove = (move: number) => {
    submitMove(move as 1 | 2 | 3 | 4 | 5 | 6);
  };

  // Compute display target for the scoreboard
  const displayTarget = innings === 2 && target !== null ? target + 1 : undefined;

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col font-sans">
      
      {/* Background / 3D area placeholder */}
      <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-amber-900 opacity-80">
        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white text-5xl">
          [ 3D DeskReveal Area ]
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto">
        
        {/* Header / ScoreBoard area */}
        {(phase === 'batting' || phase === 'bowling') && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full mb-8"
          >
            <ScoreBoard 
              runs={battingRuns}
              balls={balls}
              innings={innings}
              target={displayTarget}
              role={role}
              history={history}
            />
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 border-amber-200/50 p-6 relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            {phase === 'toss' && (
              <motion.div key="toss" className="h-full" exit={{ opacity: 0 }}>
                <TossPhase onTossComplete={handleTossComplete} onChoiceComplete={handleChoiceComplete} />
              </motion.div>
            )}

            {phase === 'toss-result' && (
              <motion.div key="toss-result" className="h-full flex flex-col items-center justify-center text-center font-['Caveat']" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-4xl text-gray-800 mb-4">Opponent is thinking...</h2>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
              </motion.div>
            )}

            {(phase === 'batting' || phase === 'bowling') && (
              <motion.div 
                key="play" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-end pb-8"
              >
                <MoveSelector onMove={handleMove} disabled={isRevealing} role={role} />
              </motion.div>
            )}

            {isRevealing && lastPlayerMove !== null && lastOpponentMove !== null && (
              <motion.div key="reveal">
                <RevealPhase 
                  playerMove={lastPlayerMove} 
                  opponentMove={lastOpponentMove} 
                  isOut={lastPlayerMove === lastOpponentMove} 
                  runs={lastPlayerMove === lastOpponentMove ? 0 : (role === 'batter' ? lastPlayerMove : lastOpponentMove)} 
                  onComplete={completeReveal} 
                />
              </motion.div>
            )}

            {phase === 'innings-break' && (
              <motion.div 
                key="innings-break"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center font-['Caveat']"
              >
                <h2 className="text-6xl font-bold text-red-600 mb-4">OUT!</h2>
                <h3 className="text-4xl text-gray-800 mb-8">Innings Over</h3>
                <p className="text-2xl mb-8">Target to win: <span className="font-bold text-blue-700">{(target ?? 0) + 1}</span></p>
                <button 
                  onClick={() => gameStore.switchInnings()}
                  className="px-8 py-4 bg-blue-600 text-white text-3xl rounded shadow-[4px_4px_0_#1e3a8a] hover:bg-blue-700 active:translate-y-1 active:shadow-none"
                >
                  Start 2nd Innings
                </button>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result">
                <EndGameModal 
                  result={winner === 'player' ? 'win' : winner === 'opponent' ? 'loss' : 'tie'}
                  playerRuns={playerRuns}
                  opponentRuns={opponentRuns}
                  xpGained={winner === 'player' ? 100 : 25}
                  onPlayAgain={startNewGame}
                  onMenu={() => window.history.back()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HandCricketEngine;
