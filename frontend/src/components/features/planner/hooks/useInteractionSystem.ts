import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EngineRefs } from './useThreeEngine';
import { ENGINEERING_CONSTANTS } from '../config/constants';

// Tipos de datos que esperamos recibir de los callbacks
import { CabinetModule, ApplianceModel, WallOpening, InstallationPoint, GasConfig } from '@/store/preferenceWizardStore';

// Definimos los tipos de callbacks para desacoplar el hook del store específico
export interface InteractionCallbacks {
  setActiveWall: (index: number | null) => void;
  onLayoutUpdate?: (item: CabinetModule) => void;
  onApplianceUpdate?: (item: ApplianceModel) => void;
  onOpeningUpdate?: (item: WallOpening) => void;
  onInstallationUpdate?: (item: InstallationPoint) => void;
  onGasUpdate?: (item: GasConfig) => void;
}

type DraggableType = 'furniture' | 'appliance' | 'opening' | 'installation' | 'gas';

interface DragState {
  object: THREE.Object3D;     // El objeto visual que estamos moviendo
  type: DraggableType;        // Qué es (para saber qué callback llamar)
  id: string;                 // ID del modelo de datos
  initialWallIndex: number;   // Dónde empezó (para detectar cambios de muro)
  offset: THREE.Vector3;      // Desplazamiento desde el punto de click al centro del objeto
}

/**
 * useInteractionSystem
 * Maneja toda la lógica de Raycasting, Drag & Drop y Selección.
 */
