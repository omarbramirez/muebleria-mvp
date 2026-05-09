'use client';

/**
 * @hook useSceneObjects
 * @description
 * Responsabilidad única: reconstruir la escena 3D cada vez que los datos
 * del store cambian.
 *
 * Gestiona la construcción de:
 *  A. Muros (BoxGeometry, selección visual por activeWallIndex)
 *  B. Vanos (ventanas / puertas)
 *  C. Instalaciones eléctricas y de plomería
 *  D. Punto de gas
 *  E. Mobiliario (CabinetFactory con UV-mapping automático)
 *  F. Electrodomésticos (ApplianceFactory con pivot en base)
 *
 * Patrón de reconstrucción:
 *  - En cada render, se vacía `roomGroup` completamente y se regeneran todos
 *    los objetos. Esto es correcto para el MVP ya que los datos del store no
 *    son lo suficientemente grandes como para requerir diff incremental.
 *  - `wallsRef` se repopula en cada reconstrucción para que `useInteraction`
 *    siempre tenga referencias válidas.
 */

import { useEffect } from 'react';
import * as THREE from 'three';
import { createProceduralCabinet } from '@/utils/CabinetFactory';
import { createProceduralAppliance } from '@/utils/ApplianceFactory';
import { WALL_THICKNESS, ENGINEERING_CONSTANTS } from '../config/constants';
import { SceneMaterials } from './sceneMaterials';
import {
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  CabinetModule,
} from '@/store/preferenceWizardStore';
import { PlannerViewMode } from '@/types/planner/planner';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

interface UseSceneObjectsParams {
  // Geometría
  points: { x: number; y: number }[];
  height: number;                        // mm
  // Objetos de escena
  openings: WallOpening[];
  appliances: ApplianceModel[];
  installations: InstallationPoint[];
  gasConfig: GasConfig | undefined;
  layoutItems: CabinetModule[];
  // Estado visual
  activeWallIndex: number | null;
  viewMode: PlannerViewMode | undefined;
  // Refs del motor (resueltos por el orquestador)
  materials: SceneMaterials;
  roomGroupRef: React.RefObject<THREE.Group>;
  wallsRef: React.MutableRefObject<THREE.Mesh[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aplica el material correcto a cada muro dependiendo del estado de selección
 * y del modo de visualización. Se ejecuta tras construir los muros.
 */
function applyWallMaterials(
  walls: THREE.Mesh[],
  activeWallIndex: number | null,
  viewMode: PlannerViewMode | undefined,
  materials: SceneMaterials,
): void {
  walls.forEach((wall, index) => {
    const mat = wall.material as THREE.MeshStandardMaterial;
    const isActive = index === activeWallIndex;

    // Base: copiar el material completo según estado de selección
    if (isActive) {
      mat.copy(materials.wallSelected);
    } else {
      mat.copy(materials.wall);
    }

    // Sobreescritura por modo de visualización
    if (viewMode === 'BLUEPRINT') {
      mat.opacity    = 1.0;
      mat.transparent = false;
      mat.depthWrite  = true;
      mat.side        = THREE.DoubleSide;
      if (!isActive) {
        mat.color.setHex(0xe5e7eb);
        mat.roughness = 1.0;
      }
    } else {
      mat.transparent = true;
      mat.depthWrite  = false;
    }

    mat.needsUpdate = true;
  });
}

/**
 * Aplica UV mapping proporcional a las puertas de gabinete para que la textura
 * de madera no se estire independientemente del tamaño del mueble.
 */
function applyDoorUVMapping(mesh: THREE.Mesh, materials: SceneMaterials): void {
  if (
    mesh.material !== materials.cabinetDoor ||
    !(mesh.geometry instanceof THREE.BoxGeometry)
  ) return;

  const { width, height } = mesh.geometry.parameters;
  const uvAttribute        = mesh.geometry.attributes.uv as THREE.BufferAttribute;
  const textureScale       = 0.05;

  for (let i = 0; i < uvAttribute.count; i++) {
    uvAttribute.setXY(
      i,
      uvAttribute.getX(i) * width  * textureScale,
      uvAttribute.getY(i) * height * textureScale,
    );
  }
  uvAttribute.needsUpdate = true;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useSceneObjects({
  points,
  height,
  openings,
  appliances,
  installations,
  gasConfig,
  layoutItems,
  activeWallIndex,
  viewMode,
  materials,
  roomGroupRef,
  wallsRef,
}: UseSceneObjectsParams): void {

  useEffect(() => {
    const roomGroup = roomGroupRef.current;
    if (!roomGroup) return;

    // ── Limpieza total de la escena anterior ─────────────────────────────────
    while (roomGroup.children.length > 0) {
      roomGroup.remove(roomGroup.children[0]);
    }
    wallsRef.current = [];

    const heightUnits = height / 10; // mm → unidades 3D

    // ── Centrado del grupo ───────────────────────────────────────────────────
    if (points.length > 0) {
      let minX = Infinity, maxX = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minZ) minZ = p.y;
        if (p.y > maxZ) maxZ = p.y;
      }
      roomGroup.position.set(-(minX + maxX) / 2, 0, -(minZ + maxZ) / 2);
    }

    // ── A. MUROS ─────────────────────────────────────────────────────────────
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      const dx   = next.x - p.x;
      const dy   = next.y - p.y;
      const len  = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(len, heightUnits, WALL_THICKNESS),
        materials.wall.clone(), // clone para poder mutar independientemente
      );

      wall.position.set(p.x + dx / 2, heightUnits / 2, p.y + dy / 2);
      wall.rotation.y = -angle;
      wall.userData = { isDynamic: true, isWall: true, index: i, length: len };

      roomGroup.add(wall);
      wallsRef.current.push(wall);
    });

