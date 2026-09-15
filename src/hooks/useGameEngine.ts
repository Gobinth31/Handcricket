import { useCallback, useState, useEffect } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { audioManager } from '@/services/audio';
import type { HandValue, TossChoice } from '@/types/game';
import useSocket from '@/hooks/useSocket';

// ─── AI Strategy for Campaign Mode ────────────────────────────────────

type Strategy = 'random' | 'aggressive' | 'defensive' | 'pattern' | 'smart';

function getAIMove(strategy: Strategy, history: HandValue[], difficulty: number = 1): HandValue {
  switch (strategy) {
    case 'random':
      return (Math.floor(Math.random() * 6) + 1) as HandValue;

    case 'aggressive': {
      // Favor high numbers (4, 5, 6)
      const aggressiveWeights = [1, 1, 1, 4, 5, 6];
      const aggressiveTotal = aggressiveWeights.reduce((a, b) => a + b, 0);
      let aggressiveRand = Math.random() * aggressiveTotal;
      for (let i = 0; i < aggressiveWeights.length; i++) {
        aggressiveRand -= aggressiveWeights[i];
        if (aggressiveRand <= 0) return (i + 1) as HandValue;
      }
      return 6;
    }

    case 'defensive': {
      // Favor low numbers (1, 2, 3)
      const defensiveWeights = [6, 5, 4, 1, 1, 1];
      const defensiveTotal = defensiveWeights.reduce((a, b) => a + b, 0);
      let defensiveRand = Math.random() * defensiveTotal;
      for (let i = 0; i < defensiveWeights.length; i++) {
        defensiveRand -= defensiveWeights[i];
        if (defensiveRand <= 0) return (i + 1) as HandValue;
      }
      return 1;
    }

    case 'pattern': {
      // Try to match the player's most common move when bowling, avoid when batting
      if (history.length >= 3) {
        const freq: Record<number, number> = {};
        history.slice(-3).forEach((m) => {
          freq[m] = (freq[m] || 0) + 1;
        });
        const mostCommon = parseInt(Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0]);
        
        const isPlayerBatting = useGameStore.getState().isPlayerBatting();
        if (isPlayerBatting) {
          // AI is bowling, try to match (50% chance)
          if (Math.random() < 0.5) return mostCommon as HandValue;
        } else {
          // AI is batting, try to avoid
          const avoidMoves = [1, 2, 3, 4, 5, 6].filter(m => m !== mostCommon);
          return avoidMoves[Math.floor(Math.random() * avoidMoves.length)] as HandValue;
        }
      }
      return (Math.floor(Math.random() * 6) + 1) as HandValue;
    }

    case 'smart': {
      // Analyze frequency of last 6 moves and try to predict
      if (history.length >= 6) {
        const freq: Record<number, number> = {};
        history.slice(-6).forEach((m) => {
          freq[m] = (freq[m] || 0) + 1;
        });
        const mostCommon = parseInt(Object.entries(freq).sort(([, a], [, b]) => b - a)[0][0]);
        
        const predictionChance = 0.6 + ((difficulty - 1) * 0.025);
        const rand = Math.random();
        
        if (rand < predictionChance) {
          return mostCommon as HandValue;
        } else if (rand < predictionChance + 0.2) {
          const avoidMoves = [1, 2, 3, 4, 5, 6].filter(m => m !== mostCommon);
          return avoidMoves[Math.floor(Math.random() * avoidMoves.length)] as HandValue;
        }
      }
      return (Math.floor(Math.random() * 6) + 1) as HandValue;
    }

    default:
      return (Math.floor(Math.random() * 6) + 1) as HandValue;
  }
}

// ─── Main Game Engine Hook ─────────────────────────────────────────────

