'use client';

/**
 * @component Room3DPreview
 * @description
 * Orquestador del motor 3D del Planner. Es un componente de composición pura:
 * no contiene lógica propia, solo ensambla los hooks especializados del
 * directorio `./engine/` y les pasa los datos necesarios.
 *
 * Árbol de responsabilidades:
 *  ├── useSceneSetup       → WebGLRenderer, CSS2DRenderer, luces, grupos
 *  ├── useCameraControls   → Cámara activa, OrbitControls, loop RAF
 *  ├── useTextureLoader    → Carga asíncrona de texturas (inyección en material)
 *  ├── useSceneObjects     → Construcción reactiva de muros/instalaciones/muebles
 *  └── useInteraction      → Raycasting, drag, selección de muro
 */

import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { usePreferenceWizardStore } from '@/store/preferenceWizardStore';
import { Room3DPreviewProps } from '@/types/planner/planner';
import { createSceneMaterials } from './engine/sceneMaterials';
import { useSceneSetup } from './engine/useSceneSetup';
import { useCameraControls } from './engine/useCameraControls';
import { useSceneObjects } from './engine/useSceneObjects';
import { useInteraction } from './engine/useInteraction';
import { ASSET_PATHS } from './config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// HOOK AUXILIAR: carga de textura asíncrona
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga una textura de madera y la inyecta en el material de puerta de gabinete.
 * Solo se ejecuta en el cliente (guarda contra SSR con `typeof window`).
 * Usa una ref interna para evitar que la carga se repita si el material cambia.
 */
function useTextureLoader(cabinetDoorMaterial: THREE.MeshStandardMaterial): void {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loadedRef.current) return;
    loadedRef.current = true;

    const loader = new THREE.TextureLoader();
    loader.load(
      ASSET_PATHS.TEXTURES.WOOD_OAK,
      (texture) => {
        texture.colorSpace   = THREE.SRGBColorSpace;
        texture.wrapS        = THREE.RepeatWrapping;
        texture.wrapT        = THREE.RepeatWrapping;
        texture.minFilter    = THREE.LinearMipmapLinearFilter;
        texture.magFilter    = THREE.LinearFilter;
        cabinetDoorMaterial.map         = texture;
        cabinetDoorMaterial.needsUpdate = true;
      },
      undefined,
      (err) => console.warn(`[Room3DPreview] Textura no encontrada: ${ASSET_PATHS.TEXTURES.WOOD_OAK}`, err),
    );
  }, [cabinetDoorMaterial]);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

const Room3DPreview: React.FC<Room3DPreviewProps> = ({
  points,
  height,
  openings        = [],
  appliances      = [],
  installations   = [],
  gasConfig,
  layoutItems     = [],
  viewMode        = 'PERSPECTIVE',
  onInstallationUpdate,
  onApplianceUpdate,
  onOpeningUpdate,
  onGasUpdate,
  onLayoutUpdate,
}) => {
  // ── Contenedor del canvas ─────────────────────────────────────────────────
  const mountRef = useRef<HTMLDivElement>(null);

  // ── Store ─────────────────────────────────────────────────────────────────
  const { activeWallIndex } = usePreferenceWizardStore();

  // ── Materiales PBR (una sola instancia por montaje del componente) ─────────
  const materials = useMemo(() => createSceneMaterials(), []);

  // ── Carga de textura de madera (asíncrona, sin bloquear el render) ────────
  useTextureLoader(materials.cabinetDoor);

  // ── Motor gráfico ─────────────────────────────────────────────────────────
  const {
    sceneRef,
    rendererRef,
    labelRendererRef,
    roomGroupRef,
    wallsRef,
    measurementsGroupRef,
  } = useSceneSetup(mountRef);

  // ── Cámara + controles + loop de animación ────────────────────────────────
  const { cameraRef, controlsRef } = useCameraControls(
    viewMode,
    rendererRef,
    sceneRef,
    labelRendererRef,
    mountRef,
  );

  // ── Construcción reactiva de objetos de escena ────────────────────────────
  useSceneObjects({
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
  });

  // ── Interacción: raycasting, drag, selección de muro ─────────────────────
  useInteraction({
    height,
    openings,
    appliances,
    installations,
    gasConfig,
    layoutItems,
    onInstallationUpdate,
    onApplianceUpdate,
    onOpeningUpdate,
    onGasUpdate,
    onLayoutUpdate,
    rendererRef,
    cameraRef,
    controlsRef,
    wallsRef,
    roomGroupRef,
    measurementsGroupRef,
  });

  return (
    <div
      ref={mountRef}
      className="relative w-full h-full cursor-move"
      // El div es el mount point del canvas WebGL y de la capa CSS2D
    />
  );
};

export default Room3DPreview;