'use client';

import * as THREE from "three";
import React, { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  usePreferenceWizardStore,
  CabinetModule
} from "@/store/preferenceWizardStore";



interface Room3DPreviewProps {
  points: { x: number; y: number }[];
  height: number; // en mm
  openings?: WallOpening[];
  appliances?: ApplianceModel[];
  installations?: InstallationPoint[];
  gasConfig?: GasConfig;
  layoutItems?: CabinetModule[];

  // Callbacks
  onGasUpdate?: (gas: GasConfig) => void;
  onInstallationUpdate?: (inst: InstallationPoint) => void;
  onApplianceUpdate?: (app: ApplianceModel) => void;
  onOpeningUpdate?: (op: WallOpening) => void;
  onLayoutUpdate?: (item: CabinetModule) => void;
}

// --- CONSTANTES DE INGENIERÍA ---
const WALL_THICKNESS = 1; // Unidades 3D
const OPENING_DEPTH = WALL_THICKNESS + 4; // Profundidad visual para ventanas
const SCALE_FACTOR = 10; // 1 unidad 3D = 10 mm (Ratio 1:10)

const Room3DPreviewAmateur: React.FC<Room3DPreviewProps> = ({
  points,
  height,
  openings = [],
  appliances = [],
  installations = [],
  gasConfig,
  layoutItems = [],
  onInstallationUpdate,
  onApplianceUpdate,
  onOpeningUpdate,
  onGasUpdate,
  onLayoutUpdate
}) => {
  // 1. CONEXIÓN AL STORE (GLOBAL STATE)
  const { activeWallIndex, setActiveWall } = usePreferenceWizardStore();

  // 2. REFERENCIAS PERSISTENTES (Three.js Context)
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Cache de objetos para interacción (Raycasting)
  const wallsRef = useRef<THREE.Mesh[]>([]);
  const roomGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Estado de interacción
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragRef = useRef<{
    id: string;
    wallIndex: number;
    mesh: THREE.Mesh;
    type: 'installation' | 'appliance' | 'opening' | 'gas' | 'furniture';
  } | null>(null);

  const manualRotationRef = useRef<number>(0);

  // 3. OPTIMIZACIÓN: MATERIALES (Flyweight Pattern implícito)
  const materials = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 1,
      metalness: 0
    }),
    wallSelected: new THREE.MeshStandardMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.75,
      roughness: 0.8,
      metalness: 0,
      side: THREE.DoubleSide
    }),
    floor: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8 }),
    window: new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, depthWrite: false }),
    door: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3, depthWrite: false }),
    elec: new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xccaa00, emissiveIntensity: 0.2 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3b82f6 }),
    gas: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.3 }),
    furnitureBase: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5, metalness: 0.1 }),
    furnitureWall: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5, metalness: 0.1 }),
    furnitureTall: new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5, metalness: 0.1 })
  }), []);

  // 4. INICIALIZACIÓN DEL MOTOR GRÁFICO
  useEffect(() => {
    if (!mountRef.current) return;
    const { clientWidth: w, clientHeight: h } = mountRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 5000);
    camera.position.set(0, 800, 800);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.25;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    sceneRef.current.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(500, 1000, 500);
    dirLight.castShadow = true;
    sceneRef.current.add(dirLight);

    const grid = new THREE.GridHelper(2000, 40, 0xdddddd, 0xf0f0f0);
    sceneRef.current.add(grid);
    sceneRef.current.add(roomGroupRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(sceneRef.current, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // 5. RENDERIZADO REACTIVO DE LA ESCENA
  useEffect(() => {
    const roomGroup = roomGroupRef.current;

    // Limpieza agresiva para evitar fugas de memoria en mallas
    while (roomGroup.children.length > 0) {
      roomGroup.remove(roomGroup.children[0]);
    }
    wallsRef.current = [];

    const heightUnits = height / 10;

    // Centrado automático de la habitación
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    if (points.length > 0) {
      points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minZ) minZ = p.y;
        if (p.y > maxZ) maxZ = p.y;
      });
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      roomGroup.position.set(-centerX, 0, -centerZ);
    }

    // A. GENERACIÓN DE MUROS
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const wallGeo = new THREE.BoxGeometry(len, heightUnits, WALL_THICKNESS);
      const wall = new THREE.Mesh(wallGeo, materials.wall.clone());

      const cx = p.x + dx / 2;
      const cy = p.y + dy / 2;

      wall.position.set(cx, heightUnits / 2, cy);
      wall.rotation.y = -angle; // Rotación inversa para alinear con Three.js

      // Metadatos críticos para Raycasting
      wall.userData = { isDynamic: true, isWall: true, index: i, length: len };

      roomGroup.add(wall);
      wallsRef.current.push(wall);
    });

    // B. RENDERIZADO DE VANOS (Puertas/Ventanas)
    openings.forEach(op => {
      const wall = wallsRef.current[op.wallIndex];
      if (!wall) return;

      const opWidth = op.width / SCALE_FACTOR;
      const opHeight = op.height / SCALE_FACTOR;
      const opDist = op.distFromStart / SCALE_FACTOR;
      const opSill = op.sillHeight / SCALE_FACTOR;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(opWidth, opHeight, OPENING_DEPTH),
        op.type === 'window' ? materials.window : materials.door
      );

      const wallTotalHeight = height / 10;
      const wallLen = wall.userData.length;

      // Coordenadas locales relativas al centro del muro
      const localX = -wallLen / 2 + opDist + opWidth / 2;
      const localY = (-wallTotalHeight / 2) + opSill + (opHeight / 2);

      mesh.position.set(localX, localY, 0);
      mesh.userData = { isDynamic: true, isOpening: true, id: op.id, wallIndex: op.wallIndex };
      wall.add(mesh);
    });

    // C. INSTALACIONES
    installations.forEach(inst => {
      const wall = wallsRef.current[inst.wallIndex];
      if (!wall) return;

      let geo, mat;
      if (inst.type === 'electrical') {
        geo = new THREE.BoxGeometry(6, 10, 2);
        mat = materials.elec;
      } else if (inst.type === 'plumbing') {
        geo = new THREE.CylinderGeometry(3, 3, 5, 16);
        geo.rotateX(Math.PI / 2);
        mat = materials.water;
      } else {
        return;
      }

      const mesh = new THREE.Mesh(geo, mat);
      const wallLen = wall.userData.length;

      const localX = -wallLen / 2 + (inst.distFromStart / SCALE_FACTOR);
      const localY = (inst.heightFromFloor / SCALE_FACTOR) - (heightUnits / 2);
      const zOffset = WALL_THICKNESS / 2 + 2;

      mesh.position.set(localX, localY, zOffset);
      mesh.userData = { isDynamic: true, isInstallation: true, id: inst.id, wallIndex: inst.wallIndex };
      wall.add(mesh);
    });

    // D. GAS (CORREGIDO Y SEGURO)
    if (gasConfig && gasConfig.required) {
      // VALIDACIÓN DE SEGURIDAD: Verificar que el muro exista
      const targetWall = wallsRef.current[gasConfig.wallIndex];

      if (targetWall) {
        const geo = new THREE.CylinderGeometry(1.5, 1.5, 5, 16);
        geo.rotateX(Math.PI / 2);

        const mesh = new THREE.Mesh(geo, materials.gas);
        const wallLen = targetWall.userData.length;

        const localX = -wallLen / 2 + (gasConfig.x / SCALE_FACTOR);
        const localY = (gasConfig.z / SCALE_FACTOR) - (heightUnits / 2);
        const zOffset = WALL_THICKNESS / 2 + 2.5;

        mesh.position.set(localX, localY, zOffset);

        // Importante: Guardar el wallIndex correcto en el objeto 3D
        mesh.userData = {
          isDynamic: true,
          isGas: true,
          wallIndex: gasConfig.wallIndex // Este índice es la verdad absoluta
        };

        targetWall.add(mesh);
      } else {
        console.warn(`[Room3D] Gas configurado para muro índice ${gasConfig.wallIndex}, pero no existe.`);
      }
    }

    // E. MOBILIARIO
    layoutItems.forEach(item => {
      const wall = wallsRef.current[item.wallIndex];
      if (!wall) return;

      const geo = new THREE.BoxGeometry(
        item.width / SCALE_FACTOR,
        item.height / SCALE_FACTOR,
        item.depth / SCALE_FACTOR
      );

      let mat = materials.furnitureBase;
      if (item.type === 'wall') mat = materials.furnitureWall;
      if (item.type === 'tall') mat = materials.furnitureTall;

      const mesh = new THREE.Mesh(geo, mat);

      const wallLen = wall.userData.length;
      const itemWidth3D = item.width / SCALE_FACTOR;
      const itemHeight3D = item.height / SCALE_FACTOR;

      const localX = -wallLen / 2 + (item.distFromStart / SCALE_FACTOR) + (itemWidth3D / 2);
      const localY = (-heightUnits / 2) + (item.elevation / SCALE_FACTOR) + (itemHeight3D / 2);
      const zOffset = (WALL_THICKNESS / 2) + (item.depth / SCALE_FACTOR / 2);

      mesh.position.set(localX, localY, zOffset);
      mesh.userData = { isDynamic: true, isFurniture: true, id: item.id, wallIndex: item.wallIndex };

      wall.add(mesh);
    });

    // F. ELECTRODOMÉSTICOS
    appliances.forEach(app => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(app.width, app.height, app.depth),
        new THREE.MeshStandardMaterial({ color: app.color })
      );
      mesh.position.set(app.position.x, app.height / 2, app.position.z);
      mesh.rotation.y = app.rotation;
      mesh.userData = { isDynamic: true, isAppliance: true, id: app.id };
      roomGroup.add(mesh);
    });

    // REFLEJO VISUAL DE SELECCIÓN
    if (activeWallIndex !== null && wallsRef.current[activeWallIndex]) {
      const wall = wallsRef.current[activeWallIndex];
      wallsRef.current.forEach(w => (w.material as THREE.MeshStandardMaterial).copy(materials.wall));
      (wall.material as THREE.MeshStandardMaterial).copy(materials.wallSelected);
    }

  }, [points, height, openings, appliances, installations, gasConfig, layoutItems, activeWallIndex, materials]);

  // CÁMARA (Sin cambios)
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || points.length === 0) return;
    const center = new THREE.Vector3(0, height / 20, 0);
    // ... lógica de radio ...
    // controlsRef.current.target.copy(center);
    // controlsRef.current.update();
  }, [points, height]);

  // 6. LÓGICA DE INTERACCIÓN (CORE DEL PROBLEMA)
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    const getIntersects = (e: MouseEvent, objects: THREE.Object3D[]) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      return raycaster.current.intersectObjects(objects, false);
    };

    const handleDown = (e: MouseEvent) => {
      const interactables: THREE.Mesh[] = [];
      // Recolectar interactuables
      roomGroupRef.current.children.forEach(c => c.userData.isAppliance && interactables.push(c as THREE.Mesh));
      wallsRef.current.forEach(w => w.children.forEach(c => {
        if (c.userData.isInstallation || c.userData.isOpening || c.userData.isGas || c.userData.isFurniture) {
          interactables.push(c as THREE.Mesh);
        }
      }));

      const hits = getIntersects(e, interactables);
      if (hits.length > 0) {
        controlsRef.current!.enabled = false;
        const hit = hits[0].object as THREE.Mesh;

        // Identificación segura de tipo
        let type: 'installation' | 'appliance' | 'opening' | 'gas' | 'furniture' = 'appliance';
        if (hit.userData.isInstallation) type = 'installation';
        if (hit.userData.isOpening) type = 'opening';
        if (hit.userData.isGas) type = 'gas';
        if (hit.userData.isFurniture) type = 'furniture';

        dragRef.current = {
          id: hit.userData.id || 'gas-singleton',
          wallIndex: hit.userData.wallIndex ?? -1,
          mesh: hit,
          type: type
        };

        // UX: Si toco un objeto del muro, selecciono ese muro automáticamente
        if (type !== 'appliance') {
          setActiveWall(hit.userData.wallIndex);
        }
        manualRotationRef.current = 0;
        return;
      }

      // Fallback: Selección de Muro
      const wallHits = getIntersects(e, wallsRef.current);
      if (wallHits.length > 0) {
        // NOTA: Si hay overlap en esquinas, el raycaster puede dar el muro "trasero".
        // Esto suele causar la confusión de "seleccioné el muro equivocado".
        // Ordenamos por distancia, pero en esquinas exactas es tricky.
        const index = wallHits[0].object.userData.index;
        setActiveWall(index);
      } else {
        setActiveWall(null);
      }
    };

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { mesh, type, wallIndex } = dragRef.current;

      if (type === 'installation' || type === 'gas' || type === 'furniture') {
        const wall = wallsRef.current[wallIndex];
        if (!wall) return; // Protección contra referencias perdidas

        const hits = getIntersects(e, [wall]);
        if (hits.length > 0) {
          const pointLocal = wall.worldToLocal(hits[0].point.clone());

          const wallLen = wall.userData.length;
          const wallHeight = height / 10;

          // Lógica de Clamping (Restricción de movimiento)
          let minX, maxX, minY, maxY;

          if (type === 'furniture') {
            const itemWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
            const itemHeight = (mesh.geometry as THREE.BoxGeometry).parameters.height;

            // Evitar que el mueble salga del muro
            const limitX = (wallLen / 2) - (itemWidth / 2);
            minX = -Math.max(0, limitX);
            maxX = Math.max(0, limitX);

            const limitY = (wallHeight / 2) - (itemHeight / 2);
            minY = -Math.max(0, limitY);
            maxY = Math.max(0, limitY);
          } else {
            // Instalaciones y Gas (Puntos)
            const halfLen = wallLen / 2;
            const halfHeight = wallHeight / 2;
            minX = -halfLen; maxX = halfLen;
            minY = -halfHeight; maxY = halfHeight;
          }

          // Aplicar Clamping
          const clampedX = Math.max(minX, Math.min(maxX, pointLocal.x));
          const clampedY = Math.max(minY, Math.min(maxY, pointLocal.y));

          mesh.position.x = clampedX;
          mesh.position.y = clampedY;
        }
      }
      else if (type === 'opening') {
        // ... (Lógica de ventanas existente, sin cambios) ...
        const wall = wallsRef.current[wallIndex];
        const hits = getIntersects(e, [wall]);
        if (hits.length > 0) {
          const pointLocal = wall.worldToLocal(hits[0].point.clone());
          const opWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
          const opHeight = (mesh.geometry as THREE.BoxGeometry).parameters.height;
          const wallLen = wall.userData.length;
          const wallTotalHeight = height / 10;
          let rawDist = pointLocal.x + wallLen / 2 - opWidth / 2;
          let rawSill = pointLocal.y + wallTotalHeight / 2 - opHeight / 2;
          rawDist = Math.max(0, Math.min(wallLen - opWidth, rawDist));
          rawSill = Math.max(0, Math.min(wallTotalHeight - opHeight, rawSill));
          const clampedX = -wallLen / 2 + rawDist + opWidth / 2;
          const clampedY = (-wallTotalHeight / 2) + rawSill + (opHeight / 2);
          mesh.position.set(clampedX, clampedY, 0);
        }
      }
      else if (type === 'appliance') {
        // ... (Lógica de electrodomésticos existente) ...
        const wallHits = getIntersects(e, wallsRef.current);
        if (wallHits.length > 0) {
          const hit = wallHits[0];
          const wall = hit.object as THREE.Mesh;
          let baseAngle = wall.rotation.y;
          const pointLocal = wall.worldToLocal(hit.point.clone());
          if (pointLocal.z < 0) baseAngle += Math.PI;
          mesh.rotation.y = baseAngle + manualRotationRef.current;
          // ... clamping appliance ...
          const wallLen = (wall.geometry as THREE.BoxGeometry).parameters.width;
          const objWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
          const minX = -wallLen / 2 + objWidth / 2;
          const maxX = wallLen / 2 - objWidth / 2;
          const clampedX = minX > maxX ? 0 : Math.max(minX, Math.min(maxX, pointLocal.x));
          const wallThickness = WALL_THICKNESS;
          const objDepth = (mesh.geometry as THREE.BoxGeometry).parameters.depth;
          const finalZ = pointLocal.z > 0 ? (wallThickness / 2 + objDepth / 2) : -(wallThickness / 2 + objDepth / 2);
          const finalWorld = new THREE.Vector3(clampedX, -height / 20 + (mesh.geometry as THREE.BoxGeometry).parameters.height / 2, finalZ).applyMatrix4(wall.matrixWorld);
          mesh.position.copy(roomGroupRef.current.worldToLocal(finalWorld));
          dragRef.current.wallIndex = wall.userData.index;
        }
      }
    };

    const handleUp = () => {
      if (dragRef.current) {
        const { mesh, id, type, wallIndex } = dragRef.current;
        const wall = wallsRef.current[wallIndex];

        if (wall) { // Check de seguridad
          const wallLen = wall.userData.length;
          const wallTotalHeight = height / 10;

          if (type === 'furniture' && onLayoutUpdate) {
            const itemWidth3D = (mesh.geometry as THREE.BoxGeometry).parameters.width;
            const itemHeight3D = (mesh.geometry as THREE.BoxGeometry).parameters.height;
            const distMM = (mesh.position.x + wallLen / 2 - itemWidth3D / 2) * SCALE_FACTOR;
            const elevationMM = (mesh.position.y + wallTotalHeight / 2 - itemHeight3D / 2) * SCALE_FACTOR;

            const originalItem = layoutItems.find(i => i.id === id);
            if (originalItem) {
              onLayoutUpdate({
                ...originalItem,
                distFromStart: Math.round(distMM),
                elevation: Math.round(elevationMM)
              });
            }
          }
          else if (type === 'gas' && onGasUpdate && gasConfig) {
            // Matemática Inversa para Gas
            const distMM = (mesh.position.x + wallLen / 2) * SCALE_FACTOR;
            const heightMM = (mesh.position.y + wallTotalHeight / 2) * SCALE_FACTOR;

            onGasUpdate({
              ...gasConfig,
              x: Math.round(distMM),
              z: Math.round(heightMM),
              wallIndex: wallIndex // Mantiene el índice del muro donde está
            });
          }
          // ... resto de casos (installation, opening, etc.) igual que antes ...
          else if (type === 'installation' && onInstallationUpdate) {
            const distMM = (mesh.position.x + wallLen / 2) * SCALE_FACTOR;
            const heightMM = (mesh.position.y + wallTotalHeight / 2) * SCALE_FACTOR;
            const originalInst = installations.find(i => i.id === id);
            if (originalInst) {
              onInstallationUpdate({ ...originalInst, distFromStart: Math.round(distMM), heightFromFloor: Math.round(heightMM) });
            }
          }
          else if (type === 'opening' && onOpeningUpdate) {
            const opWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
            const opHeight = (mesh.geometry as THREE.BoxGeometry).parameters.height;
            const finalDist3D = mesh.position.x + wallLen / 2 - opWidth / 2;
            const finalSill3D = mesh.position.y + wallTotalHeight / 2 - opHeight / 2;
            const originalOp = openings.find(o => o.id === id);
            if (originalOp) {
              onOpeningUpdate({
                ...originalOp,
                distFromStart: Math.round(finalDist3D * SCALE_FACTOR),
                sillHeight: Math.round(finalSill3D * SCALE_FACTOR)
              });
            }
          } else if (type === 'appliance' && onApplianceUpdate) {
            const originalApp = appliances.find(a => a.id === id);
            if (originalApp) {
              onApplianceUpdate({
                ...originalApp,
                position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
                rotation: mesh.rotation.y
              });
            }
          }
        }
      }
      dragRef.current = null;
      if (controlsRef.current) controlsRef.current.enabled = true;
    };

    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [height, onInstallationUpdate, onApplianceUpdate, onOpeningUpdate, onGasUpdate, onLayoutUpdate, appliances, openings, installations, gasConfig, layoutItems, materials]); // Se añade materials a deps

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

export default Room3DPreviewAmateur;