export const useInteractionSystem = (
  engine: EngineRefs | null,
  roomGroup: THREE.Group,
  walls: THREE.Mesh[],
  callbacks: InteractionCallbacks,
  contextData: {
    height: number;
    layoutItems: CabinetModule[]; // Necesario para buscar el item original al soltar
    appliances: ApplianceModel[];
    // ... otros arrays de datos si es necesario para recuperar el estado original
  }
) => {
  // Estado mutable interno (No provoca re-renders)
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragState = useRef<DragState | null>(null);
  const planeRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)); // Plano infinito del suelo para arrastre libre

  useEffect(() => {
    if (!engine) return;
    const { renderer, camera, controls } = engine;
    const canvas = renderer.domElement;

    // --- 1. HELPERS DE INGENIERÍA ---

    // Convierte coordenadas del mouse (event) a normalizadas (-1 a +1) y lanza el Rayo
    const castRay = (clientX: number, clientY: number, targets: THREE.Object3D[], recursive: boolean = true) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      return raycaster.current.intersectObjects(targets, recursive); // Recursive = true
    };

    // "Bubble Up": Si toco una manija, quiero el mueble entero.
    const findInteractiveParent = (obj: THREE.Object3D): THREE.Object3D | null => {
      let current: THREE.Object3D | null = obj;
      while (current) {
        if (
          current.userData.isFurniture ||
          current.userData.isAppliance ||
          current.userData.isOpening ||
          current.userData.isInstallation ||
          current.userData.isGas
        ) {
          return current;
        }
        if (current === roomGroup || !current.parent) return null;
        current = current.parent;
      }
      return null;
    };

    // --- 2. HANDLERS DE EVENTOS ---

    const handlePointerDown = (e: PointerEvent) => {
      if (!e.isPrimary) return; // Ignorar toques secundarios o click derecho

      // A. Detectar Objetos Interactuables
      // Raycasteamos contra todo el grupo de la habitación
      const hits = castRay(e.clientX, e.clientY, roomGroup.children, true);

      if (hits.length > 0) {
        // Buscamos si tocamos un objeto con lógica de negocio
        const rootObj = findInteractiveParent(hits[0].object);

        if (rootObj) {
          // ¡OBJETO ENCONTRADO! INICIAR ARRASTRE
          e.preventDefault();
          controls.enabled = false; // Desactivar rotación de cámara

          // Calcular offset para que el objeto no "salte" al centro del mouse
          // El offset es la diferencia entre donde hice click y el centro del objeto
          const intersectionPoint = hits[0].point;
          const objectPosition = new THREE.Vector3();
          rootObj.getWorldPosition(objectPosition);
          const offset = objectPosition.clone().sub(intersectionPoint);

          // Determinar tipo
          let type: DraggableType = 'furniture';
          if (rootObj.userData.isAppliance) type = 'appliance';
          else if (rootObj.userData.isOpening) type = 'opening';
          else if (rootObj.userData.isInstallation) type = 'installation';
          else if (rootObj.userData.isGas) type = 'gas';

          dragState.current = {
            object: rootObj,
            type,
            id: rootObj.userData.id,
            initialWallIndex: rootObj.userData.wallIndex ?? -1,
            offset
          };

          // Si es un objeto de pared, seleccionamos esa pared automáticamente
          if (rootObj.userData.wallIndex !== undefined && rootObj.userData.wallIndex >= 0) {
            callbacks.setActiveWall(rootObj.userData.wallIndex);
          }

          // Capturar el puntero para que el evento 'up' se dispare aunque salga del canvas
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }

      // B. Selección de Muros (Si no toqué ningún objeto)
      // Raycasteamos específicamente contra los muros
      const wallHits = castRay(e.clientX, e.clientY, walls, false);
      if (wallHits.length > 0) {
        const wallIndex = wallHits[0].object.userData.index;
        callbacks.setActiveWall(wallIndex);
      } else {
        callbacks.setActiveWall(null); // Click en el vacío = Deseleccionar
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragState.current) return;
      e.preventDefault();

      const { object, type, offset } = dragState.current;

      // LÓGICA DE MOVIMIENTO SEGÚN TIPO

      // CASO 1: Objetos pegados a Pared (Muebles, Ventanas, Instalaciones)
      // Necesitamos encontrar contra QUÉ pared estamos arrastrando
      if (type === 'furniture' || type === 'opening' || type === 'installation' || type === 'gas') {
        const wallHits = castRay(e.clientX, e.clientY, walls);

        if (wallHits.length > 0) {
          const hitWall = wallHits[0].object as THREE.Mesh;
          // Validación extra de seguridad: Asegurarnos de que golpeamos un muro real
          if (!hitWall.userData.isWall) return;
          const newWallIndex = hitWall.userData.index;
          const hitPoint = wallHits[0].point;

          // A. Cambio de Muro (Reparenting)
          // Si arrastro de Pared A a Pared B, tengo que mover el objeto en el grafo de escena
          if (object.parent !== hitWall) {
            object.removeFromParent();
            hitWall.add(object);
            object.userData.wallIndex = newWallIndex;
            dragState.current.initialWallIndex = newWallIndex; // Actualizar estado
            callbacks.setActiveWall(newWallIndex);
          }

          // B. Transformación Mundial -> Local
          // Convertimos el punto de impacto (Mundo) al sistema de coordenadas de la Pared (Local)
          const localPoint = hitWall.worldToLocal(hitPoint.clone());

          // C. Matemáticas de Límites (Clamping)
          // Obtenemos dimensiones para no salirnos
          const wallLen = hitWall.userData.length;
          const wallHeight = contextData.height / ENGINEERING_CONSTANTS.SCALE_FACTOR;

          // Calculamos Bounding Box del objeto para saber su ancho/alto real
          const bbox = new THREE.Box3().setFromObject(object);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          // Limites en X (Horizontal)
          const margin = ENGINEERING_CONSTANTS.CORNER_SAFETY_MARGIN;
          const limitX = (wallLen / 2) - (size.x / 2) - margin;
          // Math.max/min asegura que x se quede dentro de [-limitX, +limitX]
          const clampedX = Math.max(-limitX, Math.min(limitX, localPoint.x));

          // Limites en Y (Vertical / Elevación)
          const limitY = (wallHeight / 2) - (size.y / 2);

          // Lógica específica por tipo
          if (type === 'furniture') {
            // Muebles: Se mueven libremente en X.
            // En Y (elevación), podríamos permitir movimiento o anclar al suelo.
            // Aquí permitimos movimiento libre clampeado.
            const clampedY = Math.max(-limitY, Math.min(limitY, localPoint.y));

            object.position.x = clampedX;
            object.position.y = clampedY;
            // Z se mantiene fijo (pegado a la pared)
          }
          else if (type === 'opening') {
            // Ventanas/Puertas: Movimiento libre en muro
            const clampedY = Math.max(-limitY, Math.min(limitY, localPoint.y));
            object.position.set(clampedX, clampedY, 0);
          }
          // Gas e Instalaciones siguen lógica similar...
          else {
            const clampedY = Math.max(-limitY, Math.min(limitY, localPoint.y));
            object.position.set(clampedX, clampedY, object.position.z);
          }
        }
      }
      // CASO 2: Objetos Libres (Islas, Electrodomésticos de piso)
      else if (type === 'appliance') {
        // Raycast contra el plano matemático del suelo (infinito)
        raycaster.current.setFromCamera(mouse.current, camera);
        const target = new THREE.Vector3();
        raycaster.current.ray.intersectPlane(planeRef.current, target);

        if (target) {
          // Sumamos el offset original para mantener el punto de agarre relativo
          const newPos = target.add(offset);

          // Convertimos a local del RoomGroup (por si el RoomGroup no está en 0,0,0)
          const localPos = roomGroup.worldToLocal(newPos.clone());

          object.position.x = localPos.x;
          object.position.z = localPos.z;
          // Y se queda en 0 (suelo) o lo que defina el modelo
        }
      }

      // AQUÍ: Podrías llamar a una función para actualizar líneas de cotas (UI)
      // updateMeasurements(object, walls);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState.current) return;
      canvas.releasePointerCapture(e.pointerId);
      controls.enabled = true; // Reactivar cámara

      const { object, type, id, initialWallIndex } = dragState.current;
      const wallIndex = object.userData.wallIndex;
      const currentWall = (wallIndex !== undefined && wallIndex >= 0) ? walls[wallIndex] : null;

      // 3. ACTUALIZACIÓN DEL STORE (Persistencia)
      // Convertimos las coordenadas visuales (Three.js units) a datos de negocio (mm)
      const scale = ENGINEERING_CONSTANTS.SCALE_FACTOR;

      // Ejemplo para Muebles (Furniture)
      if (type === 'furniture' && callbacks.onLayoutUpdate) {
        const itemData = contextData.layoutItems.find(i => i.id === id);
        if (itemData) {
          // Necesitamos dimensiones para calcular distFromStart (desde la izquierda)
          // ThreeJS usa centro (0), Negocio usa Left-Bottom
          const bbox = new THREE.Box3().setFromObject(object);
          const size = new THREE.Vector3();
          bbox.getSize(size);

          if (currentWall) {
            // Matemática inversa: Local X -> Dist From Start
            const wallLen = currentWall.userData.length;
            const wallHeight = contextData.height / scale;

            // X: (-wallLen/2) es el borde izquierdo.
            // dist = (pos.x - (-wallLen/2)) - (width/2)
            const distFromStart = (object.position.x + wallLen / 2 - size.x / 2) * scale;
            const elevation = (object.position.y + wallHeight / 2 - size.y / 2) * scale;

            callbacks.onLayoutUpdate({
              ...itemData,
              wallIndex: wallIndex,
              distFromStart: Math.round(distFromStart),
              elevation: Math.round(elevation),
              // rotation: 0 // Asumimos rotación 0 si está en pared
            });
          } else {
            // Caso Isla (No implementado en detalle, pero estructura lista)
          }
        }
      }

      // Ejemplo para Electrodomésticos (Appliance)
      else if (type === 'appliance' && callbacks.onApplianceUpdate) {
        const appData = contextData.appliances.find(a => a.id === id);
        if (appData) {
          callbacks.onApplianceUpdate({
            ...appData,
            position: {
              x: object.position.x,
              y: object.position.y,
              z: object.position.z
            },
            rotation: object.rotation.y
          });
        }
      }

      // ... Implementar bloques 'else if' similares para Gas, Openings, etc.

      dragState.current = null;
    };

    // --- 4. REGISTRO DE EVENTOS ---
    canvas.addEventListener('pointerdown', handlePointerDown);
    // Usamos window para move/up para que no se rompa si el mouse sale del canvas
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

  }, [engine, roomGroup, walls, callbacks, contextData]); // Re-bind si cambian las referencias clave
};