    // Aplicar materiales con lógica de selección y viewMode
    applyWallMaterials(wallsRef.current, activeWallIndex, viewMode, materials);

    // ── B. VANOS ─────────────────────────────────────────────────────────────
    for (const op of openings) {
      const wall = wallsRef.current[op.wallIndex];
      if (!wall) continue;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          op.width  / ENGINEERING_CONSTANTS.SCALE_FACTOR,
          op.height / ENGINEERING_CONSTANTS.SCALE_FACTOR,
          ENGINEERING_CONSTANTS.OPENING_DEPTH,
        ),
        op.type === 'window' ? materials.window : materials.door,
      );

      const localX =
        -wall.userData.length / 2 +
        op.distFromStart / ENGINEERING_CONSTANTS.SCALE_FACTOR +
        op.width / ENGINEERING_CONSTANTS.SCALE_FACTOR / 2;

      const localY =
        -heightUnits / 2 +
        op.sillHeight / ENGINEERING_CONSTANTS.SCALE_FACTOR +
        op.height     / ENGINEERING_CONSTANTS.SCALE_FACTOR / 2;

      mesh.position.set(localX, localY, 0);
      mesh.userData = { isDynamic: true, isOpening: true, id: op.id, wallIndex: op.wallIndex };
      wall.add(mesh);
    }

    // ── C. INSTALACIONES ─────────────────────────────────────────────────────
    for (const inst of installations) {
      const wall = wallsRef.current[inst.wallIndex];
      if (!wall) continue;

      const geo =
        inst.type === 'electrical'
          ? new THREE.BoxGeometry(6, 10, 2)
          : new THREE.CylinderGeometry(3, 3, 5, 16).rotateX(Math.PI / 2);

      const mat  = inst.type === 'electrical' ? materials.elec : materials.water;
      const mesh = new THREE.Mesh(geo, mat);

      const localX = -wall.userData.length / 2 + inst.distFromStart / ENGINEERING_CONSTANTS.SCALE_FACTOR;
      const localY = inst.heightFromFloor   / ENGINEERING_CONSTANTS.SCALE_FACTOR - heightUnits / 2;

      mesh.position.set(localX, localY, WALL_THICKNESS / 2 + 2);
      mesh.userData = { isDynamic: true, isInstallation: true, id: inst.id, wallIndex: inst.wallIndex };
      wall.add(mesh);
    }

    // ── D. GAS ───────────────────────────────────────────────────────────────
    if (gasConfig?.required && wallsRef.current[gasConfig.wallIndex]) {
      const wall = wallsRef.current[gasConfig.wallIndex];
      const geo  = new THREE.CylinderGeometry(1.5, 1.5, 5, 16).rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, materials.gas);

      const localX = -wall.userData.length / 2 + gasConfig.x / ENGINEERING_CONSTANTS.SCALE_FACTOR;
      const localY = gasConfig.z / ENGINEERING_CONSTANTS.SCALE_FACTOR - heightUnits / 2;

      mesh.position.set(localX, localY, WALL_THICKNESS / 2 + 2.5);
      mesh.userData = { isDynamic: true, isGas: true, wallIndex: gasConfig.wallIndex };
      wall.add(mesh);
    }

    // ── E. MOBILIARIO (PBR + UV Mapping) ─────────────────────────────────────
    for (const item of layoutItems) {
      const wall = wallsRef.current[item.wallIndex];
      if (!wall) continue;

      const cabinetGroup = createProceduralCabinet(
        item,
        {
          carcass:    materials.cabinetCarcass,
          door:       materials.cabinetDoor,
          kickplate:  materials.cabinetKickplate,
          countertop: materials.cabinetCountertop,
          handle:     materials.cabinetHandle,
        },
        ENGINEERING_CONSTANTS.SCALE_FACTOR,
      );

      // Habilitar sombras y corregir UVs en cada mesh hijo
      cabinetGroup.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.castShadow    = true;
        child.receiveShadow = true;
        applyDoorUVMapping(child, materials);
      });

      // Posicionamiento local dentro del muro
      const wallLen      = wall.userData.length;
      const itemWidth3D  = item.width  / ENGINEERING_CONSTANTS.SCALE_FACTOR;
      const itemHeight3D = item.height / ENGINEERING_CONSTANTS.SCALE_FACTOR;
      const itemDepth3D  = item.depth  / ENGINEERING_CONSTANTS.SCALE_FACTOR;

      const localX = -wallLen / 2 + item.distFromStart / ENGINEERING_CONSTANTS.SCALE_FACTOR + itemWidth3D / 2;
      const localY = -heightUnits / 2 + item.elevation / ENGINEERING_CONSTANTS.SCALE_FACTOR + itemHeight3D / 2;
      const zOffset = WALL_THICKNESS / 2 + itemDepth3D / 2;

      cabinetGroup.position.set(localX, localY, zOffset);
      if (item.rotation) cabinetGroup.rotation.y = item.rotation;

      wall.add(cabinetGroup);
    }

    // ── F. ELECTRODOMÉSTICOS ─────────────────────────────────────────────────
    for (const app of appliances) {
      const applianceGroup = createProceduralAppliance(app, ENGINEERING_CONSTANTS.SCALE_FACTOR);
      // Y=0 porque la factory ya normaliza el pivote a la base del objeto
      applianceGroup.position.set(app.position.x, 0, app.position.z);
      applianceGroup.rotation.y = app.rotation;
      roomGroup.add(applianceGroup);
    }

  }, [
    points,
    height,
    openings,
    appliances,
    installations,
    gasConfig,
    layoutItems,
    activeWallIndex,
    viewMode,
    materials,
    roomGroupRef,
    wallsRef,
  ]);
}
