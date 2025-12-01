'use client';
import * as THREE from "three";
import React, { useEffect, useRef, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WallOpening, ApplianceModel, InstallationPoint, GasConfig, usePreferenceWizardStore } from "@/store/preferenceWizardStore";

interface Room3DPreviewProps {
  points: { x: number; y: number }[];
  height: number; // mm
  openings?: WallOpening[];
  appliances?: ApplianceModel[];
  installations?: InstallationPoint[];
  onInstallationUpdate?: (inst: InstallationPoint) => void;
  onApplianceUpdate?: (app: ApplianceModel) => void;
  onOpeningUpdate?: (op: WallOpening) => void;
  gasConfig?: GasConfig;
}

const WALL_THICKNESS = 1;
const openingDepth = WALL_THICKNESS + 20;
const SCALE_FACTOR = 10; // 1 unidad 3D = 10 mm

const Room3DPreviewAmateur: React.FC<Room3DPreviewProps> = ({
  points,
  height,
  openings = [],
  appliances = [],
  installations = [],
  onInstallationUpdate,
  onApplianceUpdate,
  onOpeningUpdate,
  gasConfig
}) => {
  // 1. CONECTAR SELECCIÓN GLOBAL
  const { activeWallIndex, setActiveWall } = usePreferenceWizardStore();
  // Referencias persistentes
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const wallsRef = useRef<THREE.Mesh[]>([]); // Cache de muros para raycasting
  const roomGroupRef = useRef<THREE.Group>(new THREE.Group()); // Group to center the room
  // Estado de interacción
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dragRef = useRef<{ id: string, wallIndex: number, mesh: THREE.Mesh, type: 'installation' | 'appliance' | 'opening' | 'gas' } | null>(null);
  const selectedWallRef = useRef<THREE.Mesh | null>(null);
  // NUEVO: Ref para acumular la rotación manual del usuario (en radianes)
  const manualRotationRef = useRef<number>(0);
  // --- MATERIALES ---

  const materials = useRef({
    wall: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 1,
      metalness: 0,
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
    gas: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.3 })
  }).current;

  // 1. INICIALIZACIÓN
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
    // Add Room Group
    sceneRef.current.add(roomGroupRef.current);

    // Animate
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
  // 2. CONSTRUCCIÓN DE ESCENA (Reactiva)
  useEffect(() => {
    const roomGroup = roomGroupRef.current;
    // Clear previous children
    while (roomGroup.children.length > 0) {
      roomGroup.remove(roomGroup.children[0]);
    }
    wallsRef.current = [];
    const heightUnits = height / 10;
    // Calculate Center
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
      // Center the group
      roomGroup.position.set(-centerX, 0, -centerZ);
    }
    // A. CONSTRUIR MUROS
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const wallGeo = new THREE.BoxGeometry(len, heightUnits, WALL_THICKNESS);
      const wall = new THREE.Mesh(wallGeo, materials.wall.clone()); // Clone to allow individual selection
      const cx = p.x + dx / 2;
      const cy = p.y + dy / 2;
      wall.position.set(cx, heightUnits / 2, cy);
      wall.rotation.y = -angle;
      wall.userData = { isDynamic: true, isWall: true, index: i, length: len, p1: p, p2: next };
      roomGroup.add(wall);
      wallsRef.current.push(wall);
    });
    // B. VANOS (CON DATOS PARA DRAG)
    openings.forEach(op => {
      const wall = wallsRef.current[op.wallIndex];
      if (!wall) return;
      const opWidth = op.width / SCALE_FACTOR;
      const opHeight = op.height / SCALE_FACTOR;
      const opDist = op.distFromStart / SCALE_FACTOR;
      const opSill = op.sillHeight / SCALE_FACTOR;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(opWidth, opHeight, openingDepth),
        op.type === 'window' ? materials.window : materials.door
      );
      const wallTotalHeight = height / 10;
      const wallLen = wall.userData.length;
      const localX = -wallLen / 2 + opDist + opWidth / 2;
      const localY = (-wallTotalHeight / 2) + opSill + (opHeight / 2);
      mesh.position.set(localX, localY, 0);
      // AÑADIMOS DATOS CLAVE PARA EL DRAG
      mesh.userData = { isDynamic: true, isOpening: true, id: op.id, wallIndex: op.wallIndex };
      wall.add(mesh);
    });


    // C. INSTALACIONES (Eléctricas e Hidro)
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
        // Fallback por si acaso, aunque el gas se maneja abajo
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

    // D. GAS (BLOQUE DE RENDERIZADO CORREGIDO)
    // ---------------------------------------------------------
    if (gasConfig && gasConfig.required && wallsRef.current[gasConfig.wallIndex]) {
      const wall = wallsRef.current[gasConfig.wallIndex];

      // 1. Geometría distintiva para Gas (Tubería roja)
      const geo = new THREE.CylinderGeometry(1.5, 1.5, 5, 16);
      geo.rotateX(Math.PI / 2); // Rotar para salir del muro

      const mesh = new THREE.Mesh(geo, materials.gas);

      // 2. Cálculo de Posición
      const wallLen = wall.userData.length;
      // La UI envía 'x' en CM. Nuestra escala es 1u = 10mm = 1cm. Es relación 1:1.

      // Eje X: Origen en centro del muro.
      const localX = -wallLen / 2 + gasConfig.x;

      // Eje Y: Origen en centro vertical del muro.
      const localY = gasConfig.z - (heightUnits / 2);

      const zOffset = WALL_THICKNESS / 2 + 2.5; // Salir un poco

      mesh.position.set(localX, localY, zOffset);

      // 3. Metadatos para Raycasting
      mesh.userData = {
        isDynamic: true,
        isGas: true,
        wallIndex: gasConfig.wallIndex
      };

      wall.add(mesh);
    }
    // ---------------------------------------------------------
    // D. ELECTRODOMÉSTICOS
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
    // C. REFLEJAR SELECCIÓN EXTERNA (Si seleccionas en 2D, ilumina en 3D)
    if (activeWallIndex !== null && wallsRef.current[activeWallIndex]) {
      const wall = wallsRef.current[activeWallIndex];
      // Resetear todos primero
      wallsRef.current.forEach(w => (w.material as THREE.MeshStandardMaterial).copy(materials.wall));
      // Iluminar el activo
      (wall.material as THREE.MeshStandardMaterial).copy(materials.wallSelected);
      selectedWallRef.current = wall;
    }
  }, [points, height, openings, appliances, installations, gasConfig, activeWallIndex]);
  // Camera Adjustment
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current || points.length === 0) return;
    // Since we centered the room group, the "center" of the room is now at (0,0,0) world space.
    // So we can just target (0,0,0).
    const center = new THREE.Vector3(0, height / 20, 0);
    // Calculate radius based on dimensions
    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minZ) minZ = p.y;
      if (p.y > maxZ) maxZ = p.y;
    });
    const width = maxX - minX;
    const depth = maxZ - minZ;
    const radius = Math.max(width, depth) * 1.5;
    controlsRef.current.target.copy(center);
    const camera = cameraRef.current;
    camera.position.set(radius, radius, radius);
    camera.lookAt(center);
    controlsRef.current.update();
  }, [points, height]);

  // 3. INTERACCIÓN (Eventos)
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
      // Buscamos Appliances
      roomGroupRef.current.children.forEach(c => c.userData.isAppliance && interactables.push(c as THREE.Mesh));
      // Buscamos Instalaciones Y AHORA TAMBIÉN VANOS dentro de los muros
      wallsRef.current.forEach(w => w.children.forEach(c => {
        if (c.userData.isInstallation || c.userData.isOpening || c.userData.isGas) interactables.push(c as THREE.Mesh);
      }));
      const hits = getIntersects(e, interactables);
      if (hits.length > 0) {
        controlsRef.current!.enabled = false;
        const hit = hits[0].object as THREE.Mesh;
        let type: 'installation' | 'appliance' | 'opening' | 'gas' = 'appliance';
        if (hit.userData.isInstallation) type = 'installation';
        if (hit.userData.isOpening) type = 'opening';
        if (hit.userData.isGas) type = 'gas';
        dragRef.current = {
          id: hit.userData.id || 'gas-singleton',
          wallIndex: hit.userData.wallIndex ?? -1,
          mesh: hit,
          type: type
        };
        // Si es un vano, seleccionamos también el muro automáticamente
        if (type === 'opening' || type === 'gas' || type === 'installation') {
          setActiveWall(hit.userData.wallIndex);
        }
        manualRotationRef.current = 0;
        return;
      }
      // Lógica de selección de muro (Igual que antes)
      const wallHits = getIntersects(e, wallsRef.current);
      if (wallHits.length > 0) {
        const index = wallHits[0].object.userData.index;
        setActiveWall(index);
      } else {
        setActiveWall(null);
      }
    };
    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { mesh, type, wallIndex } = dragRef.current;
      if (type === 'opening') {
        // --- LÓGICA DE ARRASTRE DE VANO ---
        const wall = wallsRef.current[wallIndex];
        const hits = getIntersects(e, [wall]);
        if (hits.length > 0) {
          // 1. Obtener punto local en el muro
          const pointLocal = wall.worldToLocal(hits[0].point.clone());
          // 2. Recuperar datos originales para limites
          // Necesitamos saber el ancho/alto REAL para hacer el clamping
          const opWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
          const opHeight = (mesh.geometry as THREE.BoxGeometry).parameters.height;
          const wallLen = wall.userData.length;
          const wallTotalHeight = height / 10;
          // 3. CALCULAR 'DISTANCIA' y 'ANTEPECHO' (Matemática Inversa)
          // localX = -wallLen/2 + dist + width/2  =>  dist = localX + wallLen/2 - width/2
          let rawDist = pointLocal.x + wallLen / 2 - opWidth / 2;
          // localY = -wallHeight/2 + sill + height/2  =>  sill = localY + wallHeight/2 - height/2
          let rawSill = pointLocal.y + wallTotalHeight / 2 - opHeight / 2;
          // 4. CLAMPING (Límites físicos)
          // Distancia: entre 0 y (LargoMuro - AnchoVentana)
          rawDist = Math.max(0, Math.min(wallLen - opWidth, rawDist));
          // Antepecho: entre 0 y (AltoMuro - AltoVentana)
          rawSill = Math.max(0, Math.min(wallTotalHeight - opHeight, rawSill));
          // 5. RE-APLICAR POSICIÓN (Usando la fórmula corregida)
          const clampedX = -wallLen / 2 + rawDist + opWidth / 2;
          const clampedY = (-wallTotalHeight / 2) + rawSill + (opHeight / 2);
          mesh.position.set(clampedX, clampedY, 0);
        }
      } else if (type === 'installation' || type === 'gas') {
        const wall = wallsRef.current[wallIndex];
        const hits = getIntersects(e, [wall]);
        if (hits.length > 0) {
          const pointLocal = wall.worldToLocal(hits[0].point.clone());
          // Clamping básico para que no se salga del muro
          const wallLen = wall.userData.length;
          const wallHeight = height / 10;
          const halfLen = wallLen / 2;
          const halfHeight = wallHeight / 2;
          // Restringir X e Y dentro del muro
          const clampedX = Math.max(-halfLen, Math.min(halfLen, pointLocal.x));
          const clampedY = Math.max(-halfHeight, Math.min(halfHeight, pointLocal.y));
          mesh.position.x = clampedX;
          mesh.position.y = clampedY;
          // Z se mantiene fijo
        }
      } else if (type === 'appliance') {
        // ... (Lógica existente de appliances con rotación manual) ...
        const wallHits = getIntersects(e, wallsRef.current);
        if (wallHits.length > 0) {
          const hit = wallHits[0];
          const wall = hit.object as THREE.Mesh;
          let baseAngle = wall.rotation.y;
          const pointLocal = wall.worldToLocal(hit.point.clone());
          if (pointLocal.z < 0) baseAngle += Math.PI;
          mesh.rotation.y = baseAngle + manualRotationRef.current;
          // Clamping appliance
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
        if (type === 'opening' && onOpeningUpdate) {
          // --- GUARDAR CAMBIOS DE VANO ---
          // Recuperar datos para convertir a MM
          const wall = wallsRef.current[wallIndex];
          const opWidth = (mesh.geometry as THREE.BoxGeometry).parameters.width;
          const opHeight = (mesh.geometry as THREE.BoxGeometry).parameters.height;
          const wallLen = wall.userData.length;
          const wallTotalHeight = height / 10;
          // Matemática Inversa para obtener valores finales en unidades 3D
          const finalDist3D = mesh.position.x + wallLen / 2 - opWidth / 2;
          const finalSill3D = mesh.position.y + wallTotalHeight / 2 - opHeight / 2;
          // Buscar el objeto original para no perder propiedades (tipo, etc)
          const originalOp = openings.find(o => o.id === id);
          if (originalOp) {
            onOpeningUpdate({
              ...originalOp,
              // Convertir de vuelta a MM (x10) y redondear
              distFromStart: Math.round(finalDist3D * SCALE_FACTOR),
              sillHeight: Math.round(finalSill3D * SCALE_FACTOR)
            });
          }
        } else if (type === 'installation' && onInstallationUpdate) {
          const wall = wallsRef.current[wallIndex];
          const wallLen = wall.userData.length;
          const wallHeight = height / 10;
          // Inversa de la fórmula de posición
          // localX = -wallLen/2 + dist/10  =>  dist = (localX + wallLen/2) * 10
          const distMM = (mesh.position.x + wallLen / 2) * SCALE_FACTOR;
          // localY = (height/10) - wallHeight/2  =>  height = (localY + wallHeight/2) * 10
          const heightMM = (mesh.position.y + wallHeight / 2) * SCALE_FACTOR;
          // Buscar objeto original para preservar metadatos
          const originalInst = installations.find(i => i.id === id);
          if (originalInst) {
            onInstallationUpdate({
              ...originalInst,
              distFromStart: Math.round(distMM),
              heightFromFloor: Math.round(heightMM)
            });
          }
        } else if (type === 'appliance' && onApplianceUpdate) {
          // ... (Igual que antes)
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
      dragRef.current = null;
      controlsRef.current!.enabled = true;
    };

    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [height, onInstallationUpdate, onApplianceUpdate, onOpeningUpdate, appliances, openings, installations, gasConfig]);
  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};
export default Room3DPreviewAmateur;

