"use client";
import React, {
  memo,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ThreeEvent } from '@react-three/fiber';

interface KitchenModelProps {
  selectedTexture?: "cardboard" | "wood";
  selectedColor?: "red" | "blue";
  hiddenPart?: string; // ← nombre del mesh que quieres ocultar (ej. "Divanus")
}

const TEXTURE_PATHS = {
  cardboard: "/models/kitchen/textures/pale-textile.jpg",
  wood: "/models/kitchen/textures/brown-wood.jpg",
};

const COLORS: Record<"red" | "blue", THREE.Color> = {
  red: new THREE.Color(0xff4444),
  blue: new THREE.Color(0x3366ff),
};

export const KitchenModel: React.FC<KitchenModelProps> = memo(
  ({ selectedTexture, selectedColor, hiddenPart }) => {
    const groupRef = useRef<THREE.Group>(null!);
    const { scene, nodes } = useGLTF("/models/kitchen/scene.gltf");

    const [parts, setParts] = useState<Record<string, THREE.Mesh>>({});

    // Guardar props originales
    const originalProps = useMemo(() => {
      const map = new Map<
        string,
        { color: THREE.Color; map: THREE.Texture | null; visible: boolean }
      >();
      scene.traverse((child) => {
        // console.log(child.name)
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;
          map.set(mesh.uuid, {
            map: material.map,
            color: material.color.clone(),
            visible: mesh.visible,
          });
        }
      });
      return map;
    }, [scene]);



    // Cargar texturas
    const loadedTextures = useMemo(() => {
      const loader = new THREE.TextureLoader();
      return {
        cardboard: loader.load(TEXTURE_PATHS.cardboard),
        wood: loader.load(TEXTURE_PATHS.wood),
      };
    }, []);

    // Configurar modelo
    useEffect(() => {
      const group = groupRef.current;
      if (!group || !scene) return;

      group.add(scene);

      // Clonar materiales
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = (mesh.material as THREE.Material).clone();
        }
      });

      // Mapeo de partes por nombre
      const map: Record<string, THREE.Mesh> = {};
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          map[child.name] = child as THREE.Mesh;
        }
      });
      setParts(map);

      // Centrar modelo
      const box = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      box.getCenter(center);
      scene.position.sub(center);

      return () => {
        group.remove(scene);
      };
      
    }, [scene]);

    // Aplicar textura global
    useEffect(() => {
      const group = groupRef.current;
      if (!group) return;
      group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material as THREE.MeshStandardMaterial;

          if (selectedTexture && loadedTextures[selectedTexture]) {
            material.map = loadedTextures[selectedTexture];
          } else {
            material.map = originalProps.get(mesh.uuid)?.map || null;
          }

          material.needsUpdate = true;
        }
      });
    }, [selectedTexture, loadedTextures, originalProps]);

    // Cambiar color del Cabinet_01
    // useEffect(() => {
    //   const colouredPart = parts["Polka_standardSurface1_0"];
    //   if (!colouredPart) return;

    //   const material = colouredPart.material as THREE.MeshStandardMaterial;
    //   colouredPart.material = material.clone();

    //   const color =
    //     selectedColor && COLORS[selectedColor]
    //       ? COLORS[selectedColor]
    //       : originalProps.get(colouredPart.uuid)?.color;

    //   if (color) {
    //     (colouredPart.material as THREE.MeshStandardMaterial).color.copy(color);
    //     colouredPart.material.needsUpdate = true;
    //   }
    // }, [selectedColor, parts, originalProps]);

    // 🔥 Ocultar un objeto específico (por name)
    useEffect(() => {

      // Restaurar visibilidad original de todos antes
      Object.values(parts).forEach((mesh) => {
        const original = originalProps.get(mesh.uuid);
        if (original) mesh.visible = original.visible;
      });
      if (hiddenPart && parts[hiddenPart]) {
        parts[hiddenPart].visible = false; 
      }
      
    }, [hiddenPart, parts, originalProps]);


     const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation(); // evita burbujeo del evento
    const clickedObject = event.object;
    console.log("Nombre del elemento clicado:", clickedObject.name);

     const divanus = scene.getObjectByName("Divanus");
    if (divanus) {
      divanus.children.forEach((child) => {
        console.log("→", child.name);
            if (parts[`${child.name}_standardSurface1_0`].visible) {
        console.log(parts[`${child.name}_standardSurface1_0`].visible)
        parts[`${child.name}_standardSurface1_0`].visible = false; 
      }
      });
    }
  };



//   useEffect(() => {
//     const divanus = scene.getObjectByName("Divanus");
//  console.log("Objeto Divanus:", divanus);
//     if (divanus) {
//       divanus.children.forEach((child) => {
//         console.log("→", child.name);

//         Object.values(parts).forEach((mesh) => {
//         const original = originalProps.get(mesh.uuid);
//         if (original) mesh.visible = original.visible;
//       });
//       if (parts[`${child.name}_standardSurface1_0`]) {
//         console.log(parts[`${child.name}_standardSurface1_0`].visible)
//         parts[child.name].visible = false; 
//       }


//       });
//     }
    
//   }, [scene]);

    return <group ref={groupRef} onClick={handleClick}/>;
  }
);
    KitchenModel.displayName = "KitchenModel";
useGLTF.preload("/models/kitchen/scene.gltf");
