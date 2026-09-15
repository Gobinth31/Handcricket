import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Types (simplified version of shared types for the server)
type PlayerId = string;

interface PlayerState {
  id: PlayerId;
  username: string;
  score: number;
  wickets: number;
  ballsFaced: number;
  isBatting: boolean;
  currentMove: number | null;
  hasSubmitted: boolean;
  ready: boolean;
}

interface RoomState {
  id: string;
  players: Record<PlayerId, PlayerState>;
  status: 'waiting' | 'toss' | 'playing' | 'finished';
  currentInnings: 1 | 2;
  tossWinner: PlayerId | null;
  targetScore: number | null;
  logs: string[];
  createdAt: number;
}

// State
const rooms = new Map<string, RoomState>();
const matchmakingQueue: Array<{ socketId: string, username: string }> = [];

// Helper functions
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Make sure it doesn't exist
  if (rooms.has(result)) return generateRoomCode();
  return result;
};

const createNewRoom = (id: string = uuidv4()): RoomState => {
  return {
    id,
    players: {},
    status: 'waiting',
    currentInnings: 1,
    tossWinner: null,
    targetScore: null,
    logs: [],
    createdAt: Date.now()
  };
};

const joinRoom = (room: RoomState, socketId: string, username: string) => {
  room.players[socketId] = {
    id: socketId,
    username,
    score: 0,
    wickets: 0,
    ballsFaced: 0,
    isBatting: false,
    currentMove: null,
    hasSubmitted: false,
    ready: false
  };
  
  if (Object.keys(room.players).length === 2) {
    room.status = 'toss';
  }
};

const processTurn = (room: RoomState) => {
  const playerIds = Object.keys(room.players);
  if (playerIds.length !== 2) return;
  
  const p1 = room.players[playerIds[0]];
  const p2 = room.players[playerIds[1]];
  
  if (p1.currentMove === null || p2.currentMove === null) return;
  
  let batter = p1.isBatting ? p1 : p2;
  let bowler = p1.isBatting ? p2 : p1;
  
  let isOut = batter.currentMove === bowler.currentMove;
  let runsScored = isOut ? 0 : batter.currentMove;
  
  // Update state
  batter.ballsFaced += 1;
  
  if (isOut) {
    batter.wickets += 1;
    
    // Check innings change or game end
    if (room.currentInnings === 1) {
      room.currentInnings = 2;
      room.targetScore = batter.score + 1;
      batter.isBatting = false;
      bowler.isBatting = true;
    } else {
      room.status = 'finished';
    }
  } else {
    batter.score += runsScored;
    
    // Check if target chased
    if (room.currentInnings === 2 && room.targetScore && batter.score >= room.targetScore) {
      room.status = 'finished';
    }
  }
  
  const turnResult = {
    batterMove: batter.currentMove,
    bowlerMove: bowler.currentMove,
    isOut,
    runsScored,
    newState: room
  };
  
  // Reset moves
  p1.currentMove = null;
  p2.currentMove = null;
  p1.hasSubmitted = false;
  p2.hasSubmitted = false;
  
  io.to(room.id).emit('turn-result', turnResult);
  
  if (room.status === 'finished') {
    let winner = 'tie';
    if (batter.score > bowler.score) winner = batter.id;
    else if (bowler.score > batter.score) winner = bowler.id;
    io.to(room.id).emit('game-over', { winner, room });
  }
};

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Matchmaking
  socket.on('join-queue', (userData) => {
    console.log(`${socket.id} joined queue`);
    const username = userData?.username || `Player-${socket.id.substring(0, 4)}`;
    
    // Remove if already in queue
    const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (index !== -1) matchmakingQueue.splice(index, 1);
    
    matchmakingQueue.push({ socketId: socket.id, username });
    
    if (matchmakingQueue.length >= 2) {
      const p1 = matchmakingQueue.shift()!;
      const p2 = matchmakingQueue.shift()!;
      
      const roomId = uuidv4();
      const room = createNewRoom(roomId);
      rooms.set(roomId, room);
      
      joinRoom(room, p1.socketId, p1.username);
      joinRoom(room, p2.socketId, p2.username);
      
      const socket1 = io.sockets.sockets.get(p1.socketId);
      const socket2 = io.sockets.sockets.get(p2.socketId);
      
      if (socket1) socket1.join(roomId);
      if (socket2) socket2.join(roomId);
      
      io.to(roomId).emit('match-found', { room, roomId });
      console.log(`Match created: ${roomId} between ${p1.socketId} and ${p2.socketId}`);
    }
  });
  
  // Private rooms
  socket.on('create-room', (userData, callback) => {
    const username = userData?.username || `Player-${socket.id.substring(0, 4)}`;
    const code = generateRoomCode();
    const room = createNewRoom(code);
    rooms.set(code, room);
    
    joinRoom(room, socket.id, username);
    socket.join(code);
    
    console.log(`Room created: ${code} by ${socket.id}`);
    
    if (typeof callback === 'function') {
      callback({ code, room });
    }
  });
  
  socket.on('join-room', (data, callback) => {
    const { code, username } = data;
    const name = username || `Player-${socket.id.substring(0, 4)}`;
    const room = rooms.get(code);
    
    if (!room) {
      if (typeof callback === 'function') callback({ error: 'Room not found' });
      return;
    }
    
    if (Object.keys(room.players).length >= 2) {
      if (typeof callback === 'function') callback({ error: 'Room is full' });
      return;
    }
    
    joinRoom(room, socket.id, name);
    socket.join(code);
    
    console.log(`${socket.id} joined room: ${code}`);
    
    if (typeof callback === 'function') {
      callback({ success: true, room });
    }
    
    socket.to(code).emit('opponent-joined', { room });
    
    if (room.status === 'toss') {
      io.to(code).emit('room-state-update', room);
    }
  });
  
  // Gameplay
  socket.on('toss-choice', (data) => {
    const { roomId, choice } = data; // 'bat' or 'bowl'
    const room = rooms.get(roomId);
    
    if (!room || room.status !== 'toss') return;
    
    const playerIds = Object.keys(room.players);
    const opponentId = playerIds.find(id => id !== socket.id)!;
    
    room.tossWinner = socket.id;
    
    if (choice === 'bat') {
      room.players[socket.id].isBatting = true;
      room.players[opponentId].isBatting = false;
    } else {
      room.players[socket.id].isBatting = false;
      room.players[opponentId].isBatting = true;
    }
    
    room.status = 'playing';
    io.to(roomId).emit('toss-result', { winner: socket.id, choice, room });
    io.to(roomId).emit('room-state-update', room);
  });
  
  socket.on('submit-move', (data) => {
    const { roomId, move } = data;
    const room = rooms.get(roomId);
    
    if (!room || room.status !== 'playing') return;
    
    const player = room.players[socket.id];
    if (!player) return;
    
    player.currentMove = move;
    player.hasSubmitted = true;
    
    socket.to(roomId).emit('opponent-moved');
    
    // Check if both players have submitted
    const allSubmitted = Object.values(room.players).every(p => p.hasSubmitted);
    
    if (allSubmitted) {
      processTurn(room);
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from queue
    const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (index !== -1) matchmakingQueue.splice(index, 1);
    
    // Handle rooms
    rooms.forEach((room, roomId) => {
      if (room.players[socket.id]) {
        // Player was in this room
        socket.to(roomId).emit('opponent-disconnected');
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted because player disconnected`);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
