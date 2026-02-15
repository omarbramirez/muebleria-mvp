import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  ENGINEERING_CONSTANTS, 
  COLORS, 
  ASSET_PATHS 
} from '../config/constants';

// Importamos las fábricas (Factories) que ya tenías
// Asumimos que estas funciones devuelven un THREE.Group o THREE.Mesh
import { createProceduralCabinet } from '@/utils/CabinetFactory';
import { createProceduralAppliance } from '@/utils/ApplianceFactory';
import { 
  WallOpening, 
  ApplianceModel, 
  InstallationPoint, 
  GasConfig, 
  CabinetModule 
} from '@/store/preferenceWizardStore';

// Definimos la estructura exacta de los datos que este hook necesita
export interface SceneBuilderData {
  points: { x: number; y: number }[]; // Coordenadas de vértices 2D
  height: number;                     // Altura en mm
  openings: WallOpening[];
  appliances: ApplianceModel[];
  installations: InstallationPoint[];
  gasConfig?: GasConfig;
  layoutItems: CabinetModule[];
  activeWallIndex: number | null;     // Cuál muro está seleccionado
  viewMode: 'PERSPECTIVE' | 'BLUEPRINT';
}

/**
 * useSceneBuilder
 * * Responsabilidad: Traducir Datos (JSON) -> Objetos 3D (Meshes).
 * * Patrón: Reconstrucción Reactiva (Reactivo a cambios en `data`).
 */
