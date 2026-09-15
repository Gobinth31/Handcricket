import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DoorTransitionProps {
  onComplete: () => void;
}

const DoorScene: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const doorGroupRef = useRef<THREE.Group>(null);
  const worldGroupRef = useRef<THREE.Group>(null);
  const [started] = useState(Date.now());

  useFrame(() => {
    const elapsed = (Date.now() - started) / 1000;
    
    if (doorGroupRef.current) {
      // Swing door open over 1.5 seconds
      const rotationY = THREE.MathUtils.clamp((elapsed / 1.5) * (-Math.PI / 1.5), -Math.PI / 1.5, 0);
      doorGroupRef.current.rotation.y = rotationY;
    }

    if (worldGroupRef.current) {
      // Move world towards camera after door opens slightly
      if (elapsed > 0.5) {
        const moveZ = THREE.MathUtils.clamp(((elapsed - 0.5) / 1.5) * 12, 0, 12);
        worldGroupRef.current.position.z = moveZ;
      }
    }

    if (elapsed > 2.2) {
      onComplete();
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={1} />
      
      {/* World Group - moving towards camera */}
      <group ref={worldGroupRef} position={[0, -2, 0]}>
        {/* Door Frame */}
        <mesh position={[-2.2, 0, 0]}>
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[2.2, 0, 0]}>
          <boxGeometry args={[0.4, 8, 0.4]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>
        <mesh position={[0, 4.2, 0]}>
          <boxGeometry args={[4.8, 0.4, 0.4]} />
          <meshStandardMaterial color="#5C4033" />
        </mesh>

        {/* Door Hinge Group */}
        <group ref={doorGroupRef} position={[-2, 0, 0]}>
          <mesh position={[2, 0, 0]}>
            <boxGeometry args={[4, 8, 0.2]} />
            <meshStandardMaterial color="#8B6914" roughness={0.8} />
          </mesh>
          {/* Doorknob */}
          <mesh position={[3.6, 0, 0.2]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
        
        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -4, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </>
  );
};

export const DoorTransition: React.FC<DoorTransitionProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <DoorScene onComplete={onComplete} />
      </Canvas>
    </div>
  );
};
