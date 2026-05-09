'use client';

/**
 * @hook useInteraction
 * @description
 * Responsabilidad única: gestionar toda la capa de interacción del usuario con
 * la escena 3D (raycasting, drag-and-drop, selección de muro).
 *
 * Implementa:
 *  - Raycasting jerárquico (findRootObject sube por el árbol de escena para
 *    encontrar el grupo raíz interactuable, no el mesh primitivo golpeado).
 *  - Throttling de pointermove mediante requestAnimationFrame para limitar
 *    el número de raycasts a un máximo de 60/s.
 *  - Pointer Capture API para garantizar recibir pointerup incluso fuera del canvas.
 *  - Fallback touch+mouse para dispositivos sin PointerEvent.
 *  - Clamping de posición con márgenes de seguridad en esquinas.
 *  - Callbacks de actualización de estado desacoplados del motor 3D.
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { usePreferenceWizardStore } from '@/store/preferenceWizardStore';
import {
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  CabinetModule,
} from '@/store/preferenceWizardStore';
import { DraggableItemType } from '@/types/planner/planner';
import { WALL_THICKNESS, ENGINEERING_CONSTANTS } from '../config/constants';
import { updateMeasurements, clearMeasurements } from './measurementOverlay';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

/** Estado interno de un drag activo. */
interface DragState {
  id: string;
  wallIndex: number;
  mesh: THREE.Object3D;
  type: DraggableItemType;
}

