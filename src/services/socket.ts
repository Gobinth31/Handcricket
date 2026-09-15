import { io, type Socket } from 'socket.io-client';
import type { HandValue, PlayerInfo, RoomState, TossChoice, TossWinChoice } from '@/types/game';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(): Socket {
    if (this.socket?.connected) return this.socket;

    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || window.location.origin,
      {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.warn('🔌 Socket connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  // ─── Matchmaking ───────────────────────────────────────────────────

  joinQueue(playerInfo: PlayerInfo) {
    this.socket?.emit('join-queue', playerInfo);
  }

  leaveQueue() {
    this.socket?.emit('leave-queue');
  }

  // ─── Friend Rooms ──────────────────────────────────────────────────

  createRoom(playerInfo: PlayerInfo): Promise<string> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('create-room', playerInfo, (response: { code?: string; error?: string }) => {
        if (response.code) resolve(response.code);
        else reject(new Error(response.error || 'Failed to create room'));
      });
    });
  }

  joinRoom(code: string, playerInfo: PlayerInfo): Promise<RoomState> {
    return new Promise((resolve, reject) => {
      this.socket?.emit('join-room', { code, playerInfo }, (response: { room?: RoomState; error?: string }) => {
        if (response.room) resolve(response.room);
        else reject(new Error(response.error || 'Failed to join room'));
      });
    });
  }

  // ─── Game Actions ──────────────────────────────────────────────────

  playerReady(roomId: string) {
    this.socket?.emit('player-ready', roomId);
  }

  submitMove(roomId: string, move: HandValue) {
    this.socket?.emit('submit-move', { roomId, move });
  }

  submitTossChoice(roomId: string, choice: TossChoice) {
    this.socket?.emit('toss-choice', { roomId, choice });
  }

  submitTossWinChoice(roomId: string, choice: TossWinChoice) {
    this.socket?.emit('toss-win-choice', { roomId, choice });
  }

  // ─── Event Listeners ──────────────────────────────────────────────

  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback);
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: (...args: unknown[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
      this.listeners.get(event)?.delete(callback);
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  once(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.once(event, callback);
  }
}

export const socketService = new SocketService();
