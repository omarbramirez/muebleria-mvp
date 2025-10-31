"use client";
import React, { Suspense, memo, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import {KitchenModel} from '@/app/hooks/useGLTF'

interface KitchenModelProps {
  selectedTexture?: "cardboard" | "wood";
  selectedColor?: "red" | "blue";
}

interface Textures {
  cardboard: string;
  wood: string;
}

const textures:Textures  = {
  cardboard: "/models/kitchen/textures/pale-textile.jpg",
  wood: "/models/kitchen/textures/brown-wood.jpg",
};

interface Colors {
  red: THREE.Color;
  blue: THREE.Color;
}
const colors = {
  red: new THREE.Color(0xff4444),
  blue: new THREE.Color(0x3366ff),
};


const KitchenScene: React.FC<{ texture: string; color: string }> = ({ texture, color }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [1, 1, 1], fov: 45, near: 0.1, far: 100 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["skyblue"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={1.5} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        <Suspense fallback={null}>
          <Environment preset="apartment" background={false} />
          <KitchenModel   selectedTexture={texture as "cardboard" | "wood"}
  selectedColor={color as "red" | "blue"} />
        </Suspense>

        <OrbitControls enableDamping target={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};

export default KitchenScene;
