import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NotebookOverlay from '../components/ui/NotebookOverlay';
import useSocket from '../hooks/useSocket';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const Lobby: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'instant' or 'friend'
  const navigate = useNavigate();
  const { isConnected, joinQueue, createRoom, joinRoom, error: socketError, roomState } = useSocket();
  const { user } = useAuthStore();
  
  const [roomCode, setRoomCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (socketError) {
      setErrorMsg(socketError);
      setIsFinding(false);
    }
  }, [socketError]);

  useEffect(() => {
    if (mode === 'instant' && isConnected && !isFinding) {
      handleInstantMatch();
    }
  }, [mode, isConnected]);

  // Navigate to game when match starts
  useEffect(() => {
    if (roomState?.status === 'toss' || roomState?.status === 'playing') {
      navigate(`/play?mode=online&room=${roomState.id}`);
    }
  }, [roomState?.status, roomState?.id, navigate]);

  const handleInstantMatch = () => {
    if (!isConnected) return;
    setIsFinding(true);
    joinQueue();
  };

  const handleCreateRoom = () => {
    if (!isConnected) return;
    createRoom((code) => {
      setGeneratedCode(code);
    });
  };

  const handleJoinRoom = () => {
    if (!isConnected || !roomCode) return;
    if (roomCode.length !== 4) {
      setErrorMsg("Room code must be 4 characters");
      return;
    }
    setErrorMsg('');
    joinRoom(roomCode.toUpperCase());
  };

  return (
    <NotebookOverlay>
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-8 pl-12 relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 md:top-8 md:right-8 paper-card doodle-border px-4 py-2 text-xl handwritten-patrick hover:bg-gray-100"
        >
          ← Back
        </button>

        <div className="w-full max-w-lg paper-card doodle-border p-8 bg-white/90">
          <h1 className="text-5xl handwritten-caveat text-center mb-2 text-[var(--color-ink-blue)]">
            Multiplayer Lobby
          </h1>
          <p className="text-xl handwritten-indie text-center mb-8 text-[var(--color-ink-red)]">
            {mode === 'instant' ? 'Finding a random opponent...' : 'Play with a friend'}
          </p>

          {!isConnected ? (
            <div className="text-center text-2xl handwritten-patrick animate-pulse text-gray-600">
              Connecting to server...
            </div>
          ) : (
            <div className="w-full">
              {mode === 'instant' ? (
                <div className="flex flex-col items-center py-10">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="text-6xl mb-6"
                  >
                    ⏳
                  </motion.div>
                  <p className="text-2xl handwritten-patrick text-center">
                    {isFinding ? "Searching the classroom for an opponent..." : "Ready to find a match?"}
                  </p>
                  {!isFinding && (
                    <button 
                      onClick={handleInstantMatch}
                      className="mt-6 paper-card doodle-border px-6 py-2 text-2xl handwritten-caveat text-[var(--color-ink-blue)] hover:text-[var(--color-ink-red)]"
                    >
                      Start Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-8 w-full">
                  {/* Create Room Section */}
                  <div className="p-4 border-2 border-dashed border-[var(--color-ink-blue)] rounded-xl relative">
                    <h2 className="absolute -top-4 left-4 bg-white px-2 text-xl handwritten-indie">Create</h2>
                    {generatedCode ? (
                      <div className="text-center">
                        <p className="text-lg handwritten-patrick mb-2">Share this code with your friend:</p>
                        <div className="text-4xl handwritten-caveat font-bold tracking-widest text-[var(--color-ink-red)] mb-4">
                          {generatedCode}
                        </div>
                        <p className="text-md handwritten-patrick text-gray-500">Waiting for them to join...</p>
                        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mt-2">
                          👀
                        </motion.div>
                      </div>
                    ) : (
                      <button 
                        onClick={handleCreateRoom}
                        className="w-full paper-card doodle-border px-4 py-3 text-2xl handwritten-caveat text-[var(--color-ink-blue)] hover:bg-gray-50"
                      >
                        Create New Room
                      </button>
                    )}
                  </div>

                  {/* Join Room Section */}
                  {!generatedCode && (
                    <div className="p-4 border-2 border-dashed border-[var(--color-ink-blue)] rounded-xl relative">
                      <h2 className="absolute -top-4 left-4 bg-white px-2 text-xl handwritten-indie">Join</h2>
                      <div className="flex flex-col gap-4">
                        <input
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                          placeholder="Enter 4-letter code"
                          className="w-full p-3 bg-transparent border-b-2 border-[var(--color-paper-line)] text-center text-3xl handwritten-caveat outline-none focus:border-[var(--color-ink-blue)] uppercase tracking-widest"
                          maxLength={4}
                        />
                        <button 
                          onClick={handleJoinRoom}
                          disabled={roomCode.length !== 4}
                          className={`w-full paper-card doodle-border px-4 py-3 text-2xl handwritten-caveat ${roomCode.length === 4 ? 'text-[var(--color-ink-blue)] hover:bg-gray-50' : 'text-gray-400 opacity-50 cursor-not-allowed'}`}
                        >
                          Join Room
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-6 text-center text-[var(--color-ink-red)] handwritten-patrick text-xl">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>
      </div>
    </NotebookOverlay>
  );
};

export default Lobby;
