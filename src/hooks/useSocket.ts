import { useEffect, useRef, useCallback, useState } from 'react';
import { socketService } from '@/services/socket';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import type { HandValue, PlayerInfo, RoomState, TossChoice, TossWinChoice } from '@/types/game';

export function useSocket(roomId?: string) {
  const socketRef = useRef(socketService);
  const gameStore = useGameStore();
  const authStore = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastTurnResult, setLastTurnResult] = useState<any>(null);

  const getPlayer = useCallback((): PlayerInfo => {
    const user = authStore.user;
    return {
      id: user?.uid || 'guest_' + Math.random().toString(36).substring(2, 7),
      displayName: user?.displayName || 'Player',
      avatar: user?.avatar || 'backbencher',
      isReady: true,
    };
  }, [authStore.user]);

  useEffect(() => {
    const socket = socketRef.current;
    const socketInstance = socket.connect();
    
    setIsConnected(socketInstance.connected);
    
    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    socket.on('match-found', (payload: any) => {
      const room = payload.room || payload;
      setRoomState({ id: payload.roomId || room.id, status: 'toss', ...room });
      if (room.players) {
        const pKeys = Object.keys(room.players);
        const opponentKey = pKeys.find(k => k !== socketInstance.id) || pKeys[1];
        if (opponentKey && room.players[opponentKey]) {
          gameStore.setOpponent(room.players[opponentKey]);
        }
      }
      gameStore.setPhase('toss');
    });

    socket.on('opponent-joined', (payload: any) => {
      const room = payload.room || payload;
      if (room && room.players) {
        const pKeys = Object.keys(room.players);
        const opponentKey = pKeys.find(k => k !== socketInstance.id) || pKeys[1];
        if (opponentKey && room.players[opponentKey]) {
          const opp = room.players[opponentKey];
          gameStore.setOpponent(opp as PlayerInfo);
          setRoomState((prev: any) => ({ ...prev, status: 'toss', opponent: opp }));
        }
      }
    });

    socket.on('toss-result', (result: any) => {
       const isPlayerWinner = result.winner === socketInstance.id;
       gameStore.setTossResult(isPlayerWinner ? 'player' : 'opponent', result.choice);
       setTimeout(() => {
         gameStore.startInnings();
       }, 1000);
    });

    socket.on('turn-result', (result: any) => {
      setLastTurnResult(result);
    });

    socket.on('game-over', (result: any) => {
      gameStore.setWinner(result.winner as 'player' | 'opponent' | 'tie');
      setRoomState((prev: any) => ({ ...prev, status: 'result' }));
    });

    socket.on('opponent-disconnected', () => {
      gameStore.setWinner('player');
      setError('Opponent disconnected!');
    });

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socket.off('match-found');
      socket.off('opponent-joined');
      socket.off('toss-result');
      socket.off('turn-result');
      socket.off('game-over');
      socket.off('opponent-disconnected');
    };
  }, [gameStore]);

  const joinQueue = useCallback(
    (playerInfo?: PlayerInfo) => {
      const p = playerInfo || getPlayer();
      socketRef.current.joinQueue(p);
    },
    [getPlayer]
  );

  const createRoom = useCallback(
    async (callbackOrPlayer?: ((code: string) => void) | PlayerInfo) => {
      try {
        setError(null);
        let p: PlayerInfo;
        let cb: ((code: string) => void) | undefined;
        if (typeof callbackOrPlayer === 'function') {
          cb = callbackOrPlayer;
          p = getPlayer();
        } else if (callbackOrPlayer) {
          p = callbackOrPlayer;
        } else {
          p = getPlayer();
        }

        const code = await socketRef.current.createRoom(p);
        if (cb) cb(code);
        setRoomState({ id: code, code, status: 'waiting' });
        return code;
      } catch (err: any) {
        setError(err.message || 'Failed to create room');
      }
    },
    [getPlayer]
  );

  const joinRoom = useCallback(
    async (code: string, playerInfo?: PlayerInfo) => {
      try {
        setError(null);
        const p = playerInfo || getPlayer();
        const room = await socketRef.current.joinRoom(code, p);
        
        if (room && room.players) {
          const pKeys = Object.keys(room.players);
          const opponentKey = pKeys.find(k => k !== socketRef.current.getSocket()?.id) || pKeys[0];
          if (opponentKey && room.players[opponentKey]) {
            gameStore.setOpponent(room.players[opponentKey] as unknown as PlayerInfo);
          }
        }
        
        setRoomState({ id: room.roomId || code, ...room, status: 'toss' });
        return room;
      } catch (err: any) {
        setError(err.message || 'Failed to join room');
      }
    },
    [getPlayer]
  );

  const submitMove = useCallback(
    (move: HandValue) => {
      if (roomId) socketRef.current.submitMove(roomId, move);
    },
    [roomId]
  );

  const submitTossChoice = useCallback(
    (choice: TossChoice) => {
      if (roomId) socketRef.current.submitTossChoice(roomId, choice);
    },
    [roomId]
  );

  const submitTossWinChoice = useCallback(
    (choice: TossWinChoice) => {
      if (roomId) socketRef.current.submitTossWinChoice(roomId, choice);
    },
    [roomId]
  );

  return {
    isConnected,
    error,
    roomState,
    lastTurnResult,
    joinQueue,
    createRoom,
    joinRoom,
    submitMove,
    submitTossChoice,
    submitTossWinChoice,
  };
}

export default useSocket;
