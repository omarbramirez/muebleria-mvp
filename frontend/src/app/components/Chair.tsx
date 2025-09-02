"use client";
import React, { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Memoized GLTF Model
const ChairModel: React.FC = memo(() => {
  const { scene } = useGLTF("/models/gltf/SheenChair.glb");
  return <primitive object={scene} />;
});

const Chair: React.FC = () => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Canvas
        camera={{ position: [-0.75, 0.7, 1.25], fov: 45, near: 0.1, far: 20 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          powerPreference: "high-performance", // solicita GPU potente
        }}
        frameloop="demand" // renderiza solo cuando haya cambios
        style={{ height: "100%", width: "100%" }}
      >
        <color attach="background" args={[0xbbbbbb]} />
        <Suspense fallback={null}>
          <Environment preset="apartment" background={false} />
          <ChairModel />
        </Suspense>
        <OrbitControls
          enableDamping
          minDistance={1.5}
          maxDistance={1.5}
          enableZoom={false}
          target={[0, 0.35, 0]}
        />
      </Canvas>
    </div>
  );
};

export default Chair;

// Preload the GLTF model for better performance
useGLTF.preload("/models/gltf/SheenChair.glb");