export const useSceneBuilder = (
  scene: THREE.Scene | undefined,
  data: SceneBuilderData
) => {
  // 1. REFERENCIAS PERSISTENTES
  // `roomGroup` es el contenedor padre de todo. Lo creamos una sola vez.
  const roomGroup = useRef(new THREE.Group());
  
  // `wallsRef` nos permite acceder a los muros rápidamente para colisiones
  // sin tener que buscarlos en el árbol de la escena.
  const wallsRef = useRef<THREE.Mesh[]>([]);

  // 2. INGENIERÍA DE MATERIALES (Memoized)
  // Creamos los materiales una sola vez para no saturar la memoria.
  // Usamos MeshStandardMaterial para que reaccionen a la luz (PBR).
  const materials = useMemo(() => {
    const matWall = new THREE.MeshStandardMaterial({
      color: COLORS.WALL.DEFAULT,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide, // Renderiza ambas caras del muro
      transparent: true,      // Necesario para el modo fantasma
      opacity: 0.1            // Base casi invisible
    });

    const matWallSelected = new THREE.MeshStandardMaterial({
      color: COLORS.WALL.SELECTED,
      roughness: 0.8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });

    // Material técnico sólido para modo plano (Blueprint)
    const matWallTechnical = new THREE.MeshStandardMaterial({
      color: COLORS.WALL.TECHNICAL,
      roughness: 1.0,
      side: THREE.DoubleSide
    });

    // Materiales de Gabinetes (Base para la fábrica)
    const matCabinetBody = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
    const matCabinetDoor = new THREE.MeshStandardMaterial({ color: 0xffffff }); 
    const matCabinetWorktop = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 });

    return {
      wall: matWall,
      wallSelected: matWallSelected,
      wallTechnical: matWallTechnical,
      window: new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.3 }),
      door: new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.3 }),
      installations: {
        elec: new THREE.MeshStandardMaterial({ color: COLORS.UTILITIES.ELEC }),
        water: new THREE.MeshStandardMaterial({ color: COLORS.UTILITIES.WATER }),
        gas: new THREE.MeshStandardMaterial({ color: COLORS.UTILITIES.GAS }),
      },
      cabinet: {
        body: matCabinetBody,
        door: matCabinetDoor,
        worktop: matCabinetWorktop
      }
    };
  }, []);

  // 3. CARGA DE TEXTURAS (Efecto Secundario)
  // Inyectamos texturas en los materiales existentes de forma asíncrona.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(ASSET_PATHS.TEXTURES.WOOD_OAK || '/textures/wood_oak.jpg', (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // Actualizamos el material sin recrearlo
      materials.cabinet.door.map = tex;
      materials.cabinet.door.needsUpdate = true;
    });
  }, [materials]);

  // 4. EL CONSTRUCTOR MAESTRO (Main Build Loop)
  useEffect(() => {
    if (!scene) return;

    // A. SETUP INICIAL
    // Si el grupo no está en la escena, lo agregamos.
    if (!scene.children.includes(roomGroup.current)) {
      scene.add(roomGroup.current);
    }

    // B. FASE DE LIMPIEZA (CLEANUP) - CRÍTICO
    // Antes de dibujar nada, borramos lo anterior para evitar duplicados.
    const group = roomGroup.current;
    
    // Iteramos al revés es más seguro al borrar arrays
    for (let i = group.children.length - 1; i >= 0; i--) {
      const child = group.children[i];
      group.remove(child);

      // Gestión de Memoria: Liberar recursos GPU
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose();
        // No disponemos materiales porque son compartidos (useMemo)
      } else if (child instanceof THREE.Group) {
        // Si es un grupo (mueble), recorrer sus hijos y limpiar
        child.traverse((c) => {
          if (c instanceof THREE.Mesh) {
            if (c.geometry) c.geometry.dispose();
          }
        });
      }
    }
    wallsRef.current = []; // Resetear array de referencias

    // C. CÁLCULO DE CENTRO (Para centrar la habitación en la escena)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    data.points.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minZ) minZ = p.y; if (p.y > maxZ) maxZ = p.y;
    });
    // Movemos el grupo entero para que el centro visual sea (0,0,0)
    group.position.set(-(minX + maxX) / 2, 0, -(minZ + maxZ) / 2);


    // D. CONSTANTES DE CONSTRUCCIÓN
    const wallThickness = ENGINEERING_CONSTANTS.WALL_THICKNESS;
    const height3D = data.height / ENGINEERING_CONSTANTS.SCALE_FACTOR;
    const scale = ENGINEERING_CONSTANTS.SCALE_FACTOR;

    // --- CONSTRUCCIÓN DE MUROS ---
    data.points.forEach((p, i) => {
      // 1. Matemáticas Vectoriales
      const nextP = data.points[(i + 1) % data.points.length]; // Conectar último con primero
      const dx = nextP.x - p.x;
      const dy = nextP.y - p.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // 2. Selección de Material
      const isSelected = i === data.activeWallIndex;
      let activeMat = isSelected ? materials.wallSelected : materials.wall;
      
      // Override para Modo Plano (Blueprint)
      if (data.viewMode === 'BLUEPRINT') {
        activeMat = isSelected ? materials.wallSelected : materials.wallTechnical;
      }

      // 3. Creación del Mesh
      const geometry = new THREE.BoxGeometry(length, height3D, wallThickness);
      const wall = new THREE.Mesh(geometry, activeMat);

      // 4. Posicionamiento (Punto medio + rotación)
      // En 2D (x,y) -> En 3D (x, z). Y es altura.
      wall.position.set(p.x + dx / 2, height3D / 2, p.y + dy / 2);
      wall.rotation.y = -angle; // Three.js rota antihorario en Y

      // 5. Metadata (Vital para el Raycaster)
      wall.userData = { 
        isWall: true, 
        index: i, 
        length: length,
        normalAngle: angle 
      };

      // 6. Agregar hijos al muro (Openings, Instalaciones)
      // Importante: Al agregar hijos al muro, sus coordenadas son LOCALES al muro.
      // (0,0,0) del hijo es el centro del muro.
      
      // -- VANOS (Ventanas/Puertas) --
      data.openings.filter(op => op.wallIndex === i).forEach(op => {
        const opDepth = wallThickness + 2; // Un poco más grueso para que se vea
        const opMesh = new THREE.Mesh(
          new THREE.BoxGeometry(op.width / scale, op.height / scale, opDepth),
          op.type === 'window' ? materials.window : materials.door
        );
        
        // Coordenadas Locales:
        // X: Distancia desde el inicio - mitad del muro (porque el origen es el centro)
        const localX = -length / 2 + (op.distFromStart / scale) + (op.width / scale / 2);
        const localY = -height3D / 2 + (op.sillHeight / scale) + (op.height / scale / 2);
        
        opMesh.position.set(localX, localY, 0);
        opMesh.userData = { isOpening: true, id: op.id, wallIndex: i };
        wall.add(opMesh);
      });

      // -- INSTALACIONES --
      data.installations.filter(inst => inst.wallIndex === i).forEach(inst => {
        const mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(3, 3, 2, 16).rotateX(Math.PI/2),
          inst.type === 'electrical' ? materials.installations.elec : materials.installations.water
        );
        const localX = -length / 2 + (inst.distFromStart / scale);
        const localY = -height3D / 2 + (inst.heightFromFloor / scale);
        
        mesh.position.set(localX, localY, wallThickness / 2 + 1); // Pegado a la cara frontal
        mesh.userData = { isInstallation: true, id: inst.id, wallIndex: i };
        wall.add(mesh);
      });

      // -- GAS --
      if (data.gasConfig && data.gasConfig.wallIndex === i) {
         const gasMesh = new THREE.Mesh(
            new THREE.BoxGeometry(5, 5, 5),
            materials.installations.gas
         );
         // Lógica similar de posicionamiento...
         const localX = -length / 2 + (data.gasConfig.x / scale);
         const localY = -height3D / 2 + (data.gasConfig.z / scale);
         gasMesh.position.set(localX, localY, wallThickness/2 + 2);
         gasMesh.userData = { isGas: true, wallIndex: i };
         wall.add(gasMesh);
      }
      
      // Agregamos el muro completo a la habitación y al array de referencia
      group.add(wall);
      wallsRef.current.push(wall);
    });

    // --- CONSTRUCCIÓN DE MUEBLES (Items de Layout) ---
    // Los muebles pueden estar pegados a un muro (Hijos del muro) o libres.
    data.layoutItems.forEach(item => {
      // Usamos la Factory externa para generar la geometría compleja
      const cabinetGroup = createProceduralCabinet(item, {
         carcass: materials.cabinet.body,
         door: materials.cabinet.door,
         countertop: materials.cabinet.worktop,
         // ... otros materiales
         kickplate: new THREE.MeshStandardMaterial({color: 0x111111}),
         handle: new THREE.MeshStandardMaterial({color: 0xcccccc, metalness: 1})
      }, scale);

      // Metadata para interacción
      // Marcamos TODOS los hijos para que el raycaster detecte cualquier parte del mueble
      cabinetGroup.traverse((c) => {
        c.userData.parentId = item.id; // ID lógico para el store
        c.userData.isFurniture = true; 
        c.userData.wallIndex = item.wallIndex;
      });
      // Marcamos el grupo raíz también
      cabinetGroup.userData = { isFurniture: true, id: item.id, wallIndex: item.wallIndex };

      const targetWall = wallsRef.current[item.wallIndex];
      
      if (targetWall && item.wallIndex >= 0) {
        // CASO A: PEGADO A MURO (Coordenadas Locales)
        const wallLen = targetWall.userData.length;
        const itemW = item.width / scale;
        const itemH = item.height / scale;
        
        const localX = -wallLen / 2 + (item.distFromStart / scale) + (itemW / 2);
        const localY = -height3D / 2 + (item.elevation / scale) + (itemH / 2);
        // Z: Grosor muro / 2 + Profundidad mueble / 2
        const localZ = (wallThickness / 2) + (item.depth / scale / 2);

        cabinetGroup.position.set(localX, localY, localZ);
        // Si el mueble tiene rotación interna (ej: mueble de esquina)
        if (item.rotation) cabinetGroup.rotation.y = item.rotation;

        targetWall.add(cabinetGroup);
      } else {
        // CASO B: ISLA / LIBRE (Coordenadas Globales relativas al RoomGroup)
        cabinetGroup.position.set(
            item.distFromStart / scale, 
            (item.elevation / scale) + (item.height / scale / 2), // Ajuste de pivote si es necesario
            item.elevation / scale // Esto depende de cómo guardes las coordenadas de isla
        );
        // ... lógica para islas
        group.add(cabinetGroup);
      }
    });

    // --- CONSTRUCCIÓN DE ELECTRODOMÉSTICOS (Appliances) ---
    data.appliances.forEach(app => {
      const appGroup = createProceduralAppliance(app, scale);
      
      // Metadata
      appGroup.userData = { isAppliance: true, id: app.id };
      appGroup.traverse(c => { c.userData.isAppliance = true; c.userData.id = app.id; });

      // Posicionamiento Global (Las appliances suelen tener pos absoluta X,Z)
      // Ajustamos Y=0 porque el pivote suele estar en la base
      appGroup.position.set(app.position.x, 0, app.position.z);
      appGroup.rotation.y = app.rotation;

      group.add(appGroup);
    });

  }, [scene, data, materials]); // Se re-ejecuta si cambia Data o Materiales

  // 5. RETORNO DE REFERENCIAS
  // Devolvemos el grupo principal y los muros para que el hook de Interacción
  // pueda calcular colisiones contra ellos.
  return { roomGroup, wallsRef, materials };
};