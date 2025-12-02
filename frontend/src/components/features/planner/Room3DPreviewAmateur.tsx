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

// IMPORTACIÓN DE LA FÁBRICA DE GABINETES
import { createProceduralCabinet } from "@/utils/CabinetFactory";

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

  // Cache de objetos para interacción
  const wallsRef = useRef<THREE.Mesh[]>([]);
  const roomGroupRef = useRef<THREE.Group>(new THREE.Group());
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Definición de tipos para el Drag & Drop
  type DraggableItemType = 'installation' | 'appliance' | 'opening' | 'gas' | 'furniture';

  // El ref ahora soporta Object3D genérico (para manejar Grupos de muebles y Meshes simples)
  const dragRef = useRef<{
    id: string;
    wallIndex: number;
    mesh: THREE.Object3D;
    type: DraggableItemType;
  } | null>(null);

  const manualRotationRef = useRef<number>(0);

  // 3. OPTIMIZACIÓN: MATERIALES (Flyweight Pattern)
  const materials = useMemo(() => ({
    // Arquitectura Base
    wall: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false, roughness: 1, metalness: 0 }),
    wallSelected: new THREE.MeshStandardMaterial({ color: 0x00aaff, transparent: true, opacity: 0.75, roughness: 0.8, metalness: 0, side: THREE.DoubleSide }),
    floor: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8 }),
    window: new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, depthWrite: false }),
    door: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3, depthWrite: false }),

    // MEP (Instalaciones)
    elec: new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xccaa00, emissiveIntensity: 0.2 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3b82f6 }),
    gas: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.3 }),

    // CABINETRY (Nuevos materiales base para la fábrica procedural)
    // Estos placeholders se conectarán después al módulo de selección de materiales
    cabinetCarcass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }), // Melamina blanca
    cabinetDoor: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.4 }),     // Gris claro mate
    cabinetKickplate: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }), // Zoclo oscuro
    cabinetCountertop: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.1 }), // Imitación piedra
    cabinetHandle: new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 }),    // Negro mate
  }), []);

  // 4. INICIALIZACIÓN DEL MOTOR GRÁFICO
  useEffect(() => {
    if (!mountRef.current) return;
    const { clientWidth: w, clientHeight: h } = mountRef.current;

    // Renderer con sombras suaves
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 5000);
    camera.position.set(0, 800, 800);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    sceneRef.current.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(500, 1000, 500);
    dirLight.castShadow = true;
    // Ajustar mapa de sombras para mayor nitidez
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
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

    // Limpieza agresiva
    while (roomGroup.children.length > 0) {
      roomGroup.remove(roomGroup.children[0]);
    }
    wallsRef.current = [];

    const heightUnits = height / 10;

    // Centrado automático
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    if (points.length > 0) {
      points.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minZ) minZ = p.y; if (p.y > maxZ) maxZ = p.y;
      });
      roomGroup.position.set(-(minX + maxX) / 2, 0, -(minZ + maxZ) / 2);
    }

    // A. MUROS
    points.forEach((p, i) => {
      const next = points[(i + 1) % points.length];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(len, heightUnits, WALL_THICKNESS),
        materials.wall.clone()
      );

      wall.position.set(p.x + dx / 2, heightUnits / 2, p.y + dy / 2);
      wall.rotation.y = -angle;
      wall.userData = { isDynamic: true, isWall: true, index: i, length: len };

      roomGroup.add(wall);
      wallsRef.current.push(wall);
    });

    // B. VANOS
    openings.forEach(op => {
      const wall = wallsRef.current[op.wallIndex];
      if (!wall) return;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(op.width / SCALE_FACTOR, op.height / SCALE_FACTOR, OPENING_DEPTH),
        op.type === 'window' ? materials.window : materials.door
      );
      const localX = -wall.userData.length / 2 + (op.distFromStart / SCALE_FACTOR) + (op.width / SCALE_FACTOR / 2);
      const localY = (-heightUnits / 2) + (op.sillHeight / SCALE_FACTOR) + (op.height / SCALE_FACTOR / 2);
      mesh.position.set(localX, localY, 0);
      mesh.userData = { isDynamic: true, isOpening: true, id: op.id, wallIndex: op.wallIndex };
      wall.add(mesh);
    });

    // C. INSTALACIONES
    installations.forEach(inst => {
      const wall = wallsRef.current[inst.wallIndex];
      if (!wall) return;
      const geo = inst.type === 'electrical'
        ? new THREE.BoxGeometry(6, 10, 2)
        : new THREE.CylinderGeometry(3, 3, 5, 16).rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, inst.type === 'electrical' ? materials.elec : materials.water);
      const localX = -wall.userData.length / 2 + (inst.distFromStart / SCALE_FACTOR);
      const localY = (inst.heightFromFloor / SCALE_FACTOR) - (heightUnits / 2);
      mesh.position.set(localX, localY, WALL_THICKNESS / 2 + 2);
      mesh.userData = { isDynamic: true, isInstallation: true, id: inst.id, wallIndex: inst.wallIndex };
      wall.add(mesh);
    });

    // D. GAS
    if (gasConfig && gasConfig.required && wallsRef.current[gasConfig.wallIndex]) {
      const wall = wallsRef.current[gasConfig.wallIndex];
      const geo = new THREE.CylinderGeometry(1.5, 1.5, 5, 16).rotateX(Math.PI / 2);
      const mesh = new THREE.Mesh(geo, materials.gas);
      const localX = -wall.userData.length / 2 + (gasConfig.x / SCALE_FACTOR);
      const localY = (gasConfig.z / SCALE_FACTOR) - (heightUnits / 2);
      mesh.position.set(localX, localY, WALL_THICKNESS / 2 + 2.5);
      mesh.userData = { isDynamic: true, isGas: true, wallIndex: gasConfig.wallIndex };
      wall.add(mesh);
    }

    // E. MOBILIARIO (INTEGRACIÓN PROCEDURAL - FACTORY CALL)
    // -------------------------------------------------------------
    layoutItems.forEach(item => {
      const wall = wallsRef.current[item.wallIndex];
      if (!wall) return;

      // 1. Invocamos la Fábrica en lugar de crear un cubo simple
      const cabinetGroup = createProceduralCabinet(item, {
        carcass: materials.cabinetCarcass,
        door: materials.cabinetDoor,
        kickplate: materials.cabinetKickplate,
        countertop: materials.cabinetCountertop,
        handle: materials.cabinetHandle
      }, SCALE_FACTOR);

      // 2. Cálculo de Posición del GRUPO
      const wallLen = wall.userData.length;
      const itemWidth3D = item.width / SCALE_FACTOR;
      const itemHeight3D = item.height / SCALE_FACTOR;

      const localX = -wallLen / 2 + (item.distFromStart / SCALE_FACTOR) + (itemWidth3D / 2);
      const localY = (-heightUnits / 2) + (item.elevation / SCALE_FACTOR) + (itemHeight3D / 2);
      const zOffset = (WALL_THICKNESS / 2) + (item.depth / SCALE_FACTOR / 2);

      // 3. Aplicar transformaciones al Grupo
      cabinetGroup.position.set(localX, localY, zOffset);
      if (item.rotation) cabinetGroup.rotation.y = item.rotation;

      wall.add(cabinetGroup);
    });
    // -------------------------------------------------------------

    // F. APPLIANCES
    appliances.forEach(app => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(app.width, app.height, app.depth), new THREE.MeshStandardMaterial({ color: app.color }));
      mesh.position.set(app.position.x, app.height / 2, app.position.z);
      mesh.rotation.y = app.rotation;
      mesh.userData = { isDynamic: true, isAppliance: true, id: app.id };
      roomGroup.add(mesh);
    });

    if (activeWallIndex !== null && wallsRef.current[activeWallIndex]) {
      wallsRef.current.forEach(w => (w.material as THREE.MeshStandardMaterial).copy(materials.wall));
      (wallsRef.current[activeWallIndex].material as THREE.MeshStandardMaterial).copy(materials.wallSelected);
    }

  }, [points, height, openings, appliances, installations, gasConfig, layoutItems, activeWallIndex, materials]);


  // 6. LÓGICA DE INTERACCIÓN (RAYCASTING JERÁRQUICO)
  useEffect(() => {
    const canvas = rendererRef.current?.domElement;
    if (!canvas) return;

    // Helper: Activar 'recursive' permite detectar hijos dentro de grupos
    const getIntersects = (e: MouseEvent, objects: THREE.Object3D[], recursive: boolean = false) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      return raycaster.current.intersectObjects(objects, recursive);
    };

    const handleDown = (e: MouseEvent) => {
      const interactables: THREE.Object3D[] = [];

      // Appliances (Nivel Raíz)
      roomGroupRef.current.children.forEach(c => {
        if (c.userData.isAppliance) interactables.push(c);
      });

      // Elementos anclados a muros (Instalaciones, Gas, Muebles)
      wallsRef.current.forEach(w => w.children.forEach(c => {
        // Si es un mueble (Grupo), el userData está en el grupo.
        // Si es instalación, está en el Mesh.
        if (c.userData.isInstallation || c.userData.isOpening || c.userData.isGas || c.userData.isFurniture) {
          interactables.push(c);
        }
      }));

      // --- CAMBIO CLAVE: RECURSIVIDAD ACTIVADA ---
      const hits = getIntersects(e, interactables, true);

      if (hits.length > 0) {
        controlsRef.current!.enabled = false;

        // --- TRAVERSAL LOGIC (Subir al padre si golpeamos un hijo) ---
        let targetObj = hits[0].object;

        // Si golpeamos una puerta o manija (que no tienen el userData principal),
        // subimos al padre (el Grupo del mueble) que sí lo tiene.
        if (!targetObj.userData.isFurniture && targetObj.parent?.userData.isFurniture) {
          targetObj = targetObj.parent;
        }

        const userData = targetObj.userData;

        let type: DraggableItemType = 'appliance';
        if (userData.isInstallation) type = 'installation';
        else if (userData.isOpening) type = 'opening';
        else if (userData.isGas) type = 'gas';
        else if (userData.isFurniture) type = 'furniture';

        // Guardamos la referencia al OBJETO COMPLETO (Mesh o Grupo)
        dragRef.current = {
          id: userData.id || 'gas-singleton',
          wallIndex: userData.wallIndex ?? -1,
          mesh: targetObj, // Aquí guardamos el Grupo si es un mueble
          type: type
        };

        if (type !== 'appliance') setActiveWall(userData.wallIndex);
        manualRotationRef.current = 0;
        return;
      }

      // Selección de Muro
      const wallHits = getIntersects(e, wallsRef.current, false);
      if (wallHits.length > 0) setActiveWall(wallHits[0].object.userData.index);
      else setActiveWall(null);
    };

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { mesh, type, wallIndex } = dragRef.current;

      // Wall Hopping Logic
      if (type === 'gas' || type === 'installation' || type === 'furniture') {
        const wallHits = getIntersects(e, wallsRef.current, false);

        if (wallHits.length > 0) {
          const hitWall = wallHits[0].object as THREE.Mesh;
          const newWallIndex = hitWall.userData.index;

          // Salto de Muro
          if (newWallIndex !== wallIndex) {
            mesh.removeFromParent();
            hitWall.add(mesh);
            dragRef.current.wallIndex = newWallIndex;
            mesh.userData.wallIndex = newWallIndex;
            setActiveWall(newWallIndex);
          }

          const wallLen = hitWall.userData.length;
          const wallHeight = height / 10;
          const pointLocal = hitWall.worldToLocal(wallHits[0].point.clone());

          let minX, maxX, minY, maxY;

          if (type === 'furniture') {
            // Para Grupos, calculamos el Bounding Box exacto
            const bbox = new THREE.Box3().setFromObject(mesh);
            const w = bbox.max.x - bbox.min.x;
            const h = bbox.max.y - bbox.min.y;

            const limitX = (wallLen / 2) - (w / 2);
            minX = -Math.max(0, limitX); maxX = Math.max(0, limitX);
            const limitY = (wallHeight / 2) - (h / 2);
            minY = -Math.max(0, limitY); maxY = Math.max(0, limitY);
          } else {
            const halfLen = wallLen / 2;
            const halfHeight = wallHeight / 2;
            minX = -halfLen; maxX = halfLen;
            minY = -halfHeight; maxY = halfHeight;
          }

          mesh.position.x = Math.max(minX, Math.min(maxX, pointLocal.x));
          mesh.position.y = Math.max(minY, Math.min(maxY, pointLocal.y));
        }
      }
      else if (type === 'opening') {
        // Lógica existente para ventanas
        const wall = wallsRef.current[wallIndex];
        const hits = getIntersects(e, [wall], false);
        if (hits.length > 0) {
          const pointLocal = wall.worldToLocal(hits[0].point.clone());
          const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
          const w = geom.parameters.width;
          const h = geom.parameters.height;
          const wallLen = wall.userData.length;
          const wallH = height / 10;
          let dist = Math.max(0, Math.min(wallLen - w, pointLocal.x + wallLen / 2 - w / 2));
          let sill = Math.max(0, Math.min(wallH - h, pointLocal.y + wallH / 2 - h / 2));
          mesh.position.set(-wallLen / 2 + dist + w / 2, -wallH / 2 + sill + h / 2, 0);
        }
      }   // === CORRECCIÓN CRÍTICA PARA APPLIANCES ===
      else if (type === 'appliance') {
        // 1. Intentamos intersectar con MUROS (Comportamiento Pegajoso)
        const hits = getIntersects(e, wallsRef.current, false);

        if (hits.length > 0) {
          // --- CASO A: PEGARSE A LA PARED ---
          const wall = hits[0].object as THREE.Mesh;
          const pt = wall.worldToLocal(hits[0].point.clone());

          // Rotación automática según la cara del muro
          let ang = wall.rotation.y + (pt.z < 0 ? Math.PI : 0);
          mesh.rotation.y = ang + manualRotationRef.current;

          // Corrección de Tipado: Aserción explícita
          const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
          const w = geom.parameters.width;
          const d = geom.parameters.depth;
          const h = geom.parameters.height;

          // Clamping dentro del muro
          const wallGeom = (wall.geometry as THREE.BoxGeometry);
          const wallLen = wallGeom.parameters.width;

          const minX = -wallLen / 2 + w / 2;
          const maxX = wallLen / 2 - w / 2;

          // Si el objeto es más ancho que el muro, lo centramos
          const cx = minX > maxX ? 0 : Math.max(minX, Math.min(maxX, pt.x));

          // Offset de profundidad para que quede "besando" la pared
          const cz = pt.z > 0 ? (WALL_THICKNESS / 2 + d / 2) : -(WALL_THICKNESS / 2 + d / 2);

          // Convertir de Local Muro -> World -> Local RoomGroup
          // Nota: Usamos -height/20 en Y porque el centro del muro está elevado
          const worldPos = new THREE.Vector3(cx, -height / 20 + h / 2, cz).applyMatrix4(wall.matrixWorld);
          mesh.position.copy(roomGroupRef.current.worldToLocal(worldPos));

          // Guardamos referencia de que está pegado a este muro
          dragRef.current.wallIndex = wall.userData.index;
        }
        else {
          // --- CASO B: MOVIMIENTO LIBRE (ISLAS) ---
          // Si el rayo no toca pared, intersectamos con un plano matemático en el suelo (Y=0)

          // Creamos un plano virtual horizontal normalizado hacia arriba (0,1,0)
          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const target = new THREE.Vector3();

          // Usamos el rayo actual del raycaster (ya configurado por getIntersects)
          raycaster.current.ray.intersectPlane(floorPlane, target);

          if (target) {
            // Convertimos la posición mundial del plano a coordenadas locales del grupo
            const localPos = roomGroupRef.current.worldToLocal(target.clone());

            // Corrección de Tipado
            const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
            const h = geom.parameters.height;

            // Asignamos posición libre (X, Z) manteniendo la altura correcta (Y)
            // Y = h/2 asume que el pivote está en el centro del cubo y queremos que se apoye en el suelo (Y=0)
            mesh.position.set(localPos.x, h / 2, localPos.z);

            // Opcional: Podrías resetear la rotación o mantener la última manual
            // mesh.rotation.y = manualRotationRef.current;

            // Marcamos como "desvinculado" (-1) para indicar que no pertenece a ningún muro
            dragRef.current.wallIndex = -1;
          }
        }
      }
    };

    const handleUp = () => {
      // 1. Validación temprana: Si no hay arrastre, no hacemos nada.
      if (!dragRef.current) return;

      const { mesh, id, type, wallIndex } = dragRef.current;

      // 2. Determinamos si el objeto aterrizó en un Muro o en el Suelo
      // Si wallIndex es válido y existe el muro en el ref, estamos en modo "Muro".
      const targetWall = (wallIndex >= 0 && wallsRef.current[wallIndex])
        ? wallsRef.current[wallIndex]
        : null;

      // Variables auxiliares para dimensiones del muro (solo si existe)
      const wallLen = targetWall ? targetWall.userData.length : 0;
      const wallH = height / 10;

      // --- A. LÓGICA PARA MOBILIARIO (FURNITURE) ---
      if (type === 'furniture' && onLayoutUpdate) {
        // Calculamos BoundingBox para obtener dimensiones reales del Grupo/Mesh
        const bbox = new THREE.Box3().setFromObject(mesh);
        const w = bbox.max.x - bbox.min.x;
        const h = bbox.max.y - bbox.min.y;

        const item = layoutItems.find(i => i.id === id);

        if (item) {
          if (targetWall) {
            // CASO 1: ATERRIZAJE EN MURO (Coordenadas Locales)
            // Mapeamos la posición 3D (centro) a la lógica de "distancia desde el inicio del muro"
            onLayoutUpdate({
              ...item,
              distFromStart: Math.round((mesh.position.x + wallLen / 2 - w / 2) * SCALE_FACTOR),
              elevation: Math.round((mesh.position.y + wallH / 2 - h / 2) * SCALE_FACTOR),
              wallIndex: wallIndex,
              rotation: 0 // Reseteamos rotación al pegarse al muro (normalmente)
            });
          } else {
            // CASO 2: ATERRIZAJE EN SUELO (Coordenadas Globales / Isla)
            // Aquí el objeto es hijo del roomGroup directamente o se trata conceptualmente como libre.
            // NOTA DE ARQUITECTURA: Tu tipo 'CabinetModule' debe soportar coordenadas X/Z absolutas.
            // Si 'distFromStart' es tu única forma de guardar X, úsala, pero idealmente deberías tener 'position'.

            // Asumimos que si wallIndex es -1, el backend/store interpreta distFromStart/elevation 
            // o propiedades adicionales como coordenadas cartesianas.

            // Para este ejemplo, enviamos las coordenadas mundiales transformadas.
            onLayoutUpdate({
              ...item,
              // Opción A: Si tu store soporta x/z explícitos para islas
              // x: Math.round(mesh.position.x * SCALE_FACTOR),
              // z: Math.round(mesh.position.z * SCALE_FACTOR),

              // Opción B: Reutilizar campos existentes (hack común si no quieres migrar la DB aún)
              // Usamos distFromStart como X global y elevation como Z global (profundidad en planta)
              distFromStart: Math.round(mesh.position.x * SCALE_FACTOR),
              elevation: Math.round(mesh.position.z * SCALE_FACTOR),

              wallIndex: -1, // Bandera de "Isla" o "Libre"
              rotation: mesh.rotation.y // Preservamos la rotación manual
            });
          }
        }
      }

      // --- B. LÓGICA PARA GAS ---
      else if (type === 'gas' && onGasUpdate && gasConfig) {
        if (targetWall) {
          // Gas en Muro
          onGasUpdate({
            ...gasConfig,
            x: Math.round((mesh.position.x + wallLen / 2) * SCALE_FACTOR),
            z: Math.round((mesh.position.y + wallH / 2) * SCALE_FACTOR),
            wallIndex: wallIndex
          });
        } else {
          // Gas en Isla (Suelo)
          onGasUpdate({
            ...gasConfig,
            x: Math.round(mesh.position.x * SCALE_FACTOR),
            z: Math.round(mesh.position.z * SCALE_FACTOR), // En suelo, Z es la profundidad
            wallIndex: -1
          });
        }
      }

      // --- C. LÓGICA PARA INSTALACIONES ---
      else if (type === 'installation' && onInstallationUpdate) {
        const inst = installations.find(i => i.id === id);
        if (inst) {
          if (targetWall) {
            onInstallationUpdate({
              ...inst,
              distFromStart: Math.round((mesh.position.x + wallLen / 2) * SCALE_FACTOR),
              heightFromFloor: Math.round((mesh.position.y + wallH / 2) * SCALE_FACTOR),
              wallIndex: wallIndex
            });
          } else {
            // Instalación en suelo (ej. toma de piso)
            onInstallationUpdate({
              ...inst,
              distFromStart: Math.round(mesh.position.x * SCALE_FACTOR), // X Global
              heightFromFloor: Math.round(mesh.position.z * SCALE_FACTOR), // Z Global
              wallIndex: -1
            });
          }
        }
      }

      // --- D. LÓGICA PARA VANOS (Siempre requieren muro) ---
      else if (type === 'opening' && onOpeningUpdate && targetWall) {
        // Aserción de tipo segura
        const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
        const w = geom.parameters.width;
        const h = geom.parameters.height;

        const originalOp = openings.find(o => o.id === id);
        if (originalOp) {
          onOpeningUpdate({
            ...originalOp,
            distFromStart: Math.round((mesh.position.x + wallLen / 2 - w / 2) * SCALE_FACTOR),
            sillHeight: Math.round((mesh.position.y + wallH / 2 - h / 2) * SCALE_FACTOR),
            // Nota: Si wallIndex cambió (moviste ventana de un muro a otro), aquí se actualiza
            wallIndex: wallIndex
          });
        }
      }

      // --- E. LÓGICA PARA ELECTRODOMÉSTICOS (APPLIANCES) ---
      else if (type === 'appliance' && onApplianceUpdate) {
        // Los appliances ya tienen una estructura de datos (position: {x,y,z}) que soporta
        // coordenadas globales nativamente, así que es más directo.
        const originalApp = appliances.find(a => a.id === id);
        if (originalApp) {
          onApplianceUpdate({
            ...originalApp,
            position: {
              x: mesh.position.x,
              y: mesh.position.y,
              z: mesh.position.z
            },
            rotation: mesh.rotation.y
          });
        }
      }

      // Limpieza final
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
  }, [height, onInstallationUpdate, onApplianceUpdate, onOpeningUpdate, onGasUpdate, onLayoutUpdate, appliances, openings, installations, gasConfig, layoutItems, materials]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

export default Room3DPreviewAmateur;