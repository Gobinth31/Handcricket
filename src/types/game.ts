// ─── Game Types & Interfaces ───────────────────────────────────────────

export type HandValue = 1 | 2 | 3 | 4 | 5 | 6;

export type GamePhase =
  | 'idle'
  | 'toss'
  | 'toss-result'
  | 'batting'
  | 'bowling'
  | 'innings-break'
  | 'chasing'
  | 'result';

export type TossChoice = 'odd' | 'even';
export type TossWinChoice = 'bat' | 'bowl';
export type PlayerRole = 'batter' | 'bowler';

export interface TurnResult {
  batterMove: HandValue;
  bowlerMove: HandValue;
  runsScored: number;
  isOut: boolean;
  timestamp: number;
}

export interface InningsState {
  runs: number;
  balls: number;
  turnHistory: TurnResult[];
  isComplete: boolean;
}

export interface PlayerInfo {
  id: string;
  displayName: string;
  avatar: AvatarType;
  isReady: boolean;
}

export interface GameState {
  phase: GamePhase;
  player: PlayerInfo;
  opponent: PlayerInfo | null;
  tossWinner: 'player' | 'opponent' | null;
  playerRole: PlayerRole;
  currentInnings: 1 | 2;
  innings1: InningsState;
  innings2: InningsState;
  target: number | null;
  winner: 'player' | 'opponent' | 'tie' | null;
  timer: number;
  isTimerRunning: boolean;
}

// ─── Avatar Types ──────────────────────────────────────────────────────

export type AvatarType =
  | 'backbencher'
  | 'class-monitor'
  | 'sports-captain'
  | 'nerd'
  | 'artist'
  | 'prankster';

export const AVATAR_CONFIG: Record<AvatarType, { label: string; emoji: string; color: string }> = {
  'backbencher': { label: 'Backbencher', emoji: '😎', color: '#e74c3c' },
  'class-monitor': { label: 'Class Monitor', emoji: '🤓', color: '#3498db' },
  'sports-captain': { label: 'Sports Captain', emoji: '🏏', color: '#2ecc71' },
  'nerd': { label: 'Topper', emoji: '📚', color: '#9b59b6' },
  'artist': { label: 'Artist', emoji: '🎨', color: '#f39c12' },
  'prankster': { label: 'Prankster', emoji: '🤡', color: '#e67e22' },
};

// ─── Campaign Types ────────────────────────────────────────────────────

export interface CampaignRival {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  avatar: AvatarType;
  strategy: 'random' | 'aggressive' | 'defensive' | 'pattern' | 'smart';
  reward: string;
  isUnlocked: boolean;
  isDefeated: boolean;
}

export interface CampaignProgress {
  currentRival: number;
  rivalsDefeated: string[];
  rewards: string[];
  totalXP: number;
}

// ─── User Profile Types ────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatar: AvatarType;
  stats: UserStats;
  campaign: CampaignProgress;
  createdAt: number;
}

export interface UserStats {
  totalMatches: number;
  matchesPlayed?: number;
  wins: number;
  matchesWon?: number;
  losses: number;
  ties: number;
  highestScore: number;
  totalRuns: number;
  wicketsTaken: number;
  currentStreak: number;
  bestStreak: number;
}

// ─── Multiplayer Types ─────────────────────────────────────────────────

export type RoomType = 'instant' | 'friend';

export interface RoomState {
  roomId: string;
  roomCode?: string;
  type: RoomType;
  players: Record<string, PlayerInfo>;
  gameState: GameState | null;
  createdAt: number;
}

export interface SocketEvents {
  // Client → Server
  'join-queue': () => void;
  'leave-queue': () => void;
  'create-room': (callback: (code: string) => void) => void;
  'join-room': (code: string, callback: (success: boolean) => void) => void;
  'player-ready': (roomId: string) => void;
  'submit-move': (roomId: string, move: HandValue) => void;
  'toss-choice': (roomId: string, choice: TossChoice) => void;
  'toss-win-choice': (roomId: string, choice: TossWinChoice) => void;

  // Server → Client
  'match-found': (room: RoomState) => void;
  'opponent-joined': (opponent: PlayerInfo) => void;
  'opponent-ready': () => void;
  'toss-result': (result: { winner: string; playerChoice: TossChoice; opponentChoice: TossChoice }) => void;
  'turn-result': (result: TurnResult & { playerRole: PlayerRole }) => void;
  'innings-complete': (innings: InningsState) => void;
  'game-over': (result: { winner: string; innings1: InningsState; innings2: InningsState }) => void;
  'opponent-disconnected': () => void;
  'timer-tick': (seconds: number) => void;
}

// ─── Hand Gesture Labels ───────────────────────────────────────────────

export const HAND_LABELS: Record<HandValue, string> = {
  1: '☝️ One',
  2: '✌️ Two',
  3: '🤟 Three',
  4: '🖖 Four',
  5: '🖐️ Five',
  6: '✊ Six (Fist)',
};
