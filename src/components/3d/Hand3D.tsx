import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export interface Hand3DProps {
  value: number; // 1-6
  side: 'left' | 'right';
  revealed: boolean;
}

export const Hand3D: React.FC<Hand3DProps> = ({ value, side, revealed }) => {
  const groupRef = useRef<THREE.Group>(null);
  const skinColor = "#e8beac";
  const isLeft = side === 'left';
  
  // Animation target values
  const targetRotation = revealed ? 0 : -Math.PI / 4;
  
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Simple spring-like lerp animation
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation,
        delta * 10
      );
    }
  });

  const displayValue = revealed ? value : 6; 
  
  // Fingers visibility logic based on value (1-5 open fingers, 6 is fist)
  const showThumb = displayValue >= 1 && displayValue !== 6;
  const showIndex = displayValue >= 2 && displayValue !== 6;
  const showMiddle = displayValue >= 3 && displayValue !== 6;
  const showRing = displayValue >= 4 && displayValue !== 6;
  const showPinky = displayValue >= 5 && displayValue !== 6;

  return (
    <group ref={groupRef} rotation={[targetRotation, 0, 0]}>
      {/* Palm */}
      <RoundedBox args={[1.8, 2, 0.5]} radius={0.2} position={[0, 1, 0]} castShadow>
        <meshStandardMaterial color={skinColor} />
      </RoundedBox>

      {/* Thumb */}
      <group position={[isLeft ? 1 : -1, 0.5, 0]}>
        <RoundedBox 
          args={[0.4, 1.2, 0.4]} 
          radius={0.1} 
          position={[0, 0.5, 0]}
          rotation={[0, 0, isLeft ? -0.5 : 0.5]}
          castShadow
          visible={showThumb}
        >
          <meshStandardMaterial color={skinColor} />
        </RoundedBox>
      </group>

      {/* Index */}
      <group position={[isLeft ? 0.6 : -0.6, 2, 0]}>
        <RoundedBox args={[0.35, 1.2, 0.35]} radius={0.1} position={[0, 0.6, 0]} castShadow visible={showIndex}>
          <meshStandardMaterial color={skinColor} />
        </RoundedBox>
      </group>

      {/* Middle */}
      <group position={[isLeft ? 0.2 : -0.2, 2, 0]}>
        <RoundedBox args={[0.35, 1.4, 0.35]} radius={0.1} position={[0, 0.7, 0]} castShadow visible={showMiddle}>
          <meshStandardMaterial color={skinColor} />
        </RoundedBox>
      </group>

      {/* Ring */}
      <group position={[isLeft ? -0.2 : 0.2, 2, 0]}>
        <RoundedBox args={[0.35, 1.3, 0.35]} radius={0.1} position={[0, 0.65, 0]} castShadow visible={showRing}>
          <meshStandardMaterial color={skinColor} />
        </RoundedBox>
      </group>

      {/* Pinky */}
      <group position={[isLeft ? -0.6 : 0.6, 2, 0]}>
        <RoundedBox args={[0.35, 1, 0.35]} radius={0.1} position={[0, 0.5, 0]} castShadow visible={showPinky}>
          <meshStandardMaterial color={skinColor} />
        </RoundedBox>
      </group>
    </group>
  );
};
