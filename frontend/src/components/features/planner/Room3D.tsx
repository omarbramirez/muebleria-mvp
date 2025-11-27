"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";

export default function Room3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const json = {
      sceneUnits: "meters",
      objects: [
        {
          id: "island",
          type: "furniture",
          color: "blue",
          dimensions: { width: 1.20, depth: 0.90, height: 0.90 },
          position: { x: 0.20, y: 0.00, z: 0.00 }
        },
        {
          id: "cooktop",
          type: "appliance",
          color: "yellow",
          dimensions: { width: 0.60, depth: 0.60, height: 0.10 },
          position: { x: 0.30, y: 0.00, z: 0.90 }
        },
        {
          id: "lower_cabinets_main",
          type: "furniture",
          color: "blue",
          dimensions: { width: 1.80, depth: 0.60, height: 0.90 },
          position: { x: 1.40, y: 0.00, z: 0.00 }
        },
        {
          id: "sink",
          type: "appliance",
          color: "yellow",
          dimensions: { width: 0.55, depth: 0.45, height: 0.20 },
          position: { x: 2.15, y: 0.00, z: 0.90 }
        },
        {
          id: "upper_cabinets_left",
          type: "furniture",
          color: "blue",
          dimensions: { width: 0.90, depth: 0.35, height: 0.90 },
          position: { x: 1.40, y: 0.00, z: 1.60 }
        },
        {
          id: "upper_cabinets_right",
          type: "furniture",
          color: "blue",
          dimensions: { width: 1.10, depth: 0.35, height: 0.90 },
          position: { x: 2.30, y: 0.00, z: 1.60 }
        },
        {
          id: "open_shelf_left",
          type: "furniture",
          color: "blue",
          dimensions: { width: 0.90, depth: 0.25, height: 0.30 },
          position: { x: 1.00, y: 0.00, z: 1.70 }
        },
        {
          id: "oven_column",
          type: "appliance",
          color: "yellow",
          dimensions: { width: 0.60, depth: 0.60, height: 2.40 },
          position: { x: 3.40, y: 0.00, z: 0.00 }
        }
      ]
    };

    const mount = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#eeeeee");

    const camera = new THREE.PerspectiveCamera(
      60,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(4, 3, 6);
    camera.lookAt(1.5, 0.9, 1.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(3, 6, 5);
    scene.add(directional);

    const colorMap: Record<string, number> = {
      blue: 0x3b82f6,
      yellow: 0xfacc15
    };

    json.objects.forEach((obj) => {
      const { width, depth, height } = obj.dimensions;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: colorMap[obj.color],
        opacity: 0.85,
        transparent: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = obj.id;

      const { x, y, z } = obj.position;

      mesh.position.set(
        x + width / 2,
        z + height / 2,
        y + depth / 2
      );

      scene.add(mesh);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "80vh", border: "1px solid #ccc" }}
    />
  );
}
