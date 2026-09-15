import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Hand3D } from './Hand3D';

export type HandValue = 1 | 2 | 3 | 4 | 5 | 6;

interface DeskRevealProps {
  playerMove: HandValue | null;
  opponentMove: HandValue | null;
  isRevealed: boolean;
}

export const DeskReveal: React.FC<DeskRevealProps> = ({ playerMove, opponentMove, isRevealed }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [impactTime, setImpactTime] = useState<number>(0);

  useEffect(() => {
    if (isRevealed) {
      setImpactTime(Date.now());
    }
  }, [isRevealed]);

  useFrame(() => {
    if (groupRef.current && isRevealed) {
      const elapsed = Date.now() - impactTime;
      if (elapsed < 300) {
        // Quick bounce effect on reveal
        const bounceY = Math.sin((elapsed / 300) * Math.PI) * 0.15;
        groupRef.current.position.y = 2.2 + bounceY;
      } else {
        groupRef.current.position.y = 2.2;
      }
    }
  });

  const safePlayerMove = playerMove || 6;
  const safeOpponentMove = opponentMove || 6;

  return (
    <group ref={groupRef} position={[0, 2.2, 0]}>
      {/* Player Hand (Left) */}
      <group position={[-1.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Hand3D value={safePlayerMove} side="left" revealed={isRevealed} />
      </group>

      {/* Opponent Hand (Right) */}
      <group position={[1.5, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]}>
        <Hand3D value={safeOpponentMove} side="right" revealed={isRevealed} />
      </group>
    </group>
  );
};
