"use client"
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const Chair: React.FC = () => {
  // Component to handle the GLTF model
  const ChairModel = () => {
    const { scene } = useGLTF('/models/gltf/SheenChair.glb');
    return <primitive object={scene} />;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Canvas
        camera={{ position: [-0.75, 0.7, 1.25], fov: 45, near: 0.1, far: 20 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
        style={{ height: '100%', width: '100%' }}
      >
        <color attach="background" args={[0xbbbbbb]} />
        <Environment preset="apartment" />
        <ChairModel />
        <OrbitControls
          enableDamping
          minDistance={1}
          maxDistance={10}
          target={[0, 0.35, 0]}
        />
      </Canvas>
    </div>
  );
};

export default Chair;

// Preload the GLTF model for better performance
useGLTF.preload('/models/gltf/SheenChair.glb');