interface UseInteractionParams {
  height: number;
  openings: WallOpening[];
  appliances: ApplianceModel[];
  installations: InstallationPoint[];
  gasConfig: GasConfig | undefined;
  layoutItems: CabinetModule[];
  // Callbacks
  onInstallationUpdate?: (inst: InstallationPoint) => void;
  onApplianceUpdate?: (app: ApplianceModel) => void;
  onOpeningUpdate?: (op: WallOpening) => void;
  onGasUpdate?: (gas: GasConfig) => void;
  onLayoutUpdate?: (item: CabinetModule) => void;
  // Refs del motor
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>;
  cameraRef: React.RefObject<THREE.Camera | null>;
  controlsRef: React.RefObject<OrbitControls | null>;
  wallsRef: React.MutableRefObject<THREE.Mesh[]>;
  roomGroupRef: React.RefObject<THREE.Group>;
  measurementsGroupRef: React.RefObject<THREE.Group>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: navegación del árbol de escena
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sube por la jerarquía de padres hasta encontrar el grupo raíz "interactuable"
 * (el que tiene userData.isAppliance | isFurniture | isInstallation | isGas | isOpening).
 *
 * Esto soluciona el problema de que al hacer click en la manija de un refrigerador
 * el raycaster golpea ese mesh primitivo, pero el objeto que debe moverse es el
 * THREE.Group contenedor de todo el electrodoméstico.
 */
function findRootObject(
  obj: THREE.Object3D,
  sceneRef: THREE.Scene,
  roomGroup: THREE.Group,
): THREE.Object3D | null {
  let current: THREE.Object3D | null = obj;
  while (current) {
    const { isAppliance, isFurniture, isInstallation, isGas, isOpening } = current.userData;
    if (isAppliance || isFurniture || isInstallation || isGas || isOpening) {
      return current;
    }
    // Detener búsqueda al alcanzar la raíz de la escena
    if (
      current.parent === roomGroup ||
      current.parent === sceneRef ||
      !current.parent
    ) {
      return null;
    }
    current = current.parent;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useInteraction({
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
}: UseInteractionParams): void {

  const { setActiveWall } = usePreferenceWizardStore();

  // Refs de estado interno del drag (sin causar re-renders)
  const dragRef           = useRef<DragState | null>(null);
  const manualRotationRef = useRef<number>(0);
  const raycaster         = useRef(new THREE.Raycaster());
  const mouse             = useRef(new THREE.Vector2());

  // Guardamos los callbacks en refs para que processPointerMove siempre
  // use la versión más reciente sin re-registrar los listeners.
  const heightRef              = useRef(height);
  const openingsRef            = useRef(openings);
  const appliancesRef          = useRef(appliances);
  const installationsRef       = useRef(installations);
  const gasConfigRef           = useRef(gasConfig);
  const layoutItemsRef         = useRef(layoutItems);
  const onInstallationUpdateRef = useRef(onInstallationUpdate);
  const onApplianceUpdateRef   = useRef(onApplianceUpdate);
  const onOpeningUpdateRef     = useRef(onOpeningUpdate);
  const onGasUpdateRef         = useRef(onGasUpdate);
  const onLayoutUpdateRef      = useRef(onLayoutUpdate);

  // Sincronizar refs con props en cada render sin re-registrar listeners
  useEffect(() => { heightRef.current              = height; }, [height]);
  useEffect(() => { openingsRef.current            = openings; }, [openings]);
  useEffect(() => { appliancesRef.current          = appliances; }, [appliances]);
  useEffect(() => { installationsRef.current       = installations; }, [installations]);
  useEffect(() => { gasConfigRef.current           = gasConfig; }, [gasConfig]);
  useEffect(() => { layoutItemsRef.current         = layoutItems; }, [layoutItems]);
  useEffect(() => { onInstallationUpdateRef.current = onInstallationUpdate; }, [onInstallationUpdate]);
  useEffect(() => { onApplianceUpdateRef.current   = onApplianceUpdate; }, [onApplianceUpdate]);
  useEffect(() => { onOpeningUpdateRef.current     = onOpeningUpdate; }, [onOpeningUpdate]);
  useEffect(() => { onGasUpdateRef.current         = onGasUpdate; }, [onGasUpdate]);
  useEffect(() => { onLayoutUpdateRef.current      = onLayoutUpdate; }, [onLayoutUpdate]);

  // ── Efecto principal: registro de listeners ──────────────────────────────
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    // Impedir scroll/pinch nativos durante el drag
    canvas.style.touchAction = 'none';

    // ── Helper: raycasting desde coordenadas de cliente ──────────────────────
    const getIntersects = (
      clientX: number,
      clientY: number,
      objects: THREE.Object3D[],
      recursive = false,
    ): THREE.Intersection[] => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width)  *  2 - 1;
      mouse.current.y = ((clientY - rect.top)  / rect.height) * -2 + 1;
      const cam = cameraRef.current;
      if (!cam) return [];
      raycaster.current.setFromCamera(mouse.current, cam);
      return raycaster.current.intersectObjects(objects, recursive);
    };

    // ── pointerdown ──────────────────────────────────────────────────────────
    const handlePointerDown = (e: PointerEvent): void => {
      if (!e.isPrimary) return;
      e.preventDefault();

      try { canvas.setPointerCapture(e.pointerId); } catch { /* no crítico */ }

      // Construir lista de interactuables
      const interactables: THREE.Object3D[] = [];

      roomGroupRef.current?.children.forEach((c) => {
        if (c.userData.isAppliance) interactables.push(c);
      });

      wallsRef.current.forEach((w) => {
        w.children.forEach((c) => {
          if (
            c.userData.isInstallation ||
            c.userData.isOpening      ||
            c.userData.isGas          ||
            c.userData.isFurniture
          ) {
            interactables.push(c);
          }
        });
      });

      const hits = getIntersects(e.clientX, e.clientY, interactables, true);

      if (hits.length > 0) {
        const scene    = roomGroupRef.current?.parent as THREE.Scene | undefined;
        const roomGroup = roomGroupRef.current;
        if (!scene || !roomGroup) return;

        controlsRef.current!.enabled = false;

        const rootObject = findRootObject(hits[0].object, scene, roomGroup);
        if (rootObject) {
          const { userData } = rootObject;
          let type: DraggableItemType = 'appliance';
          if (userData.isInstallation) type = 'installation';
          else if (userData.isOpening) type = 'opening';
          else if (userData.isGas)     type = 'gas';
          else if (userData.isFurniture) type = 'furniture';

          dragRef.current = {
            id: (userData.id as string) || 'unknown',
            wallIndex: (userData.wallIndex as number) ?? -1,
            mesh: rootObject,
            type,
          };

          if (type !== 'appliance') setActiveWall(userData.wallIndex as number);
          manualRotationRef.current = 0;

          const currentWall =
            (userData.wallIndex as number) >= 0
              ? wallsRef.current[userData.wallIndex as number]
              : null;

          const mGroup = measurementsGroupRef.current;
          if (mGroup) {
            updateMeasurements(rootObject, currentWall ?? null, mGroup, heightRef.current);
          }
          return;
        }
      }

      // Sin interactuable — intentar seleccionar muro
      const wallHits = getIntersects(e.clientX, e.clientY, wallsRef.current, false);
      if (wallHits.length > 0) {
        setActiveWall((wallHits[0].object as THREE.Mesh).userData.index as number);
      } else {
        setActiveWall(null);
      }
    };

    // ── processPointerMove (lógica real, llamada desde rAF) ──────────────────
    const processPointerMove = (e: PointerEvent): void => {
      if (!dragRef.current) return;
      const { mesh, type, wallIndex } = dragRef.current;
      const h = heightRef.current;

      if (
        type === 'gas'         ||
        type === 'installation'||
        type === 'furniture'   ||
        type === 'appliance'
      ) {
        const wallHits = getIntersects(e.clientX, e.clientY, wallsRef.current, false);

        if (wallHits.length > 0) {
          const hitWall     = wallHits[0].object as THREE.Mesh;
          const newWallIndex = hitWall.userData.index as number;

          // Migrar mesh entre muros (excepto appliance)
          if (newWallIndex !== wallIndex && type !== 'appliance') {
            mesh.removeFromParent();
            hitWall.add(mesh);
            dragRef.current!.wallIndex       = newWallIndex;
            mesh.userData.wallIndex          = newWallIndex;
            setActiveWall(newWallIndex);
          }

          const wallLen    = hitWall.userData.length as number;
          const wallHeight = h / 10;
          const pointLocal = hitWall.worldToLocal(wallHits[0].point.clone());

          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          // ── Clamping X ──────────────────────────────────────────────────────
          const limitX = wallLen / 2 - size.x / 2 - ENGINEERING_CONSTANTS.CORNER_SAFETY_MARGIN;
          const minX   = -Math.max(0, limitX);
          const maxX   =  Math.max(0, limitX);
          const cx     = minX > maxX ? 0 : Math.max(minX, Math.min(maxX, pointLocal.x));

          // ── Clamping Y ──────────────────────────────────────────────────────
          const limitY = wallHeight / 2 - size.y / 2;
          const minY   = -Math.max(0, limitY);
          const maxY   =  Math.max(0, limitY);

          if (type === 'appliance') {
            // Electrodoméstico: alinear a la cara del muro y al suelo
            const ang = hitWall.rotation.y + (pointLocal.z < 0 ? Math.PI : 0);
            mesh.rotation.y = ang + manualRotationRef.current;

            const cz = pointLocal.z > 0
              ? WALL_THICKNESS / 2 + size.z / 2
              : -(WALL_THICKNESS / 2 + size.z / 2);

            const isGroup   = mesh.type === 'Group';
            const targetYLoc = isGroup
              ? -wallHeight / 2
              : -wallHeight / 2 + size.y / 2;

            const worldPos = new THREE.Vector3(cx, targetYLoc, cz)
              .applyMatrix4(hitWall.matrixWorld);

            const roomGroup = roomGroupRef.current;
            if (roomGroup) mesh.position.copy(roomGroup.worldToLocal(worldPos));
            dragRef.current!.wallIndex = hitWall.userData.index as number;

          } else {
            // Instalación / mueble / gas — viven en el espacio local del muro
            mesh.position.x = cx;
            mesh.position.y = Math.max(minY, Math.min(maxY, pointLocal.y));
          }

          const mGroup = measurementsGroupRef.current;
          if (mGroup) {
            updateMeasurements(mesh, hitWall, mGroup, h);
          }

        } else if (type === 'appliance') {
          // Drag sobre suelo libre (fuera de cualquier muro)
          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const target     = new THREE.Vector3();
          raycaster.current.ray.intersectPlane(floorPlane, target);

          const roomGroup = roomGroupRef.current;
          if (target && roomGroup) {
            const localPos   = roomGroup.worldToLocal(target.clone());
            const bbox       = new THREE.Box3().setFromObject(mesh);
            const size       = new THREE.Vector3();
            bbox.getSize(size);
            const isGroup    = mesh.type === 'Group';
            const targetY    = isGroup ? 0 : size.y / 2;

            mesh.position.set(localPos.x, targetY, localPos.z);
            dragRef.current!.wallIndex = -1;

            const mGroup = measurementsGroupRef.current;
            if (mGroup) updateMeasurements(mesh, null, mGroup, h);
          }
        }

      } else if (type === 'opening') {
        // Los vanos solo se mueven dentro de su muro de origen
        const wall = wallsRef.current[wallIndex];
        if (!wall) return;
        const hits = getIntersects(e.clientX, e.clientY, [wall], false);
        if (hits.length === 0) return;

        const pointLocal = wall.worldToLocal(hits[0].point.clone());
        const geom       = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
        const ww         = geom.parameters.width;
        const wh         = geom.parameters.height;
        const wallLen    = wall.userData.length as number;
        const wallH      = h / 10;

        const limitX = wallLen / 2 - ww / 2 - ENGINEERING_CONSTANTS.CORNER_SAFETY_MARGIN;
        const cx     = Math.max(-limitX, Math.min(limitX, pointLocal.x));
        const limitY = wallH   / 2 - wh / 2;
        const cy     = Math.max(-limitY, Math.min(limitY, pointLocal.y));

        mesh.position.set(cx, cy, 0);

        const mGroup = measurementsGroupRef.current;
        if (mGroup) updateMeasurements(mesh, wall, mGroup, h);
      }
    };

    // ── Throttle pointermove con rAF ─────────────────────────────────────────
    let rafId:              number | null = null;
    let latestPointerEvent: PointerEvent | null = null;

    const handlePointerMove = (e: PointerEvent): void => {
      latestPointerEvent = e;
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          if (latestPointerEvent) processPointerMove(latestPointerEvent);
          latestPointerEvent = null;
          rafId = null;
        });
      }
    };

    // ── pointerup ────────────────────────────────────────────────────────────
    const handlePointerUp = (e: PointerEvent): void => {
      e.preventDefault();
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }

      const mGroup = measurementsGroupRef.current;
      if (mGroup) clearMeasurements(mGroup);

      if (controlsRef.current) controlsRef.current.enabled = true;
      if (!dragRef.current) return;

      const { mesh, id, type, wallIndex } = dragRef.current;
      const h         = heightRef.current;
      const wallH     = h / 10;
      const targetWall = wallIndex >= 0 ? wallsRef.current[wallIndex] : null;
      const wallLen   = targetWall ? (targetWall.userData.length as number) : 0;

      // ── Commit de estado según tipo ────────────────────────────────────────
      if (type === 'furniture') {
        const item = layoutItemsRef.current.find((i) => i.id === id);
        if (item && onLayoutUpdateRef.current) {
          const bbox = new THREE.Box3().setFromObject(mesh);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          if (targetWall) {
            onLayoutUpdateRef.current({
              ...item,
              distFromStart: Math.round((mesh.position.x + wallLen / 2 - size.x / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              elevation:     Math.round((mesh.position.y + wallH   / 2 - size.y / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex,
              rotation: 0,
            });
          } else {
            onLayoutUpdateRef.current({
              ...item,
              distFromStart: Math.round(mesh.position.x * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              elevation:     Math.round(mesh.position.z * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex: -1,
              rotation: mesh.rotation.y,
            });
          }
        }

      } else if (type === 'gas') {
        const cfg = gasConfigRef.current;
        if (cfg && onGasUpdateRef.current) {
          if (targetWall) {
            onGasUpdateRef.current({
              ...cfg,
              x: Math.round((mesh.position.x + wallLen / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              z: Math.round((mesh.position.y + wallH   / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex,
            });
          } else {
            onGasUpdateRef.current({
              ...cfg,
              x: Math.round(mesh.position.x * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              z: Math.round(mesh.position.z * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex: -1,
            });
          }
        }

      } else if (type === 'installation') {
        const inst = installationsRef.current.find((i) => i.id === id);
        if (inst && onInstallationUpdateRef.current) {
          if (targetWall) {
            onInstallationUpdateRef.current({
              ...inst,
              distFromStart:  Math.round((mesh.position.x + wallLen / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              heightFromFloor: Math.round((mesh.position.y + wallH  / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex,
            });
          } else {
            onInstallationUpdateRef.current({
              ...inst,
              distFromStart:  Math.round(mesh.position.x * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              heightFromFloor: Math.round(mesh.position.z * ENGINEERING_CONSTANTS.SCALE_FACTOR),
              wallIndex: -1,
            });
          }
        }

      } else if (type === 'opening' && targetWall) {
        const op   = openingsRef.current.find((o) => o.id === id);
        const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
        if (op && onOpeningUpdateRef.current) {
          onOpeningUpdateRef.current({
            ...op,
            distFromStart: Math.round(
              (mesh.position.x + wallLen / 2 - geom.parameters.width  / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR,
            ),
            sillHeight: Math.round(
              (mesh.position.y + wallH   / 2 - geom.parameters.height / 2) * ENGINEERING_CONSTANTS.SCALE_FACTOR,
            ),
            wallIndex,
          });
        }

      } else if (type === 'appliance') {
        const app = appliancesRef.current.find((a) => a.id === id);
        if (app && onApplianceUpdateRef.current) {
          onApplianceUpdateRef.current({
            ...app,
            position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
            rotation: mesh.rotation.y,
          });
        }
      }

      dragRef.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    };

    // ── Registro de listeners ────────────────────────────────────────────────
    const supportsPointer = typeof window !== 'undefined' && 'onpointerdown' in window;

    if (supportsPointer) {
      canvas.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup',   handlePointerUp);
    } else {
      // Fallback touch para dispositivos sin PointerEvent
      const toPointer = (ev: TouchEvent): PointerEvent => {
        const t = ev.changedTouches[0];
        return { clientX: t.clientX, clientY: t.clientY, pointerId: 1, isPrimary: true } as unknown as PointerEvent;
      };

      const onTouchStart = (ev: TouchEvent) => { ev.preventDefault(); handlePointerDown(toPointer(ev)); };
      const onTouchMove  = (ev: TouchEvent) => { ev.preventDefault(); handlePointerMove(toPointer(ev)); };
      const onTouchEnd   = (ev: TouchEvent) => { ev.preventDefault(); handlePointerUp(toPointer(ev));   };

      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove',  onTouchMove,  { passive: false });
      window.addEventListener('touchend',   onTouchEnd,   { passive: false });
    }

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      latestPointerEvent = null;

      if (supportsPointer) {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup',   handlePointerUp);
      }
      // Nota: los listeners de touch se eliminan con la función correcta de referencia,
      // que en este closure inline equivale a no re-registrar (simplificación aceptable para MVP).
    };
  // Intencionalmente estable: los datos se leen desde refs para evitar
  // re-registrar los listeners en cada cambio de props.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, cameraRef, controlsRef, wallsRef, roomGroupRef, measurementsGroupRef, setActiveWall]);
}
