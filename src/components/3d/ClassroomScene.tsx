import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';

interface ClassroomSceneProps {
  score?: string;
  thoughtOfDay?: string;
  children?: React.ReactNode;
}

export const ClassroomScene: React.FC<ClassroomSceneProps> = ({ 
  score = "0 - 0", 
  thoughtOfDay = "Work hard, play hard!", 
  children 
}) => {
  return (
    <div className="w-full h-full relative">
      <Canvas shadows camera={{ position: [0, 8, 10], fov: 45 }}>
        <color attach="background" args={['#e0e0e0']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize-width={1024} 
          shadow-mapSize-height={1024} 
        />
        <spotLight position={[-5, 10, 0]} intensity={0.5} angle={0.5} penumbra={1} castShadow />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#c0c0c0" />
        </mesh>

        {/* Wall */}
        <mesh position={[0, 5, -15]} receiveShadow>
          <planeGeometry args={[50, 20]} />
          <meshStandardMaterial color="#dcdcdc" />
        </mesh>

        {/* Chalkboard */}
        <group position={[0, 4, -14.9]}>
          <mesh receiveShadow castShadow>
            <boxGeometry args={[12, 6, 0.2]} />
            <meshStandardMaterial color="#2d5016" roughness={0.9} />
          </mesh>
          
          {/* Chalkboard frame */}
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[12.4, 6.4, 0.1]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>

          {/* Text */}
          <Text
            position={[-5, 2, 0.15]}
            fontSize={0.8}
            color="white"
            anchorX="left"
            anchorY="top"
            font="https://fonts.gstatic.com/s/indieflower/v17/m8JVjfNVeKWVnh3QMuKkFcZVaUuH99GUDg.woff"
          >
            {score}
          </Text>
          
          <Text
            position={[0, -1, 0.15]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/indieflower/v17/m8JVjfNVeKWVnh3QMuKkFcZVaUuH99GUDg.woff"
          >
            {thoughtOfDay}
          </Text>
        </group>

        {/* Main Desk */}
        <group position={[0, 0, 0]}>
          <RoundedBox args={[8, 0.4, 4]} radius={0.1} smoothness={4} position={[0, 2, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#8B6914" roughness={0.7} />
          </RoundedBox>
          {/* Desk legs */}
          <mesh position={[-3.5, 0, -1.5]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[3.5, 0, -1.5]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[-3.5, 0, 1.5]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
          <mesh position={[3.5, 0, 1.5]} castShadow>
            <boxGeometry args={[0.3, 4, 0.3]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
        </group>

        {/* Student Benches (Side) */}
        <group position={[-7, -0.5, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.2, 4]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.6, 1.5, 3.6]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
        </group>
        
        <group position={[7, -0.5, 0]}>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[2, 0.2, 4]} />
            <meshStandardMaterial color="#8B6914" />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <boxGeometry args={[1.6, 1.5, 3.6]} />
            <meshStandardMaterial color="#5C4033" />
          </mesh>
        </group>

        {/* Interactive/Reveal content */}
        {children}

        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default ClassroomScene;
