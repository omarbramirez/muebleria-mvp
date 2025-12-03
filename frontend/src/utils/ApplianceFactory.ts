import * as THREE from 'three';
import { ApplianceModel } from '@/store/preferenceWizardStore';

// ------------------------------------------------------------------
// 1. MATERIALES DE ALTA FIDELIDAD (PBR)
// ------------------------------------------------------------------
const APPLIANCE_MATS = {
    stainlessSteel: new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        metalness: 0.85,
        roughness: 0.25,
        envMapIntensity: 1.0
    }),
    blackGlass: new THREE.MeshPhysicalMaterial({
        color: 0x050505,
        metalness: 0.1,
        roughness: 0.0,
        transmission: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0
    }),
    darkBody: new THREE.MeshStandardMaterial({
        color: 0x2b2b2b,
        roughness: 0.6,
        metalness: 0.2
    }),
    burnerIron: new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.9,
        metalness: 0.1
    }),
};

// Constantes de diseño (en MM para mantener coherencia con ScaleFactor)
const SPECS = {
    GAP: 3,
    HANDLE_DEPTH: 35,
    BURNER_HEIGHT: 15,
};

// Dimensiones de seguridad en MILÍMETROS
const SAFE_DEFAULTS = {
    fridge: { w: 900, h: 1800, d: 750 },
    stove: { w: 760, h: 900, d: 650 },
    hood: { w: 760, h: 600, d: 500 },
    dishwasher: { w: 600, h: 850, d: 600 },
    default: { w: 600, h: 600, d: 600 }
};

// ------------------------------------------------------------------
// 2. PRIMITIVAS DE CONSTRUCCIÓN
// ------------------------------------------------------------------

const createHandle = (length: number, orientation: 'v' | 'h', scaleFactor: number): THREE.Mesh => {
    const thickness = 20 / scaleFactor; // 20mm visuales
    const depth = SPECS.HANDLE_DEPTH / scaleFactor;

    const w = orientation === 'h' ? length : thickness;
    const h = orientation === 'v' ? length : thickness;

    const geo = new THREE.BoxGeometry(w, h, depth);
    const mesh = new THREE.Mesh(geo, APPLIANCE_MATS.stainlessSteel);
    mesh.castShadow = true;
    return mesh;
};

