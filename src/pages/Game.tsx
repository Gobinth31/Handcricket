import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClassroomScene from '../components/3d/ClassroomScene';
import HandCricketEngine from '../components/gameplay/HandCricketEngine';
import { useGameStore } from '../stores/gameStore';

const Game: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as 'solo' | 'online' | null;
  const rivalId = searchParams.get('rival');
  const roomId = searchParams.get('room');
  const { setGameMode, initializeGame } = useGameStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (mode === 'solo' && rivalId) {
      setGameMode('solo');
      // In a real app, fetch rival details and set up state
      initializeGame();
      setInitialized(true);
    } else if (mode === 'online' && roomId) {
      setGameMode('multiplayer');
      // WebSocket initialization would happen here or in a wrapper component
      initializeGame();
      setInitialized(true);
    } else {
      // Default or fallback
      setGameMode('solo');
      initializeGame();
      setInitialized(true);
    }
  }, [mode, rivalId, roomId, setGameMode, initializeGame]);

  if (!initialized) {
    return <div className="h-screen w-full flex items-center justify-center bg-[var(--color-paper)] font-caveat text-4xl">Loading Game...</div>;
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <React.Suspense fallback={null}>
          <ClassroomScene />
        </React.Suspense>
      </div>

      {/* 2D Game UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* The GameEngine component manages its own pointer events for interactive elements */}
        <div className="pointer-events-auto h-full">
          <HandCricketEngine mode={mode || 'solo'} roomId={roomId || undefined} />
        </div>
      </div>
    </div>
  );
};

export default Game;