export function useGameEngine(mode: 'solo' | 'online' = 'solo', roomId?: string, rivalStrategy: Strategy = 'random', rivalDifficulty: number = 1) {
  const gameStore = useGameStore();
  const authStore = useAuthStore();
  const [isRevealing, setIsRevealing] = useState(false);
  const [lastPlayerMove, setLastPlayerMove] = useState<HandValue | null>(null);
  const [lastOpponentMove, setLastOpponentMove] = useState<HandValue | null>(null);
  const [playerMoveHistory, setPlayerMoveHistory] = useState<HandValue[]>([]);
  const [aiStrategy] = useState<Strategy>(rivalStrategy);
  const { lastTurnResult, submitMove: socketSubmitMove, submitTossChoice: socketSubmitTossChoice, submitTossWinChoice: socketSubmitTossWinChoice } = useSocket(roomId);

  useEffect(() => {
    if (mode === 'online' && lastTurnResult && isRevealing) {
      const role = gameStore.playerRole;
      const oppMove = role === 'batter' ? lastTurnResult.bowlerMove : lastTurnResult.batterMove;
      setLastOpponentMove(oppMove);
    }
  }, [lastTurnResult, mode, isRevealing, gameStore.playerRole]);

  const handleToss = useCallback(
    (choice: TossChoice) => {
      audioManager.play('coin-flip');

      if (mode === 'online') {
        socketSubmitTossChoice(choice);
        return { playerNum: 0, aiNum: 0, sum: 0, playerWon: false }; // TossPhase handles this weirdly
      }

      const aiChoice: TossChoice = Math.random() > 0.5 ? 'odd' : 'even';
      const playerNum = Math.floor(Math.random() * 6) + 1;
      const aiNum = Math.floor(Math.random() * 6) + 1;
      const sum = playerNum + aiNum;
      const isOdd = sum % 2 !== 0;

      const winningChoice: TossChoice = isOdd ? 'odd' : 'even';
      const playerWon = choice === winningChoice;

      setTimeout(() => {
        gameStore.setTossResult(
          playerWon ? 'player' : 'opponent',
          playerWon ? 'bat' : (Math.random() > 0.5 ? 'bat' : 'bowl') // AI randomly picks when it wins toss
        );
      }, 1500);

      return { playerNum, aiNum, sum, playerWon };
    },
    [gameStore, mode, socketSubmitTossChoice]
  );

  const chooseTossAction = useCallback(
    (choice: 'bat' | 'bowl') => {
      if (mode === 'online') {
        socketSubmitTossWinChoice(choice);
      }
      gameStore.setTossResult(gameStore.tossWinner!, choice);
      setTimeout(() => {
        gameStore.startInnings();
        audioManager.startAmbient();
      }, 1000);
    },
    [gameStore, mode, socketSubmitTossWinChoice]
  );

  const submitMove = useCallback(
    (playerMove: HandValue) => {
      if (isRevealing) return;

      setIsRevealing(true);
      setLastPlayerMove(playerMove);

      if (mode === 'online') {
        socketSubmitMove(playerMove);
        setPlayerMoveHistory((prev) => [...prev, playerMove]);
        audioManager.play('hand-tap');
        return;
      }

      // Get AI move (for solo mode)
      const opponentMove = getAIMove(aiStrategy, playerMoveHistory, rivalDifficulty);
      setLastOpponentMove(opponentMove);
      setPlayerMoveHistory((prev) => [...prev, playerMove]);

      audioManager.play('hand-tap');
    },
    [isRevealing, aiStrategy, playerMoveHistory, rivalDifficulty, mode, socketSubmitMove]
  );

  const completeReveal = useCallback(() => {
    if (lastPlayerMove === null || lastOpponentMove === null) return;
    
    const result = gameStore.submitTurn(lastPlayerMove, lastOpponentMove);

    if (result.isOut) {
      audioManager.play('desk-slam');
    }

    setIsRevealing(false);

    const currentState = useGameStore.getState();

    // Check if game should transition
    if (result.isOut && currentState.phase === 'innings-break') {
      // Just wait for user to click the "Start 2nd Innings" button
    }

    if (currentState.phase === 'result') {
      audioManager.stopAmbient();
      audioManager.playSchoolBell();

      // Update user stats
      if (authStore.user && currentState.winner) {
        const stats = { ...authStore.user.stats };
        stats.totalMatches++;
        const currentInnings = currentState.playerRole === 'batter'
          ? currentState.innings2
          : currentState.innings1;
        stats.totalRuns += currentInnings.runs;
        if (currentState.winner === 'player') {
          stats.wins++;
          stats.currentStreak++;
          stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
        } else if (currentState.winner === 'opponent') {
          stats.losses++;
          stats.currentStreak = 0;
        } else {
          stats.ties++;
        }
        stats.highestScore = Math.max(stats.highestScore, currentInnings.runs);
        authStore.updateStats(stats);
      }
    }
  }, [gameStore, lastPlayerMove, lastOpponentMove, authStore]);

  const startNewGame = useCallback(() => {
    gameStore.resetGame();
    setIsRevealing(false);
    setLastPlayerMove(null);
    setLastOpponentMove(null);
    setPlayerMoveHistory([]);
    gameStore.setPhase('toss');
  }, [gameStore]);

  return {
    // State
    isRevealing,
    lastPlayerMove,
    lastOpponentMove,

    // Actions
    handleToss,
    chooseTossAction,
    submitMove,
    completeReveal,
    startNewGame,
  };
}