const createPanel = (w: number, h: number, d: number, mat: THREE.Material): THREE.Mesh => {
    const safeW = Math.max(0.01, w);
    const safeH = Math.max(0.01, h);
    const safeD = Math.max(0.01, d);

    const geo = new THREE.BoxGeometry(safeW, safeH, safeD);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

// ------------------------------------------------------------------
// 3. CONSTRUCTORES ESPECÍFICOS (LOGICA DE NEGOCIO)
// ------------------------------------------------------------------

const buildFridge = (w: number, h: number, d: number, type: string, scaleFactor: number): THREE.Group => {
    const group = new THREE.Group();
    const gap = SPECS.GAP / scaleFactor;
    const bodyDepth = d * 0.85;
    const doorDepth = d * 0.15;

    // Cuerpo
    const body = createPanel(w, h, bodyDepth, APPLIANCE_MATS.darkBody);
    body.position.set(0, 0, -doorDepth / 2);
    group.add(body);

    // Fachada: French Door vs Top Mount
    // NOTA: Usamos includes porque el ID puede ser 'fridge_french_door'
    if (type.includes('french_door')) {
        const drawerH = h * 0.35;
        const topH = h - drawerH - gap;

        // Cajón
        const drawer = createPanel(w, drawerH, doorDepth, APPLIANCE_MATS.stainlessSteel);
        drawer.position.set(0, -h / 2 + drawerH / 2, bodyDepth / 2);
        const hDrawer = createHandle(w * 0.7, 'h', scaleFactor);
        hDrawer.position.set(0, drawerH / 3, doorDepth / 2 + (SPECS.HANDLE_DEPTH / scaleFactor / 2));
        drawer.add(hDrawer);
        group.add(drawer);

        // Puertas Superiores
        const doorW = (w / 2) - (gap / 2);
        const doorY = h / 2 - topH / 2;

        const leftDoor = createPanel(doorW, topH, doorDepth, APPLIANCE_MATS.stainlessSteel);
        leftDoor.position.set(-w / 2 + doorW / 2, doorY, bodyDepth / 2);
        const hLeft = createHandle(topH * 0.6, 'v', scaleFactor);
        hLeft.position.set(doorW / 3, 0, doorDepth / 2 + (SPECS.HANDLE_DEPTH / scaleFactor / 2));
        leftDoor.add(hLeft);
        group.add(leftDoor);

        const rightDoor = createPanel(doorW, topH, doorDepth, APPLIANCE_MATS.stainlessSteel);
        rightDoor.position.set(w / 2 - doorW / 2, doorY, bodyDepth / 2);
        const hRight = createHandle(topH * 0.6, 'v', scaleFactor);
        hRight.position.set(-doorW / 3, 0, doorDepth / 2 + (SPECS.HANDLE_DEPTH / scaleFactor / 2));
        rightDoor.add(hRight);
        group.add(rightDoor);

    } else {
        // Default: Top Mount / Single Door
        const freezerH = h * 0.3;
        const fridgeH = h - freezerH - gap;

        const topDoor = createPanel(w, freezerH, doorDepth, APPLIANCE_MATS.stainlessSteel);
        topDoor.position.set(0, h / 2 - freezerH / 2, bodyDepth / 2);
        const hTop = createHandle(freezerH * 0.5, 'h', scaleFactor);
        hTop.position.set(-w / 3, 0, doorDepth / 2 + (SPECS.HANDLE_DEPTH / scaleFactor / 2));
        topDoor.add(hTop);
        group.add(topDoor);

        const botDoor = createPanel(w, fridgeH, doorDepth, APPLIANCE_MATS.stainlessSteel);
        botDoor.position.set(0, -h / 2 + fridgeH / 2, bodyDepth / 2);
        const hBot = createHandle(fridgeH * 0.5, 'v', scaleFactor);
        hBot.position.set(-w / 3, 0, doorDepth / 2 + (SPECS.HANDLE_DEPTH / scaleFactor / 2));
        botDoor.add(hBot);
        group.add(botDoor);
    }
    return group;
};

const buildStove = (w: number, h: number, d: number, type: string, scaleFactor: number): THREE.Group => {
    const group = new THREE.Group();
    const isCooktop = type.includes('cooktop');

    if (isCooktop) {
        const baseH = 40 / scaleFactor;
        const base = createPanel(w, baseH, d, APPLIANCE_MATS.blackGlass);
        group.add(base);
        addBurners(group, w, d, scaleFactor, baseH / 2);
        return group;
    }

    const doorH = h * 0.60;
    const panelH = h * 0.15;

    // Cuerpo
    const body = createPanel(w, h, d, APPLIANCE_MATS.darkBody);
    group.add(body);

    // Puerta Horno
    const ovenDoor = createPanel(w - (20 / scaleFactor), doorH, 20 / scaleFactor, APPLIANCE_MATS.blackGlass);
    ovenDoor.position.set(0, -h / 2 + doorH / 2 + (80 / scaleFactor), d / 2 + (10 / scaleFactor));
    const handle = createHandle(w * 0.7, 'h', scaleFactor);
    handle.position.set(0, doorH / 2 - (40 / scaleFactor), 20 / scaleFactor);
    ovenDoor.add(handle);
    group.add(ovenDoor);

    // Mandos
    const controls = createPanel(w, panelH, 30 / scaleFactor, APPLIANCE_MATS.stainlessSteel);
    controls.position.set(0, h / 2 - panelH / 2, d / 2 + (15 / scaleFactor));
    group.add(controls);

    addBurners(group, w, d, scaleFactor, h / 2 + (5 / scaleFactor));

    // Copete solo si no es slide-in
    if (!type.includes('slide_in')) {
        const bgH = 120 / scaleFactor;
        const backguard = createPanel(w, bgH, 60 / scaleFactor, APPLIANCE_MATS.stainlessSteel);
        backguard.position.set(0, h / 2 + bgH / 2, -d / 2 + (30 / scaleFactor));
        group.add(backguard);
    }

    return group;
};

const addBurners = (parent: THREE.Group, w: number, d: number, scaleFactor: number, yPos: number) => {
    const positions = [
        { x: -0.25, z: -0.25, s: 1.0 }, { x: 0.25, z: -0.25, s: 0.8 },
        { x: -0.25, z: 0.25, s: 0.8 }, { x: 0.25, z: 0.25, s: 0.6 }
    ];
    positions.forEach(p => {
        const r = (80 * p.s) / scaleFactor;
        const h = SPECS.BURNER_HEIGHT / scaleFactor;
        const burner = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), APPLIANCE_MATS.burnerIron);
        burner.position.set(p.x * w, yPos + h / 2, p.z * d);
        parent.add(burner);
    });
};

