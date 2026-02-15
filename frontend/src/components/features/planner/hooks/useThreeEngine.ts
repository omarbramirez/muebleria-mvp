import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type EngineRefs = {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
  labelRenderer: CSS2DRenderer;
  controls: OrbitControls;
};

export const useThreeEngine = (
  containerRef: React.RefObject<HTMLDivElement>,
  viewMode: 'PERSPECTIVE' | 'BLUEPRINT'
) => {
  // Usamos un ref para mantener las instancias sin provocar re-renders de React
  const engineRef = useRef<EngineRefs | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth: w, clientHeight: h } = containerRef.current;

    // 1. Scene & Lights
    const scene = new THREE.Scene();
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(500, 1500, 1000);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.0001;
    dirLight.shadow.mapSize.set(2048, 2048);
    scene.add(hemiLight, dirLight);
    scene.add(new THREE.GridHelper(2000, 40, 0xdddddd, 0xf0f0f0));

    // 2. Renderers
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none';

    containerRef.current.appendChild(renderer.domElement);
    containerRef.current.appendChild(labelRenderer.domElement);

    // 3. Camera Strategy (Strategy Pattern simple)
    let camera: THREE.Camera;
    if (viewMode === 'BLUEPRINT') {
      const frustum = 1000;
      const aspect = w / h;
      camera = new THREE.OrthographicCamera(
        frustum * aspect / -2, frustum * aspect / 2,
        frustum / 2, frustum / -2, 1, 5000
      );
      camera.position.set(0, 1000, 0);
      camera.lookAt(0, 0, 0);
    } else {
      camera = new THREE.PerspectiveCamera(45, w / h, 1, 5000);
      camera.position.set(0, 800, 800);
    }

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.15;
    if (viewMode === 'BLUEPRINT') {
      controls.enableRotate = false;
      controls.screenSpacePanning = true;
    } else {
      controls.maxPolarAngle = Math.PI / 2;
    }

    // 5. Animation Loop
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    // Guardamos las referencias
    engineRef.current = { scene, camera, renderer, labelRenderer, controls };
    setIsReady(true);

    // CLEANUP (Vital para evitar memory leaks)
    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      // Eliminar elementos del DOM manualmente
      if (containerRef.current) {
        if (containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
        }
        if (containerRef.current.contains(labelRenderer.domElement)) {
          containerRef.current.removeChild(labelRenderer.domElement);
        }
      }
    };
  }, [containerRef, viewMode]); // Se reinicia si cambia el modo de vista

  return { engineRef, isReady };
};