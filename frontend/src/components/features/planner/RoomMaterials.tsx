// Asegúrate de importar esto dentro de tu componente Room3DPreview...
import * as THREE from "three";
import { useMemo } from "react";

// Hook de materiales para instanciación única (Flyweight Pattern implícito por useMemo)
export const useArchitecturalMaterials = () => {
    return useMemo(() => ({
        // --- ARQUITECTURA ---

        // Muros: Pintura vinílica mate (blanca).
        // Roughness alto para dispersar la luz y evitar brillos plásticos.
        wall: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25, // Translucidez para ver a través en modo edición
            side: THREE.DoubleSide,
            roughness: 0.9,
            metalness: 0.0
        }),

        // Muro Seleccionado: Resalte visual.
        // Aumentamos opacidad y damos un tinte azulado sutil para indicar "activo".
        wallSelected: new THREE.MeshStandardMaterial({
            color: 0xe0f2fe, // Azul muy pálido (Sky 50)
            transparent: true,
            opacity: 0.75,
            roughness: 0.8,
            metalness: 0.0,
            side: THREE.DoubleSide,
            emissive: 0x0ea5e9, // Emisión sutil para que destaque incluso en sombra
            emissiveIntensity: 0.1
        }),

        // Suelo: Porcelanato o Concreto pulido gris claro.
        // Roughness medio para un reflejo satinado.
        floor: new THREE.MeshStandardMaterial({
            color: 0xf3f4f6,
            roughness: 0.6,
            metalness: 0.1 // Leve toque metálico simula el esmalte cerámico
        }),

        // Ventanas: Vidrio Arquitectónico.
        // CAMBIO CRÍTICO: De MeshBasic a MeshPhysical para realismo.
        window: new THREE.MeshPhysicalMaterial({
            color: 0xa5f3fc, // Cyan muy claro
            metalness: 0.0,
            roughness: 0.0, // Superficie perfectamente lisa
            transparent: true,
            opacity: 0.3,
            transmission: 0.5, // Propiedad física de transmisión de luz (glass-like)
            depthWrite: false, // Evita conflictos de z-sorting con otros transparentes
            side: THREE.DoubleSide
        }),

        // Puertas (Vano): Indicador visual semitransparente.
        door: new THREE.MeshStandardMaterial({
            color: 0xfca5a5, // Rojo pálido indicador
            transparent: true,
            opacity: 0.2,
            roughness: 0.8,
            depthWrite: false
        }),

        // --- INSTALACIONES (MEP) ---
        // Colores codificados por normativa, materiales plásticos/metálicos.

        // Eléctrico: Tubería Conduit o PVC Amarillo
        elec: new THREE.MeshStandardMaterial({
            color: 0xfacc15, // Yellow 400
            roughness: 0.3, // Plástico brillante
            metalness: 0.0,
            emissive: 0xa16207, // Brillo interno para visibilidad
            emissiveIntensity: 0.2
        }),

        // Hidráulico: PVC Azul o Cobre
        water: new THREE.MeshStandardMaterial({
            color: 0x3b82f6, // Blue 500
            roughness: 0.4,
            metalness: 0.1
        }),

        // Gas: Tubería de Cobre pintada o Galvanizada (Rojo seguridad)
        gas: new THREE.MeshStandardMaterial({
            color: 0xef4444, // Red 500
            roughness: 0.5,
            metalness: 0.3
        }),

        // --- CARPINTERÍA (GABINETES) ---

        // Carcasa (Cuerpo): Melamina Blanca Mate (Interiores)
        cabinetCarcass: new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9, // Mate total
            metalness: 0.0
        }),

        // Puertas/Frentes: Acabado "Laqueado Satinado" o "Laminado Texturizado"
        // Un gris cálido (Gray 200) se ve más realista que el blanco puro #FFFFFF
        cabinetDoor: new THREE.MeshStandardMaterial({
            color: 0xe5e7eb,
            roughness: 0.4, // 0.4 da un acabado satinado elegante (ni espejo, ni tiza)
            metalness: 0.0
        }),

        // Zoclo: Aluminio anodizado o PVC oscuro
        cabinetKickplate: new THREE.MeshStandardMaterial({
            color: 0x374151, // Gray 700
            roughness: 0.7,
            metalness: 0.4 // Simula metal cepillado u opaco
        }),

        // Cubierta: Granito / Cuarzo / Mármol
        // Clave: Bajo roughness para simular pulido de piedra
        cabinetCountertop: new THREE.MeshStandardMaterial({
            color: 0xd1d5db, // Gray 300 (Base neutra)
            roughness: 0.15, // Muy liso, refleja el entorno
            metalness: 0.0,  // La piedra no es metal
            envMapIntensity: 1.2 // Si usas Environment map, esto potencia los reflejos
        }),

        // Herrajes: Acero Inoxidable o Negro Mate
        cabinetHandle: new THREE.MeshStandardMaterial({
            color: 0x1f2937, // Casi negro
            metalness: 0.8, // Es metal
            roughness: 0.3  // Un poco satinado, no cromo espejo perfecto
        }),

        // Shadow Gap: El espacio oscuro entre cajones (Truco visual)
        shadowGap: new THREE.MeshBasicMaterial({
            color: 0x111111 // Negro absoluto, no reacciona a la luz (se ve como hueco)
        })

    }), []);
};