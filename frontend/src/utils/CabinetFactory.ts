import * as THREE from 'three';
import { CabinetModule } from '@/store/preferenceWizardStore';

// Tipos de materiales que nuestra fábrica espera
// Usamos THREE.Material para permitir tanto MeshStandardMaterial como MeshBasicMaterial
interface CabinetMaterials {
    carcass: THREE.Material;
    door: THREE.Material;
    kickplate: THREE.Material;
    countertop: THREE.Material;
    handle: THREE.Material;
}

/**
 * FABRICA PROCEDURAL DE GABINETES
 * Construye un Grafo de Escena (Scene Graph) compuesto por geometrías primitivas.
 * * @param item - Datos del modelo de negocio (dimensiones, tipo, id).
 * @param materials - Referencias a materiales compartidos (Flyweight Pattern).
 * @param scaleFactor - Conversión de unidades (ej. mm a unidades Three.js).
 * @returns THREE.Group - Objeto 3D listo para añadir a la escena.
 */
export const createProceduralCabinet = (
    item: CabinetModule,
    materials: CabinetMaterials,
    scaleFactor: number = 10
): THREE.Group => {
    const group = new THREE.Group();

    // --- 1. NORMALIZACIÓN DE DIMENSIONES ---
    // Validamos que las dimensiones sean positivas para evitar crash de Three.js
    const width = Math.max(0.1, item.width / scaleFactor);
    const height = Math.max(0.1, item.height / scaleFactor);
    const depth = Math.max(0.1, item.depth / scaleFactor);

    // --- 2. CONSTANTES DE INGENIERÍA ---
    const DOOR_THICKNESS = 1.8 / scaleFactor; // 18mm estándar
    const KICKPLATE_HEIGHT = 10 / scaleFactor; // 100mm estándar
    const KICKPLATE_RECESS = 5 / scaleFactor; // 50mm de retiro
    const COUNTERTOP_THICKNESS = 2 / scaleFactor; // 20mm
    const COUNTERTOP_OVERHANG = 2 / scaleFactor; // 20mm volado
    const GAP = 0.2 / scaleFactor; // Shadow gap para realismo visual

    // Determinamos si el mueble lleva zoclo (base y torres lo llevan, aéreos no)
    const hasKickplate = item.type === 'base' || item.type === 'tall';

    // Altura útil del cuerpo (Carcass)
    const carcassHeight = hasKickplate ? height - KICKPLATE_HEIGHT : height;

    // --- 3. CONSTRUCCIÓN DE COMPONENTES ---

    // A. EL CUERPO (CARCASS)
    const carcassGeo = new THREE.BoxGeometry(width, carcassHeight, depth - DOOR_THICKNESS);
    const carcass = new THREE.Mesh(carcassGeo, materials.carcass);

    // Cálculo de posición Y:
    // Three.js centra las geometrías en (0,0,0).
    // Si hay zoclo, el cuerpo debe subir.
    // La fórmula compensa el pivote central del grupo vs el pivote central de la geometría.
    const carcassY = hasKickplate
        ? (KICKPLATE_HEIGHT + carcassHeight / 2) - (height / 2)
        : 0;

    // Cálculo de posición Z:
    // Empujamos el cuerpo hacia atrás para dejar espacio exacto a la puerta al frente
    carcass.position.set(0, carcassY, -DOOR_THICKNESS / 2);

    // Habilitamos sombras
    carcass.castShadow = true;
    carcass.receiveShadow = true;
    group.add(carcass);

    // B. LA PUERTA (FRONT)
    const doorHeight = carcassHeight - GAP;
    const doorWidth = width - GAP;
    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, DOOR_THICKNESS);
    const door = new THREE.Mesh(doorGeo, materials.door);

    const doorZ = (depth - DOOR_THICKNESS) / 2;
    door.position.set(0, carcassY, doorZ);
    door.castShadow = true;
    door.receiveShadow = true;

    // Metadata crítica para interacción: permite saber a qué mueble pertenece esta puerta
    door.userData = { parentId: item.id, isDoor: true };
    group.add(door);

    // C. LA MANIJA (HANDLE)
    const handleGeo = new THREE.BoxGeometry(width * 0.3, 0.5 / scaleFactor, 1.5 / scaleFactor);
    const handle = new THREE.Mesh(handleGeo, materials.handle);

    const handleYOffset = item.type === 'wall'
        ? -doorHeight / 2 + (5 / scaleFactor) // Aéreos: manija abajo
        : doorHeight / 2 - (5 / scaleFactor); // Base: manija arriba

    handle.position.set(0, carcassY + handleYOffset, doorZ + DOOR_THICKNESS);
    handle.castShadow = true;
    group.add(handle);

    // D. EL ZOCLO (KICKPLATE)
    if (hasKickplate) {
        const kickGeo = new THREE.BoxGeometry(width, KICKPLATE_HEIGHT, depth - KICKPLATE_RECESS);
        const kickplate = new THREE.Mesh(kickGeo, materials.kickplate);

        const kickY = -height / 2 + KICKPLATE_HEIGHT / 2;
        const kickZ = -(KICKPLATE_RECESS / 2); // Recetido hacia atrás

        kickplate.position.set(0, kickY, kickZ);
        kickplate.receiveShadow = true;
        group.add(kickplate);
    }

    // E. LA CUBIERTA (COUNTERTOP)
    if (item.type === 'base') {
        const ctDepth = depth + COUNTERTOP_OVERHANG;
        const ctGeo = new THREE.BoxGeometry(width, COUNTERTOP_THICKNESS, ctDepth);
        const countertop = new THREE.Mesh(ctGeo, materials.countertop);

        const ctY = height / 2 + COUNTERTOP_THICKNESS / 2;
        // El volado es frontal, así que el centro se desplaza ligeramente en Z
        const ctZ = (COUNTERTOP_OVERHANG - DOOR_THICKNESS) / 2;

        countertop.position.set(0, ctY, ctZ);
        countertop.castShadow = true;
        countertop.receiveShadow = true;
        group.add(countertop);
    }

    // --- 4. METADATA DEL GRUPO ---
    // Esta es la "API" que consume tu Raycaster en Room3DPreview
    group.userData = {
        isDynamic: true,
        isFurniture: true, // Tag principal para identificar muebles
        id: item.id,       // Link al estado global (Zustand)
        wallIndex: item.wallIndex
    };

    return group;
};