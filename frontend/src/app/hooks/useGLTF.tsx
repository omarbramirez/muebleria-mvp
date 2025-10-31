"use client";
import React, {
  Suspense,
  memo,
  useMemo,
  useRef,
  useEffect
} from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface KitchenModelProps {
  selectedTexture?: "cardboard" | "wood";
  selectedColor?: "red" | "blue";
}

const TEXTURE_PATHS = {
  cardboard: "/models/kitchen/textures/pale-textile.jpg",
  wood: "/models/kitchen/textures/brown-wood.jpg",
};

const COLORS = {
  red: new THREE.Color(0xff4444),
  blue: new THREE.Color(0x3366ff),
};

const KitchenModelComponent: React.FC<KitchenModelProps> = ({
  selectedTexture,
  selectedColor,
}) => {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/models/kitchen/scene.gltf");

  // 🔹 Guardar texturas originales de cada mesh
  const originalProps = useMemo(() => {
    const map = new Map<
      string,
      { color: THREE.Color; map: THREE.Texture | null }
    >();
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        map.set(child.uuid, {
          map: child.material.map,
          color: child.material.color.clone(),
        });
      }
    });
    return map;
  }, [scene]);

  // 🔹 Cargar texturas personalizadas
  const loadedTextures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return {
      cardboard: loader.load(TEXTURE_PATHS.cardboard),
      wood: loader.load(TEXTURE_PATHS.wood),
    };
  }, []);

  // 🔹 Actualizar materiales dinámicamente
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Aplicar textura seleccionada
        if (selectedTexture && loadedTextures[selectedTexture]) {
          child.material.map = loadedTextures[selectedTexture];
        } else {
          child.material.map = originalProps.get(child.uuid)?.map || null;
        }

        // Aplicar color seleccionado
        if (selectedColor && COLORS[selectedColor]) {
          child.material.color = COLORS[selectedColor].clone();
        } else {
          const original = originalProps.get(child.uuid);
          if (original) child.material.color.copy(original.color);
        }

        child.material.needsUpdate = true;
      }
    });
  });

  // 🔹 Añadir el modelo al grupo principal
  useEffect(() => {
    const group = groupRef.current;
    if (!group || !scene) return;

    group.add(scene);

    // Limpieza opcional si el componente se desmonta o recarga
    return () => {
      group.remove(scene);
    };
  }, [scene]);

  return <group ref={groupRef} />;
};

export const KitchenModel = memo(KitchenModelComponent);
useGLTF.preload("/models/kitchen/scene.gltf");
