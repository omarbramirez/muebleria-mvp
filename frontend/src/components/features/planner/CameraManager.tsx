import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber'; // Si usaras R3F, pero aquí lo hacemos nativo
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type ViewMode = 'PERSPECTIVE' | 'BLUEPRINT';

interface CameraManagerProps {
    mode: ViewMode;
    sceneDimensions: { width: number; height: number }; // Tamaño de la habitación para zoom fit
    cameraRef: React.MutableRefObject<THREE.Camera | null>;
    controlsRef: React.MutableRefObject<OrbitControls | null>;
    renderer: THREE.WebGLRenderer;
}

/**
 * Este helper gestiona la transición suave entre modos de cámara.
 * Mantiene la posición relativa pero cambia la matriz de proyección.
 */
export const switchCameraMode = (
    mode: ViewMode,
    currentCamera: THREE.Camera,
    controls: OrbitControls,
    sceneSize: number // Tamaño aprox de la escena para el frustum ortográfico
) => {
    const aspect = window.innerWidth / window.innerHeight;
    let newCamera: THREE.Camera;

    if (mode === 'BLUEPRINT') {
        // 1. Configuración Ortográfica (Zenithal)
        // El frustum size determina cuánto zoom tiene.
        const frustumSize = sceneSize * 1.5;
        newCamera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            10000
        );

        // Posición cenital estricta (Y-up)
        newCamera.position.set(0, 1000, 0);
        newCamera.lookAt(0, 0, 0);

        // Bloquear rotación en controles para mantener el 2D estricto
        controls.enableRotate = false;
        controls.enableZoom = true;
        controls.screenSpacePanning = true; // Panorámica natural en 2D
    } else {
        // 2. Configuración Perspectiva (Inmersiva)
        newCamera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
        newCamera.position.set(0, 800, 800); // Vista isométrica default

        controls.enableRotate = true;
        controls.enableZoom = true;
        controls.screenSpacePanning = false;
    }

    return newCamera;
};