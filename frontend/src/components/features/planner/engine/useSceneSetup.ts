'use client';

/**
 * @hook useSceneSetup
 * @description
 * Responsabilidad única: inicializar y limpiar la infraestructura gráfica del motor 3D.
 *
 * Gestiona:
 *  - WebGLRenderer (canvas principal con sombras PCFSoft)
 *  - CSS2DRenderer (capa de etiquetas HTML sobre el canvas)
 *  - Luces PBR (HemisphereLight + DirectionalLight con shadow map 2K)
 *  - GridHelper decorativo
 *  - Scene, RoomGroup y MeasurementsGroup
 *
 * Contrato de salida: todos los refs quedan poblados al montarse el componente
 * y son limpiados de forma determinista en el cleanup del useEffect.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
// SceneMaterials import intentionally removed — materials are injected per-frame
// by useSceneObjects, not by the setup phase.

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS PÚBLICOS
// ─────────────────────────────────────────────────────────────────────────────

export interface SceneSetupRefs {
  sceneRef: React.RefObject<THREE.Scene>;
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  labelRendererRef: React.RefObject<CSS2DRenderer | null>;
  roomGroupRef: React.RefObject<THREE.Group>;
  wallsRef: React.MutableRefObject<THREE.Mesh[]>;
  measurementsGroupRef: React.RefObject<THREE.Group>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param mountRef  - Referencia al div contenedor del canvas.
 * @param materials - Materiales PBR compartidos (necesarios para el suelo).
 * @returns Refs estables a todos los objetos del motor gráfico.
 */
export function useSceneSetup(
  mountRef: React.RefObject<HTMLDivElement | null>,
): SceneSetupRefs {

  // ── Refs internos (estables entre renders) ───────────────────────────────
  const sceneRef            = useRef<THREE.Scene>(new THREE.Scene());
  const rendererRef         = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef    = useRef<CSS2DRenderer | null>(null);
  const roomGroupRef        = useRef<THREE.Group>(new THREE.Group());
  const wallsRef            = useRef<THREE.Mesh[]>([]);
  const measurementsGroupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const { clientWidth: w, clientHeight: h } = mountNode;

    // ── A. WebGL Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping para PBR correcto (sRGB → linear → display)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── B. CSS2D Renderer (capa de texto encima del canvas) ──────────────────
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.left = '0px';
    // CRÍTICO: pointerEvents='none' permite que los clicks pasen al canvas WebGL
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountNode.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    // ── C. Iluminación PBR ───────────────────────────────────────────────────
    // C.1 Luz ambiental hemisférica (cielo/suelo) — relleno suave y natural
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    sceneRef.current.add(hemiLight);

    // C.2 Luz direccional principal (simula sol cenital)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(500, 1500, 1000);
    dirLight.castShadow = true;
    // Shadow map 2K: balance calidad/rendimiento para MVP
    dirLight.shadow.bias = -0.0001;          // Elimina "shadow acne" en PBR
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 5000;
    sceneRef.current.add(dirLight);

    // ── D. GridHelper decorativo ─────────────────────────────────────────────
    const grid = new THREE.GridHelper(2000, 40, 0xdddddd, 0xf0f0f0);
    sceneRef.current.add(grid);

    // ── E. Grupos de escena ──────────────────────────────────────────────────
    sceneRef.current.add(roomGroupRef.current);
    sceneRef.current.add(measurementsGroupRef.current);

    // ── F. ResizeObserver (adaptar renderer al contenedor) ───────────────────
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height);
      labelRenderer.setSize(width, height);
      // La cámara se ajusta en useCameraControls que observa los mismos cambios.
    });
    ro.observe(mountNode);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      ro.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
      if (labelRenderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(labelRenderer.domElement);
      }
      rendererRef.current = null;
      labelRendererRef.current = null;
    };
  // Intencionalmente vacío: este effect solo corre al montar/desmontar.
  // Los materiales se pasan como argumento pero no son dependencia del setup.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sceneRef: sceneRef as React.RefObject<THREE.Scene>,
    rendererRef,
    labelRendererRef,
    roomGroupRef: roomGroupRef as React.RefObject<THREE.Group>,
    wallsRef,
    measurementsGroupRef: measurementsGroupRef as React.RefObject<THREE.Group>,
  };
}
