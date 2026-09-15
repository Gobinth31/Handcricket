import { create } from 'zustand';
import type {
  GamePhase,
  GameState,
  HandValue,
  InningsState,
  PlayerInfo,
  PlayerRole,
  TurnResult,
} from '@/types/game';

const createEmptyInnings = (): InningsState => ({
  runs: 0,
  balls: 0,
  turnHistory: [],
  isComplete: false,
});

const initialGameState: GameState = {
  phase: 'idle',
  player: {
    id: '',
    displayName: 'Player',
    avatar: 'backbencher',
    isReady: false,
  },
  opponent: null,
  tossWinner: null,
  playerRole: 'batter',
  currentInnings: 1,
  innings1: createEmptyInnings(),
  innings2: createEmptyInnings(),
  target: null,
  winner: null,
  timer: 10,
  isTimerRunning: false,
};

interface GameStore extends GameState {
  // Phase transitions
  setPhase: (phase: GamePhase) => void;
  startToss: () => void;
  setTossResult: (winner: 'player' | 'opponent', choice: 'bat' | 'bowl') => void;
  startInnings: () => void;

  // Player management
  setPlayer: (player: Partial<PlayerInfo>) => void;
  setOpponent: (opponent: PlayerInfo | null) => void;

  // Gameplay
  submitTurn: (playerMove: HandValue, opponentMove: HandValue) => TurnResult;
  endInnings: () => void;
  switchInnings: () => void;
  setWinner: (winner: 'player' | 'opponent' | 'tie') => void;

  // Timer
  setTimer: (time: number) => void;
  setTimerRunning: (running: boolean) => void;

  // Game mode & init
  gameMode?: 'solo' | 'multiplayer';
  setGameMode: (mode: 'solo' | 'multiplayer') => void;
  initializeGame: () => void;

  // Reset
  resetGame: () => void;

  // Computed
  getCurrentInnings: () => InningsState;
  getBattingScore: () => number;
  getTarget: () => number | null;
  isPlayerBatting: () => boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  setPhase: (phase) => set({ phase }),

  startToss: () => set({ phase: 'toss' }),

  setTossResult: (winner, choice) => {
    const isPlayerBatting =
      (winner === 'player' && choice === 'bat') ||
      (winner === 'opponent' && choice === 'bowl');

    set({
      phase: 'toss-result',
      tossWinner: winner,
      playerRole: isPlayerBatting ? 'batter' : 'bowler',
    });
  },

  startInnings: () => {
    const { playerRole } = get();
    set({
      phase: playerRole === 'batter' ? 'batting' : 'bowling',
      isTimerRunning: true,
      timer: 10,
    });
  },

  setPlayer: (player) =>
    set((state) => ({
      player: { ...state.player, ...player },
    })),

  setOpponent: (opponent) => set({ opponent }),

  submitTurn: (playerMove, opponentMove) => {
    const state = get();
    const isPlayerBatting = state.playerRole === 'batter';
    const batterMove = isPlayerBatting ? playerMove : opponentMove;
    const bowlerMove = isPlayerBatting ? opponentMove : playerMove;

    const isOut = batterMove === bowlerMove;
    const runsScored = isOut ? 0 : batterMove;

    const result: TurnResult = {
      batterMove,
      bowlerMove,
      runsScored,
      isOut,
      timestamp: Date.now(),
    };

    const inningsKey = state.currentInnings === 1 ? 'innings1' : 'innings2';
    const currentInnings = state[inningsKey];

    const updatedInnings: InningsState = {
      runs: currentInnings.runs + runsScored,
      balls: currentInnings.balls + 1,
      turnHistory: [...currentInnings.turnHistory, result],
      isComplete: isOut,
    };

    // Check if chasing team has exceeded target
    if (state.currentInnings === 2 && state.target !== null) {
      if (updatedInnings.runs > state.target) {
        // Chasing team wins
        const chaserIsPlayer = state.playerRole === 'batter';
        set({
          [inningsKey]: updatedInnings,
          winner: chaserIsPlayer ? 'player' : 'opponent',
          phase: 'result',
          isTimerRunning: false,
        });
        return result;
      }
    }

    if (isOut) {
      if (state.currentInnings === 1) {
        set({
          [inningsKey]: updatedInnings,
          target: updatedInnings.runs,
          phase: 'innings-break',
          isTimerRunning: false,
        });
      } else {
        // Second innings out — compare scores
        const innings1Runs = state.innings1.runs;
        const innings2Runs = updatedInnings.runs;
        let winner: 'player' | 'opponent' | 'tie';

        if (innings1Runs === innings2Runs) {
          winner = 'tie';
        } else {
          // Whoever batted first is stored in innings1
          // In innings 2, playerRole is swapped — so if player is bowling in inn2, they batted first
          const playerBattedFirst = state.playerRole === 'bowler';
          const inn1Higher = innings1Runs > innings2Runs;
          winner = inn1Higher
            ? (playerBattedFirst ? 'player' : 'opponent')
            : (playerBattedFirst ? 'opponent' : 'player');
        }

        set({
          [inningsKey]: updatedInnings,
          winner,
          phase: 'result',
          isTimerRunning: false,
        });
      }
    } else {
      set({
        [inningsKey]: updatedInnings,
        timer: 10,
      });
    }

    return result;
  },

  endInnings: () => {
    const state = get();
    const inningsKey = state.currentInnings === 1 ? 'innings1' : 'innings2';
    set({
      [inningsKey]: { ...state[inningsKey], isComplete: true },
    });
  },

  switchInnings: () => {
    set((state) => ({
      currentInnings: 2,
      playerRole: state.playerRole === 'batter' ? 'bowler' : 'batter',
      phase: state.playerRole === 'batter' ? 'bowling' : 'batting',
      innings2: createEmptyInnings(),
      timer: 10,
      isTimerRunning: true,
    }));
  },

  setWinner: (winner) => set({ winner, phase: 'result', isTimerRunning: false }),

  setTimer: (time) => set({ timer: time }),
  setTimerRunning: (running) => set({ isTimerRunning: running }),

  gameMode: 'solo',
  setGameMode: (mode) => set({ gameMode: mode }),
  initializeGame: () => {
    get().resetGame();
    set({ phase: 'toss' });
  },

  resetGame: () => set({ ...initialGameState }),

  getCurrentInnings: () => {
    const state = get();
    return state.currentInnings === 1 ? state.innings1 : state.innings2;
  },

  getBattingScore: () => {
    const state = get();
    const innings = state.currentInnings === 1 ? state.innings1 : state.innings2;
    return innings.runs;
  },

  getTarget: () => get().target,

  isPlayerBatting: () => get().playerRole === 'batter',
}));
