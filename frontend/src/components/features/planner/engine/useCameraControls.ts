'use client';

/**
 * @hook useCameraControls
 * @description
 * Responsabilidad única: gestionar la cámara activa, OrbitControls y el loop
 * requestAnimationFrame que sincroniza WebGL + CSS2D.
 *
 * Diseño:
 *  - Re-ejecuta cuando cambia `viewMode` (PERSPECTIVE ↔ BLUEPRINT).
 *  - Elimina controles anteriores antes de crear los nuevos para evitar leaks.
 *  - El loop RAF vive dentro del effect y se cancela en el cleanup, garantizando
 *    que solo haya un loop activo en todo momento.
 *  - `cameraRef` y `controlsRef` se exponen para que `useInteraction` pueda
 *    leer la cámara activa sin race conditions.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { PlannerViewMode } from '@/types/planner/planner';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

/** Tamaño del frustum ortográfico (unidades 3D) para el modo BLUEPRINT. */
const BLUEPRINT_FRUSTUM_SIZE = 1000;
/** FOV de la cámara perspectiva en grados. */
const PERSPECTIVE_FOV = 45;
/** Distancia near/far para ambas cámaras (unidades 3D). */
const CAMERA_NEAR = 1;
const CAMERA_FAR = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS PÚBLICOS
// ─────────────────────────────────────────────────────────────────────────────

export interface CameraControlsRefs {
  cameraRef: React.RefObject<THREE.Camera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param viewMode         - Modo de visualización activo.
 * @param rendererRef      - Ref al WebGLRenderer (necesario para OrbitControls).
 * @param sceneRef         - Ref a la Scene (necesario para renderizar).
 * @param labelRendererRef - Ref al CSS2DRenderer (se renderiza en sincronía).
 * @param mountRef         - Ref al div contenedor (para leer el aspect ratio).
 */
export function useCameraControls(
  viewMode: PlannerViewMode | undefined,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  sceneRef: React.RefObject<THREE.Scene>,
  labelRendererRef: React.RefObject<CSS2DRenderer | null>,
  mountRef: React.RefObject<HTMLDivElement | null>,
): CameraControlsRefs {

  const cameraRef   = useRef<THREE.Camera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const renderer     = rendererRef.current;
    const mountNode    = mountRef.current;
    if (!renderer || !mountNode) return;

    const { clientWidth: w, clientHeight: h } = mountNode;
    const aspect = w / h;

    // ── Limpiar controles previos para evitar memory leaks ───────────────────
    controlsRef.current?.dispose();

    // ── A. Selección de cámara según viewMode ────────────────────────────────
    let camera: THREE.Camera;

    if (viewMode === 'BLUEPRINT') {
      // Cámara ortográfica — vista cenital estricta (plano técnico 2D)
      const half = BLUEPRINT_FRUSTUM_SIZE / 2;
      camera = new THREE.OrthographicCamera(
        -half * aspect,
         half * aspect,
         half,
        -half,
        CAMERA_NEAR,
        CAMERA_FAR,
      );
      camera.position.set(0, 1000, 0);
      camera.up.set(0, 0, -1); // Norte del plano apunta hacia -Z
    } else {
      // Cámara perspectiva — vista 3D estándar
      camera = new THREE.PerspectiveCamera(PERSPECTIVE_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
      camera.position.set(0, 800, 800);
      camera.up.set(0, 1, 0);
    }

    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── B. OrbitControls ─────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.15;
    controls.target.set(0, 0, 0);

    if (viewMode === 'BLUEPRINT') {
      controls.enableRotate    = false;  // Bloquear rotación en vista plana
      controls.screenSpacePanning = true; // Panning en plano de pantalla
    } else {
      controls.enableRotate    = true;
      controls.screenSpacePanning = false;
      controls.maxPolarAngle   = Math.PI / 2; // Impedir cámara bajo el suelo
    }

    controls.update();
    controlsRef.current = controls;

    // ── C. Loop de animación ─────────────────────────────────────────────────
    // Nota: el loop se recrea por cada cambio de viewMode para capturar la
    // nueva cámara en el closure. Esto es correcto: el cancelAnimationFrame del
    // cleanup anterior detiene el loop previo antes de iniciar el nuevo.
    let rafId: number;

    const animate = (): void => {
      rafId = requestAnimationFrame(animate);
      controls.update(); // Aplica damping suave

      const scene = sceneRef.current;
      const cam   = cameraRef.current;
      if (renderer && scene && cam) {
        renderer.render(scene, cam);
        labelRendererRef.current?.render(scene, cam);
      }
    };

    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
    };
  }, [viewMode, rendererRef, sceneRef, labelRendererRef, mountRef]);

  return { cameraRef, controlsRef };
}
