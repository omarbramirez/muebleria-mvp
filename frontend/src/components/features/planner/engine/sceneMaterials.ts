/**
 * @module sceneMaterials
 * @description
 * Fábrica de materiales PBR (Physically-Based Rendering) para el motor 3D del planner.
 * 
 * Principio de diseño:
 *  - Este módulo es PURO: no importa React, no tiene efectos secundarios.
 *  - Los materiales se crean una sola vez mediante `useMemo` en el orquestador.
 *  - La mutación de propiedades (ej. añadir textura a `cabinetDoor`) se hace
 *    desde fuera, dado que useMemo devuelve referencias mutables.
 */

import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS PÚBLICOS
// ─────────────────────────────────────────────────────────────────────────────

/** Mapa completo de todos los materiales compartidos de la escena. */
export interface SceneMaterials {
  // Arquitectura
  readonly wall: THREE.MeshStandardMaterial;
  readonly wallSelected: THREE.MeshStandardMaterial;
  readonly floor: THREE.MeshStandardMaterial;
  // Vanos
  readonly window: THREE.MeshBasicMaterial;
  readonly door: THREE.MeshBasicMaterial;
  // Instalaciones
  readonly elec: THREE.MeshStandardMaterial;
  readonly water: THREE.MeshStandardMaterial;
  readonly gas: THREE.MeshStandardMaterial;
  // Mobiliario PBR
  readonly cabinetCarcass: THREE.MeshStandardMaterial;
  readonly cabinetDoor: THREE.MeshStandardMaterial;
  readonly cabinetKickplate: THREE.MeshStandardMaterial;
  readonly cabinetCountertop: THREE.MeshStandardMaterial;
  readonly cabinetHandle: THREE.MeshStandardMaterial;
}

// ─────────────────────────────────────────────────────────────────────────────
// FÁBRICA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea y devuelve el mapa completo de materiales PBR.
 * 
 * **Uso**: Llamar dentro de `useMemo(() => createSceneMaterials(), [])` en el
 * componente orquestador para garantizar una sola instancia por montaje.
 * 
 * @returns {SceneMaterials} Objeto inmutable de referencias a materiales Three.js.
 */
export function createSceneMaterials(): SceneMaterials {
  // ── Materiales de Muebles (referenciados por la fábrica de UV-mapping) ──
  const cabinetDoor = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.0,
    // La textura se inyecta de forma asíncrona desde useTextureLoader.
  });

  const cabinetCarcass = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.9,
    metalness: 0.0,
  });

  const cabinetHandle = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    roughness: 0.3,
    metalness: 1.0,
  });

  return {
    // ── Arquitectura ────────────────────────────────────────────────────────
    wall: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
    }),
    wallSelected: new THREE.MeshStandardMaterial({
      color: 0xd5a6bd,
      transparent: true,
      opacity: 0.45,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: 0xf3f4f6,
      roughness: 0.8,
    }),

    // ── Vanos ───────────────────────────────────────────────────────────────
    window: new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    }),
    door: new THREE.MeshBasicMaterial({
      color: 0xf87171,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    }),

    // ── Instalaciones ───────────────────────────────────────────────────────
    elec: new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: new THREE.Color(0xccaa00),
      emissiveIntensity: 0.2,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
    }),
    gas: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.5,
      metalness: 0.3,
    }),

    // ── Mobiliario PBR ──────────────────────────────────────────────────────
    cabinetCarcass,
    cabinetDoor,
    cabinetKickplate: new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.9,
    }),
    cabinetCountertop: new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.2,
      metalness: 0.1,
    }),
    cabinetHandle,
  };
}