const buildHood = (w: number, h: number, d: number, type: string, scaleFactor: number): THREE.Group => {
    const group = new THREE.Group();
    const chimneyW = w * 0.4;
    const chimneyH = h * 0.6;

    // Chimenea
    const chimney = createPanel(chimneyW, chimneyH, d * 0.5, APPLIANCE_MATS.stainlessSteel);
    chimney.position.set(0, h / 2 - chimneyH / 2, -d * 0.1);
    group.add(chimney);

    // Base
    const baseH = h * 0.15;
    const base = createPanel(w, baseH, d, APPLIANCE_MATS.stainlessSteel);
    base.position.set(0, -h / 2 + baseH / 2, 0);
    group.add(base);

    return group;
};

const buildDishwasher = (w: number, h: number, d: number, scaleFactor: number): THREE.Group => {
    const group = new THREE.Group();
    const body = createPanel(w, h, d, APPLIANCE_MATS.stainlessSteel);
    group.add(body);

    const controlH = 120 / scaleFactor;
    const controls = createPanel(w, controlH, 10 / scaleFactor, APPLIANCE_MATS.blackGlass);
    controls.position.set(0, h / 2 - controlH / 2, d / 2 + 5 / scaleFactor);
    group.add(controls);
    return group;
};

// ------------------------------------------------------------------
// 4. FACTORY PRINCIPAL
// ------------------------------------------------------------------

export const createProceduralAppliance = (
    item: ApplianceModel,
    scaleFactor: number = 10
): THREE.Group => {

    // A. NORMALIZACIÓN DE UNIDADES (CORRECCIÓN CRÍTICA DE ESCALA)
    const rawW = item.width ?? 0;
    const rawH = item.height ?? 0;
    const rawD = item.depth ?? 0;

    const isZeroSize = rawW < 1 || rawH < 1 || rawD < 1;
    let safeW_mm: number, safeH_mm: number, safeD_mm: number;

    if (isZeroSize) {
        const typeKey = item.type.includes('fridge') ? 'fridge'
            : item.type.includes('stove') || item.type.includes('cooktop') ? 'stove'
                : item.type.includes('hood') ? 'hood'
                    : item.type.includes('dishwasher') ? 'dishwasher'
                        : 'default';
        const defaults = SAFE_DEFAULTS[typeKey as keyof typeof SAFE_DEFAULTS] || SAFE_DEFAULTS.default;
        safeW_mm = defaults.w; safeH_mm = defaults.h; safeD_mm = defaults.d;
    } else {
        safeW_mm = rawW * 10; safeH_mm = rawH * 10; safeD_mm = rawD * 10;
    }

    // B. ESCALADO (MM -> Unidades 3D)
    const W = safeW_mm / scaleFactor;
    const H = safeH_mm / scaleFactor;
    const D = safeD_mm / scaleFactor;

    // C. GENERACIÓN DE GEOMETRÍA (Pivote por defecto en el centro geométrico)
    let internalGeometry: THREE.Group;

    if (item.type.includes('fridge')) {
        internalGeometry = buildFridge(W, H, D, item.id || item.type, scaleFactor);
    } else if (item.type.includes('stove') || item.type.includes('cooktop')) {
        internalGeometry = buildStove(W, H, D, item.id || item.type, scaleFactor);
    } else if (item.type.includes('hood')) {
        internalGeometry = buildHood(W, H, D, item.id || item.type, scaleFactor);
    } else if (item.type.includes('dishwasher')) {
        internalGeometry = buildDishwasher(W, H, D, scaleFactor);
    } else {
        internalGeometry = new THREE.Group();
        internalGeometry.add(createPanel(W, H, D, APPLIANCE_MATS.stainlessSteel));
    }

    // D. CORRECCIÓN DE PIVOTE (INGENIERÍA VISUAL - "Base Pivot Normalization")
    // Creamos un Wrapper Group que será el verdadero objeto manipulable por el Planner
    const pivotGroup = new THREE.Group();

    // Agregamos la geometría interna al wrapper
    pivotGroup.add(internalGeometry);

    // DESPLAZAMIENTO CRÍTICO:
    // Movemos la geometría interna hacia ARRIBA media altura.
    // Resultado: El origen (0,0,0) del pivotGroup ahora coincide visualmente con la BASE del objeto.
    internalGeometry.position.y = H / 2;

    // E. METADATA (Se aplica al Wrapper, que es lo que el Raycaster tocará)
    pivotGroup.userData = {
        isDynamic: true,
        isAppliance: true,
        id: item.id,
        type: item.type,
        isPlaceholder: isZeroSize
    };

    return pivotGroup;
};