import { WallOpening, CabinetModule } from "@/store/preferenceWizardStore";

/**
 * Representa un rectángulo en el espacio 2D de un muro.
 * Usado para cálculos AABB (Axis-Aligned Bounding Box).
 */
interface BoundingBox {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

const getModuleBox = (item: CabinetModule): BoundingBox => ({
    minX: item.distFromStart,
    maxX: item.distFromStart + item.width,
    minY: item.elevation,
    maxY: item.elevation + item.height,
});

const getOpeningBox = (op: WallOpening, scaleFactor = 10): BoundingBox => {
    // Convertimos las unidades del Opening (que suelen venir normalizadas o en cm) a mm si es necesario.
    // Asumiendo que en el store 'distFromStart' de opening viene en mm:
    return {
        minX: op.distFromStart, // Asumiendo mm
        maxX: op.distFromStart + (op.width * scaleFactor), // Si width viene en cm o unidades 3D
        minY: op.sillHeight * scaleFactor,
        maxY: (op.sillHeight + op.height) * scaleFactor
    };
};

/**
 * Detecta si dos cajas colisionan.
 */
const checkCollision = (a: BoundingBox, b: BoundingBox): boolean => {
    return (
        a.minX < b.maxX &&
        a.maxX > b.minX &&
        a.minY < b.maxY &&
        a.maxY > b.minY
    );
};

/**
 * Validación Principal: Verifica si un mueble es válido en su posición actual.
 */
export const validatePlacement = (
    newItem: CabinetModule,
    existingItems: CabinetModule[],
    openings: WallOpening[],
    wallLength: number
): { valid: boolean; reason?: string } => {

    const newBox = getModuleBox(newItem);

    // 1. REGLA: Límites del Muro
    if (newBox.minX < 0 || newBox.maxX > wallLength) {
        return { valid: false, reason: "El mueble excede la longitud del muro." };
    }

    // 2. REGLA: Colisión con otros muebles
    for (const item of existingItems) {
        if (item.id === newItem.id) continue; // No chocar consigo mismo
        if (item.wallIndex !== newItem.wallIndex) continue; // Solo validar mismo muro

        if (checkCollision(newBox, getModuleBox(item))) {
            return { valid: false, reason: `Colisión con mueble: ${item.name}` };
        }
    }

    // 3. REGLA: Obstrucción de Vanos (Ventanas/Puertas)
    // Aquí aplicamos lógica de diseño interior:
    // - Los muebles BAJOS (Base) pueden ir debajo de ventanas si el antepecho lo permite.
    // - Los muebles ALTOS (Wall/Tall) NO pueden ir frente a ventanas.
    // - NADA puede bloquear una puerta.

    // NOTA: Asumimos una conversión de escala. Ajustar SCALE_FACTOR según tus datos reales.
    const SCALE_FACTOR = 1; // Si tus openings ya vienen en mm en el store. Si vienen en cm, usa 10.

    for (const op of openings) {
        if (op.wallIndex !== newItem.wallIndex) continue;

        const opBox = {
            minX: op.distFromStart, // Asegúrate que esto esté en mm en tu store
            maxX: op.distFromStart + op.width, // Asegúrate que esto esté en mm
            minY: op.sillHeight,
            maxY: op.sillHeight + op.height
        };

        if (checkCollision(newBox, opBox)) {
            // Análisis detallado de la colisión
            if (op.type === 'door') {
                return { valid: false, reason: "Obstruye una puerta." };
            }

            if (op.type === 'window') {
                // Regla: Mueble base permitido si es más bajo que la ventana
                if (newItem.type === 'base' && newItem.height < op.sillHeight) {
                    continue; // Permitido (pasa por debajo)
                }
                return { valid: false, reason: "Conflicto con ventana (altura insuficiente o mueble alto)." };
            }
        }
    }

    return { valid: true };
};