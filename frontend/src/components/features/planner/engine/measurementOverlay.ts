/**
 * @module measurementOverlay
 * @description
 * Funciones puras para crear y limpiar la capa de cotas CSS2D sobre la escena 3D.
 *
 * Principio de diseño:
 *  - Sin estado interno ni hooks de React.
 *  - Recibe los refs ya resueltos (no los MutableRefObject), por lo que el
 *    llamador es responsable de resolver `.current` antes de invocar.
 *  - Permite ser consumido desde `useInteraction` y `useSceneObjects` sin
 *    crear dependencias circulares.
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { ENGINEERING_CONSTANTS } from '../config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Crea un nodo HTML estilizado y lo envuelve en un CSS2DObject.
 * Usa clases Tailwind compatibles con el sistema de diseño del proyecto.
 */
function createDimensionLabel(text: string): CSS2DObject {
  const div = document.createElement('div');
  div.className =
    'px-2 py-0.5 bg-blue-600 text-white text-xs font-mono rounded shadow-md pointer-events-none select-none border border-blue-400';
  div.textContent = text;
  return new CSS2DObject(div);
}

// ─────────────────────────────────────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Elimina todos los hijos del grupo de cotas de forma segura.
 * Llamar siempre antes de `updateMeasurements` para evitar acumulación.
 *
 * @param measurementsGroup - Grupo Three.js dedicado exclusivamente a cotas.
 */
export function clearMeasurements(measurementsGroup: THREE.Group): void {
  while (measurementsGroup.children.length > 0) {
    measurementsGroup.remove(measurementsGroup.children[0]);
  }
}

/**
 * Recalcula y añade las etiquetas de cota (ancho, elevación, laterales) al grupo.
 *
 * Estrategia de renderizado:
 *  1. Ancho total del objeto (encima del bounding box).
 *  2. Elevación desde el suelo (si el objeto está sobre un muro).
 *  3. Distancias laterales al borde del muro.
 *
 * @param target           - El Object3D raíz del elemento siendo arrastrado.
 * @param wall             - El muro al que está anclado, o null si es suelo libre.
 * @param measurementsGroup - Grupo que acumula los CSS2DObject.
 * @param roomHeightMm     - Altura de la habitación en milímetros (para convertir a unidades 3D).
 */
export function updateMeasurements(
  target: THREE.Object3D,
  wall: THREE.Mesh | null,
  measurementsGroup: THREE.Group,
  roomHeightMm: number,
): void {
  // Limpieza previa
  clearMeasurements(measurementsGroup);

  // ── Cálculo del Bounding Box del grupo completo ──────────────────────────
  const bbox = new THREE.Box3().setFromObject(target);
  const size = new THREE.Vector3();
  bbox.getSize(size);
  const center = new THREE.Vector3();
  bbox.getCenter(center);

  // ── A. Etiqueta de Ancho (siempre visible) ───────────────────────────────
  const widthLabel = createDimensionLabel(
    `${Math.round(size.x * ENGINEERING_CONSTANTS.SCALE_FACTOR)} mm`,
  );
  widthLabel.position.copy(center).add(new THREE.Vector3(0, size.y / 2 + 2, 0));
  measurementsGroup.add(widthLabel);

  // ── B. Cotas relativas al muro (solo si hay muro activo) ─────────────────
  if (!wall) return;

  const localPoint = wall.worldToLocal(center.clone());
  const wallGeom = wall.geometry as THREE.BoxGeometry;
  const wallWidth = wallGeom.parameters.width;
  const wallHeightUnits = roomHeightMm / 10; // mm → unidades 3D (SCALE_FACTOR = 10)

  // Distancias en unidades 3D
  const distLeft  = wallWidth / 2 + localPoint.x - size.x / 2;
  const distRight = wallWidth / 2 - localPoint.x - size.x / 2;
  const distFloor = wallHeightUnits / 2 + localPoint.y - size.y / 2;

  // B.1 Elevación
  if (distFloor > 0.1) {
    const bottomObj = center.clone().sub(new THREE.Vector3(0, size.y / 2, 0));
    const elevLabel = createDimensionLabel(
      `Elev: ${Math.round(distFloor * ENGINEERING_CONSTANTS.SCALE_FACTOR)} mm`,
    );
    elevLabel.position.copy(bottomObj);
    measurementsGroup.add(elevLabel);
  }

  // B.2 Distancia izquierda
  const leftWallEdgeWorld  = new THREE.Vector3(-wallWidth / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);
  const rightWallEdgeWorld = new THREE.Vector3( wallWidth / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);
  const leftObjEdgeWorld   = new THREE.Vector3(localPoint.x - size.x / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);
  const rightObjEdgeWorld  = new THREE.Vector3(localPoint.x + size.x / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);

  if (distLeft > 1) {
    const lLabel = createDimensionLabel(
      `${Math.round(distLeft * ENGINEERING_CONSTANTS.SCALE_FACTOR)} mm`,
    );
    lLabel.position.copy(leftObjEdgeWorld).lerp(leftWallEdgeWorld, 0.5);
    measurementsGroup.add(lLabel);
  }

  // B.3 Distancia derecha
  if (distRight > 1) {
    const rLabel = createDimensionLabel(
      `${Math.round(distRight * ENGINEERING_CONSTANTS.SCALE_FACTOR)} mm`,
    );
    rLabel.position.copy(rightObjEdgeWorld).lerp(rightWallEdgeWorld, 0.5);
    measurementsGroup.add(rLabel);
  }
}
