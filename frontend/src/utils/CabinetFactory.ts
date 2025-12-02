import * as THREE from 'three';
import { CabinetModule } from '@/store/preferenceWizardStore';

// Tipos de materiales que nuestra fábrica espera
interface CabinetMaterials {
    carcass: THREE.Material;
    door: THREE.Material;
    kickplate: THREE.Material;
    countertop: THREE.Material;
    handle: THREE.Material;
}

/**
 * FABRICA PROCEDURAL DE GABINETES
 * Construye un objeto complejo (Grupo) a partir de dimensiones simples.
 */
export const createProceduralCabinet = (
    item: CabinetModule,
    materials: CabinetMaterials,
    scaleFactor: number = 10 // 1u = 10mm
): THREE.Group => {
    const group = new THREE.Group();

    // Dimensiones en unidades 3D
    const width = item.width / scaleFactor;
    const height = item.height / scaleFactor;
    const depth = item.depth / scaleFactor;

    // Constantes de diseño (en unidades 3D)
    const DOOR_THICKNESS = 1.8 / scaleFactor; // 18mm estándar
    const KICKPLATE_HEIGHT = 10 / scaleFactor; // 100mm estándar
    const KICKPLATE_RECESS = 5 / scaleFactor; // 50mm de retiro
    const COUNTERTOP_THICKNESS = 2 / scaleFactor; // 20mm
    const COUNTERTOP_OVERHANG = 2 / scaleFactor; // 20mm volado
    const GAP = 0.2 / scaleFactor; // Pequeña separación visual (shadow gap)

    // ------------------------------------------------
    // 1. EL CUERPO (CARCASS)
    // ------------------------------------------------
    // Si es un mueble base, restamos la altura del zoclo
    const hasKickplate = item.type === 'base' || item.type === 'tall';
    const carcassHeight = hasKickplate ? height - KICKPLATE_HEIGHT : height;

    // El cuerpo es un cubo simple por ahora (podríamos hacerlo hueco después)
    const carcassGeo = new THREE.BoxGeometry(width, carcassHeight, depth - DOOR_THICKNESS);
    const carcass = new THREE.Mesh(carcassGeo, materials.carcass);

    // Posición Y: Si tiene zoclo, sube. Si no, centrado en su propia altura.
    const carcassY = hasKickplate
        ? (KICKPLATE_HEIGHT + carcassHeight / 2) - (height / 2) // Ajuste relativo al centro del grupo
        : 0;

    // Posición Z: Retrasado para dejar espacio a la puerta
    carcass.position.set(0, carcassY, -DOOR_THICKNESS / 2);
    group.add(carcass);

    // ------------------------------------------------
    // 2. LA PUERTA (DOOR / FRONT)
    // ------------------------------------------------
    // La puerta cubre el cuerpo, pero deja gaps minimos
    const doorHeight = carcassHeight - GAP;
    const doorWidth = width - GAP;

    const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, DOOR_THICKNESS);
    const door = new THREE.Mesh(doorGeo, materials.door);

    // La puerta va al frente del carcass
    const doorZ = (depth - DOOR_THICKNESS) / 2;
    door.position.set(0, carcassY, doorZ);

    // Meta-data para interactividad (importante para raycasting)
    door.userData = { parentId: item.id, isDoor: true };
    group.add(door);

    // ------------------------------------------------
    // 3. LA MANIJA (HANDLE) - Geometría simple
    // ------------------------------------------------
    const handleGeo = new THREE.BoxGeometry(width * 0.3, 0.5 / scaleFactor, 1.5 / scaleFactor); // Manija tipo perfil
    const handle = new THREE.Mesh(handleGeo, materials.handle);

    // Posición: Arriba si es base, Abajo si es aéreo (wall)
    const handleYOffset = item.type === 'wall'
        ? -doorHeight / 2 + (5 / scaleFactor)
        : doorHeight / 2 - (5 / scaleFactor);

    handle.position.set(0, carcassY + handleYOffset, doorZ + DOOR_THICKNESS);
    group.add(handle);

    // ------------------------------------------------
    // 4. EL ZOCLO (KICKPLATE) - Solo Base/Tall
    // ------------------------------------------------
    if (hasKickplate) {
        const kickGeo = new THREE.BoxGeometry(width, KICKPLATE_HEIGHT, depth - KICKPLATE_RECESS);
        const kickplate = new THREE.Mesh(kickGeo, materials.kickplate);

        // Posición: Hasta abajo y retrasado
        const kickY = -height / 2 + KICKPLATE_HEIGHT / 2;
        const kickZ = -(KICKPLATE_RECESS / 2);

        kickplate.position.set(0, kickY, kickZ);
        group.add(kickplate);
    }

    // ------------------------------------------------
    // 5. LA CUBIERTA (COUNTERTOP) - Solo Base
    // ------------------------------------------------
    if (item.type === 'base') {
        const ctDepth = depth + COUNTERTOP_OVERHANG;
        const ctGeo = new THREE.BoxGeometry(width, COUNTERTOP_THICKNESS, ctDepth);
        const countertop = new THREE.Mesh(ctGeo, materials.countertop);

        // Posición: Encima del mueble
        const ctY = height / 2 + COUNTERTOP_THICKNESS / 2;
        // Centrado en Z considerando el volado
        const ctZ = (COUNTERTOP_OVERHANG - DOOR_THICKNESS) / 2;

        countertop.position.set(0, ctY, ctZ);
        group.add(countertop);
    }

    // PROPIEDADES DEL GRUPO
    // Transferimos los datos necesarios para que el Raycaster del componente padre funcione
    group.userData = {
        isDynamic: true,
        isFurniture: true,
        id: item.id,
        wallIndex: item.wallIndex
    };

    return group;
};