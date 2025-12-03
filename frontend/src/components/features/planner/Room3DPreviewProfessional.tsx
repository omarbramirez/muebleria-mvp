'use client';

import * as THREE from "three";
import React, { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
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
const OPENING_DEPTH = WALL_THICKNESS + 4;
const SCALE_FACTOR = 10; // 1 unidad 3D = 10 mm
const DIMENSION_COLOR = 0x3b82f6; // Azul técnico para líneas guía

const Room3DPreviewExpert: React.FC<Room3DPreviewProps> = ({
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
  // 1. CONEXIÓN AL STORE
  const { activeWallIndex, setActiveWall } = usePreferenceWizardStore();

  // 2. REFERENCIAS DEL MOTOR GRÁFICO
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(new THREE.Scene());
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null); // Nuevo Renderer para UI
  const controlsRef = useRef<OrbitControls | null>(null);

  // Cache de objetos
  const wallsRef = useRef<THREE.Mesh[]>([]);
  const roomGroupRef = useRef<THREE.Group>(new THREE.Group());
  const measurementsGroupRef = useRef<THREE.Group>(new THREE.Group()); // Grupo dedicado a cotas
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Definición de tipos
  type DraggableItemType = 'installation' | 'appliance' | 'opening' | 'gas' | 'furniture';

  const dragRef = useRef<{
    id: string;
    wallIndex: number;
    mesh: THREE.Object3D;
    type: DraggableItemType;
  } | null>(null);

  const manualRotationRef = useRef<number>(0);

  // 3. MATERIALES
  const materials = useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false, roughness: 1, metalness: 0 }),
    wallSelected: new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.8, metalness: 0, side: THREE.DoubleSide }),
    floor: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.8 }),
    window: new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.4, depthWrite: false }),
    door: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3, depthWrite: false }),
    elec: new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xccaa00, emissiveIntensity: 0.2 }),
    water: new THREE.MeshStandardMaterial({ color: 0x3b82f6 }),
    gas: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.3 }),
    cabinetCarcass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
    cabinetDoor: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.9 }),
    cabinetKickplate: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 }),
    cabinetCountertop: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.1 }),
    cabinetHandle: new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.2 }),
    // Material para líneas de cotas
    // dimensionLine: new THREE.LineBasicMaterial({ color: DIMENSION_COLOR, transparent: true, opacity: 0.6, dashSize: 2, gapSize: 1 })
  }), []);

  // --- HELPER: GENERADOR DE COTAS DINÁMICAS ---
  // Esta función es el núcleo de la nueva característica de ingeniería de interfaz.
  const updateMeasurements = (target: THREE.Object3D, wall: THREE.Mesh | null) => {
    const mGroup = measurementsGroupRef.current;

    // 1. Limpieza eficiente: Eliminar hijos previos (líneas y etiquetas)
    // Nota: CSS2DObjects son elementos DOM, necesitan ser removidos explícitamente si se gestionan manualmente,
    // pero al limpiar el grupo y renderizar, Three.js maneja la desconexión básica.
    while (mGroup.children.length > 0) {
      const child = mGroup.children[0];
      mGroup.remove(child);
    }

    if (!target) return;

    // 2. Obtener Geometría y Bounding Box en Coordenadas Locales (si es muro) o Globales
    const bbox = new THREE.Box3().setFromObject(target);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // Helpers para crear etiquetas HTML
    const createLabel = (text: string) => {
      const div = document.createElement('div');
      div.className = 'px-2 py-0.5 bg-blue-600 text-white text-xs font-mono rounded shadow-md pointer-events-none select-none border border-blue-400';
      div.textContent = text;
      const label = new CSS2DObject(div);
      return label;
    };

    // A. COTAS DE DIMENSIÓN DEL OBJETO (Siempre visibles al arrastrar)
    // Etiqueta de Ancho (Arriba del objeto)
    const widthLabel = createLabel(`${Math.round(size.x * SCALE_FACTOR)} mm`);
    widthLabel.position.copy(center).add(new THREE.Vector3(0, size.y / 2 + 2, 0)); // Flotando arriba
    mGroup.add(widthLabel);

    // B. COTAS RELATIVAS AL MURO (Solo si estamos sobre un muro)
    if (wall) {
      // Convertimos el centro del objeto al espacio local del muro para medir distancias
      const localPoint = wall.worldToLocal(center.clone());
      const wallGeom = wall.geometry as THREE.BoxGeometry; // Aserción segura
      const wallWidth = wallGeom.parameters.width;
      const wallHeight = height / 10; // Altura del muro en unidades 3D

      // Cálculos de ingeniería (Distancias a bordes)
      const distLeft = (wallWidth / 2) + localPoint.x - (size.x / 2);
      const distRight = (wallWidth / 2) - localPoint.x - (size.x / 2);
      const distFloor = (wallHeight / 2) + localPoint.y - (size.y / 2);

      // --- VISUALIZACIÓN DE LÍNEAS GUÍA ---
      // Usamos puntos relativos al mundo para dibujar las líneas
      const points: THREE.Vector3[] = [];

      // Línea al Suelo (Elevación)
      // Origen: Base del objeto, Destino: Suelo proyectado
      if (distFloor > 0.1) {
        const bottomObj = center.clone().sub(new THREE.Vector3(0, size.y / 2, 0));
        // Proyectamos hacia abajo en el eje Y del muro (que puede estar rotado)
        const downDir = new THREE.Vector3(0, -1, 0).applyQuaternion(wall.quaternion);
        const floorPoint = bottomObj.clone().add(downDir.multiplyScalar(distFloor));

        // Geometría de línea
        const lineGeo = new THREE.BufferGeometry().setFromPoints([bottomObj, floorPoint]);
        // const line = new THREE.Line(lineGeo, materials.dimensionLine);
        // mGroup.add(line);

        // Etiqueta Elevación
        const elevLabel = createLabel(`Elev: ${Math.round(distFloor * SCALE_FACTOR)}`);
        elevLabel.position.copy(bottomObj).lerp(floorPoint, 0.5);
        mGroup.add(elevLabel);
      }

      // Líneas Laterales (Izquierda/Derecha en el plano del muro)
      // Para simplificar visualmente, dibujamos líneas desde el centro del objeto proyectado al muro hacia los lados

      // Convertimos extremos del muro a World Coordinates
      const leftWallEdgeLocal = new THREE.Vector3(-wallWidth / 2, localPoint.y, localPoint.z);
      const rightWallEdgeLocal = new THREE.Vector3(wallWidth / 2, localPoint.y, localPoint.z);

      const leftWallEdgeWorld = leftWallEdgeLocal.applyMatrix4(wall.matrixWorld);
      const rightWallEdgeWorld = rightWallEdgeLocal.applyMatrix4(wall.matrixWorld);

      // Puntos laterales del objeto
      const leftObjEdgeWorld = new THREE.Vector3(localPoint.x - size.x / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);
      const rightObjEdgeWorld = new THREE.Vector3(localPoint.x + size.x / 2, localPoint.y, localPoint.z).applyMatrix4(wall.matrixWorld);

      // Línea Izquierda
      if (distLeft > 1) {
        const lGeo = new THREE.BufferGeometry().setFromPoints([leftObjEdgeWorld, leftWallEdgeWorld]);
        // mGroup.add(new THREE.Line(lGeo, materials.dimensionLine));

        const lLabel = createLabel(`${Math.round(distLeft * SCALE_FACTOR)}`);
        lLabel.position.copy(leftObjEdgeWorld).lerp(leftWallEdgeWorld, 0.5);
        mGroup.add(lLabel);
      }

      // Línea Derecha
      if (distRight > 1) {
        const rGeo = new THREE.BufferGeometry().setFromPoints([rightObjEdgeWorld, rightWallEdgeWorld]);
        // mGroup.add(new THREE.Line(rGeo, materials.dimensionLine));

        const rLabel = createLabel(`${Math.round(distRight * SCALE_FACTOR)}`);
        rLabel.position.copy(rightObjEdgeWorld).lerp(rightWallEdgeWorld, 0.5);
        mGroup.add(rLabel);
      }
    }
  };

  // --- FUNCIÓN PARA LIMPIAR COTAS ---
  const clearMeasurements = () => {
    const mGroup = measurementsGroupRef.current;
    while (mGroup.children.length > 0) {
      mGroup.remove(mGroup.children[0]);
    }
  };

  // 4. INICIALIZACIÓN DEL MOTOR GRÁFICO
  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return;

    const { clientWidth: w, clientHeight: h } = mountNode;

    // A. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // B. CSS2D Renderer (Capa de UI sobre el Canvas 3D)
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0px';
    labelRenderer.domElement.style.pointerEvents = 'none'; // CRÍTICO: Permitir clicks a través del texto
    mountNode.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, 5000);
    camera.position.set(0, 800, 800);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    sceneRef.current.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(500, 1000, 500);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 5000;
    dirLight.shadow.mapSize.height = 5000;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 5000;
    sceneRef.current.add(dirLight);

    const grid = new THREE.GridHelper(2000, 40, 0xdddddd, 0xf0f0f0);
    sceneRef.current.add(grid);
    sceneRef.current.add(roomGroupRef.current);

    // Agregar grupo de mediciones a la escena
    sceneRef.current.add(measurementsGroupRef.current);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(sceneRef.current, camera);
      labelRenderer.render(sceneRef.current, camera); // Renderizar capa de texto
    };
    animate();

    return () => {
      renderer.dispose();
      if (mountNode) {
        if (renderer.domElement) mountNode.removeChild(renderer.domElement);
        if (labelRenderer.domElement) mountNode.removeChild(labelRenderer.domElement);
      }
    };
  }, []);

  // 5. RENDERIZADO REACTIVO DE LA ESCENA
  useEffect(() => {
    const roomGroup = roomGroupRef.current;

    while (roomGroup.children.length > 0) {
      roomGroup.remove(roomGroup.children[0]);
    }
    wallsRef.current = [];

    const heightUnits = height / 10;

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

    // E. MOBILIARIO
    layoutItems.forEach(item => {
      const wall = wallsRef.current[item.wallIndex];
      if (!wall) return;

      const cabinetGroup = createProceduralCabinet(item, {
        carcass: materials.cabinetCarcass,
        door: materials.cabinetDoor,
        kickplate: materials.cabinetKickplate,
        countertop: materials.cabinetCountertop,
        handle: materials.cabinetHandle
      }, SCALE_FACTOR);

      const wallLen = wall.userData.length;
      const itemWidth3D = item.width / SCALE_FACTOR;
      const itemHeight3D = item.height / SCALE_FACTOR;

      const localX = -wallLen / 2 + (item.distFromStart / SCALE_FACTOR) + (itemWidth3D / 2);
      const localY = (-heightUnits / 2) + (item.elevation / SCALE_FACTOR) + (itemHeight3D / 2);
      const zOffset = (WALL_THICKNESS / 2) + (item.depth / SCALE_FACTOR / 2);

      cabinetGroup.position.set(localX, localY, zOffset);
      if (item.rotation) cabinetGroup.rotation.y = item.rotation;

      wall.add(cabinetGroup);
    });

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

    const getIntersects = (e: MouseEvent, objects: THREE.Object3D[], recursive: boolean = false) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current!);
      return raycaster.current.intersectObjects(objects, recursive);
    };

    const handleDown = (e: MouseEvent) => {
      const interactables: THREE.Object3D[] = [];

      roomGroupRef.current.children.forEach(c => {
        if (c.userData.isAppliance) interactables.push(c);
      });

      wallsRef.current.forEach(w => w.children.forEach(c => {
        if (c.userData.isInstallation || c.userData.isOpening || c.userData.isGas || c.userData.isFurniture) {
          interactables.push(c);
        }
      }));

      const hits = getIntersects(e, interactables, true);

      if (hits.length > 0) {
        controlsRef.current!.enabled = false;

        let targetObj = hits[0].object;

        if (!targetObj.userData.isFurniture && targetObj.parent?.userData.isFurniture) {
          targetObj = targetObj.parent;
        }

        const userData = targetObj.userData;

        let type: DraggableItemType = 'appliance';
        if (userData.isInstallation) type = 'installation';
        else if (userData.isOpening) type = 'opening';
        else if (userData.isGas) type = 'gas';
        else if (userData.isFurniture) type = 'furniture';

        dragRef.current = {
          id: userData.id || 'gas-singleton',
          wallIndex: userData.wallIndex ?? -1,
          mesh: targetObj,
          type: type
        };

        if (type !== 'appliance') setActiveWall(userData.wallIndex);
        manualRotationRef.current = 0;

        // ** UI FEEDBACK: Iniciar cotas al agarrar objeto **
        const currentWall = userData.wallIndex >= 0 ? wallsRef.current[userData.wallIndex] : null;
        updateMeasurements(targetObj, currentWall);

        return;
      }

      const wallHits = getIntersects(e, wallsRef.current, false);
      if (wallHits.length > 0) setActiveWall(wallHits[0].object.userData.index);
      else setActiveWall(null);
    };

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { mesh, type, wallIndex } = dragRef.current;

      // 1. Mover Objeto (Lógica Física)
      if (type === 'gas' || type === 'installation' || type === 'furniture') {
        const wallHits = getIntersects(e, wallsRef.current, false);

        if (wallHits.length > 0) {
          const hitWall = wallHits[0].object as THREE.Mesh;
          const newWallIndex = hitWall.userData.index;

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

          // ** UI UPDATE: Actualizar Cotas en tiempo real **
          updateMeasurements(mesh, hitWall);
        }
      }
      else if (type === 'opening') {
        const wall = wallsRef.current[wallIndex];
        const hits = getIntersects(e, [wall], false);
        if (hits.length > 0) {
          const pointLocal = wall.worldToLocal(hits[0].point.clone());

          const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
          const w = geom.parameters.width;
          const h = geom.parameters.height;

          const wallLen = wall.userData.length;
          const wallH = height / 10;
          const dist = Math.max(0, Math.min(wallLen - w, pointLocal.x + wallLen / 2 - w / 2));
          const sill = Math.max(0, Math.min(wallH - h, pointLocal.y + wallH / 2 - h / 2));
          mesh.position.set(-wallLen / 2 + dist + w / 2, -wallH / 2 + sill + h / 2, 0);

          // ** UI UPDATE **
          updateMeasurements(mesh, wall);
        }
      } else if (type === 'appliance') {
        const hits = getIntersects(e, wallsRef.current, false);

        if (hits.length > 0) {
          const wall = hits[0].object as THREE.Mesh;
          const pt = wall.worldToLocal(hits[0].point.clone());

          const ang = wall.rotation.y + (pt.z < 0 ? Math.PI : 0);
          mesh.rotation.y = ang + manualRotationRef.current;

          const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
          const w = geom.parameters.width;
          const d = geom.parameters.depth;
          const h = geom.parameters.height;

          const wallGeom = (wall.geometry as THREE.BoxGeometry);
          const wallLen = wallGeom.parameters.width;

          const minX = -wallLen / 2 + w / 2;
          const maxX = wallLen / 2 - w / 2;
          const cx = minX > maxX ? 0 : Math.max(minX, Math.min(maxX, pt.x));
          const cz = pt.z > 0 ? (WALL_THICKNESS / 2 + d / 2) : -(WALL_THICKNESS / 2 + d / 2);

          const worldPos = new THREE.Vector3(cx, -height / 20 + h / 2, cz).applyMatrix4(wall.matrixWorld);
          mesh.position.copy(roomGroupRef.current.worldToLocal(worldPos));
          dragRef.current.wallIndex = wall.userData.index;

          // ** UI UPDATE (Muro) **
          updateMeasurements(mesh, wall);

        } else {
          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const target = new THREE.Vector3();
          raycaster.current.ray.intersectPlane(floorPlane, target);

          if (target) {
            const localPos = roomGroupRef.current.worldToLocal(target.clone());
            const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
            const h = geom.parameters.height;
            mesh.position.set(localPos.x, h / 2, localPos.z);
            dragRef.current.wallIndex = -1;

            // ** UI UPDATE (Sin Muro - Cotas libres) **
            updateMeasurements(mesh, null);
          }
        }
      }
    };

    const handleUp = () => {
      // ** CLEANUP UI: Limpiar cotas al soltar **
      clearMeasurements();

      if (!dragRef.current) return;
      const { mesh, id, type, wallIndex } = dragRef.current;

      const targetWall = (wallIndex >= 0 && wallsRef.current[wallIndex])
        ? wallsRef.current[wallIndex]
        : null;

      const wallLen = targetWall ? targetWall.userData.length : 0;
      const wallH = height / 10;

      if (type === 'furniture' && onLayoutUpdate) {
        const bbox = new THREE.Box3().setFromObject(mesh);
        const w = bbox.max.x - bbox.min.x;
        const h = bbox.max.y - bbox.min.y;

        const item = layoutItems.find(i => i.id === id);
        if (item) {
          if (targetWall) {
            onLayoutUpdate({
              ...item,
              distFromStart: Math.round((mesh.position.x + wallLen / 2 - w / 2) * SCALE_FACTOR),
              elevation: Math.round((mesh.position.y + wallH / 2 - h / 2) * SCALE_FACTOR),
              wallIndex: wallIndex,
              rotation: 0
            });
          } else {
            onLayoutUpdate({
              ...item,
              distFromStart: Math.round(mesh.position.x * SCALE_FACTOR),
              elevation: Math.round(mesh.position.z * SCALE_FACTOR),
              wallIndex: -1,
              rotation: mesh.rotation.y
            });
          }
        }
      }

      else if (type === 'gas' && onGasUpdate && gasConfig) {
        if (targetWall) {
          onGasUpdate({
            ...gasConfig,
            x: Math.round((mesh.position.x + wallLen / 2) * SCALE_FACTOR),
            z: Math.round((mesh.position.y + wallH / 2) * SCALE_FACTOR),
            wallIndex: wallIndex
          });
        } else {
          onGasUpdate({
            ...gasConfig,
            x: Math.round(mesh.position.x * SCALE_FACTOR),
            z: Math.round(mesh.position.z * SCALE_FACTOR),
            wallIndex: -1
          });
        }
      }

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
            onInstallationUpdate({
              ...inst,
              distFromStart: Math.round(mesh.position.x * SCALE_FACTOR),
              heightFromFloor: Math.round(mesh.position.z * SCALE_FACTOR),
              wallIndex: -1
            });
          }
        }
      }

      else if (type === 'opening' && onOpeningUpdate && targetWall) {
        const geom = (mesh as THREE.Mesh).geometry as THREE.BoxGeometry;
        const w = geom.parameters.width;
        const h = geom.parameters.height;

        const originalOp = openings.find(o => o.id === id);
        if (originalOp) {
          onOpeningUpdate({
            ...originalOp,
            distFromStart: Math.round((mesh.position.x + wallLen / 2 - w / 2) * SCALE_FACTOR),
            sillHeight: Math.round((mesh.position.y + wallH / 2 - h / 2) * SCALE_FACTOR),
            wallIndex: wallIndex
          });
        }
      }

      else if (type === 'appliance' && onApplianceUpdate) {
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
  }, [height, onInstallationUpdate, onApplianceUpdate, onOpeningUpdate, onGasUpdate, onLayoutUpdate, appliances, openings, installations, gasConfig, layoutItems, materials, setActiveWall]);

  return <div ref={mountRef} className="w-full h-full cursor-move" />;
};

export default Room3DPreviewExpert;