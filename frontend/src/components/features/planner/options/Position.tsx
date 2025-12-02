import React, { useState, useEffect } from 'react';
import {
    Move3D,
    Plus,
    LayoutGrid,
    Trash2,
    Box,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    RotateCw,
    Layers,
    AlertTriangle
} from "lucide-react";

// Importamos el hook Y EL TIPO para el casting estricto
import { usePreferenceWizardStore, CabinetModule, WizardStoreValue, WallOpening } from "@/store/preferenceWizardStore";
import { validatePlacement } from "@/utils/designRules";

// --- CATÁLOGO ---
const CATALOG = [
    { id: 'base_60', name: 'Módulo Base 60cm', type: 'base', w: 600, h: 900, d: 600, icon: <Layers className="w-5 h-5" /> },
    { id: 'drawer_60', name: 'Cajonera 3 Niveles', type: 'base', w: 600, h: 900, d: 600, icon: <Box className="w-5 h-5" /> },
    { id: 'tall_pantry', name: 'Torre Alacena', type: 'tall', w: 600, h: 2100, d: 600, icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'wall_60', name: 'Alacena Aérea', type: 'wall', w: 600, h: 700, d: 350, icon: <Box className="w-5 h-5" /> },
] as const;

interface Point { x: number; y: number }

// Tipo para el estado local de la lista
interface PlacedItem {
    uid: string;
    catalogId: string;
    name: string;
    position: { x: number, y: number, z: number };
    rotation: number;
}

const Position = () => {
    const { values, setValue, activeWallIndex } = usePreferenceWizardStore();

    // HYDRATION SEGURA
    const items = (values.layout_items as unknown as CabinetModule[]) || [];
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Datos del entorno para validaciones
    const openings = (values.room_openings as unknown as WallOpening[]) || [];
    const points = (values.room_points as unknown as Point[]) || [];

    // Helper: Obtener longitud del muro actual
    const getCurrentWallLength = (): number => {
        if (activeWallIndex === null || points.length === 0) return 3000; // Default fallback
        const p1 = points[activeWallIndex];
        const p2 = points[(activeWallIndex + 1) % points.length];
        // Distancia Euclidiana en mm (Asumiendo que points.x viene en unidades 3D, convertir a mm: * 10)
        // OJO: Depende de cómo guardaste 'points'. Si están en 3D units:
        const dx = (p2.x - p1.x) * 10;
        const dy = (p2.y - p1.y) * 10;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Sincronización con Store
    const updateStoreItems = (newItems: CabinetModule[]) => {
        setValue('layout_items', newItems as unknown as WizardStoreValue);
    };

    // HANDLERS
    const addItem = (catalogItem: typeof CATALOG[number]) => {
        if (activeWallIndex === null) {
            setErrorMsg("Selecciona un muro en el visor 3D para agregar muebles.");
            return;
        }

        const wallLength = getCurrentWallLength();

        // Lógica de "Smart Placement": Buscar el primer hueco disponible o poner al final
        // Simplificado: Poner a la derecha del último mueble en este muro
        const itemsOnWall = items.filter(i => i.wallIndex === activeWallIndex);
        const lastItem = itemsOnWall.sort((a, b) => (a.distFromStart + a.width) - (b.distFromStart + b.width)).pop();

        let startX = 100; // Margen inicial
        if (lastItem) {
            startX = lastItem.distFromStart + lastItem.width + 10; // 10mm de holgura
        }

        const elevation = catalogItem.type === 'wall' ? 1450 : 0; // Altura estándar para aéreos

        const newItem: CabinetModule = {
            id: `${catalogItem.id}_${Date.now()}`,
            catalogId: catalogItem.id,
            type: catalogItem.type as 'base' | 'wall' | 'tall',
            name: catalogItem.name,
            wallIndex: activeWallIndex,
            distFromStart: startX,
            elevation: elevation,
            width: catalogItem.w,
            height: catalogItem.h,
            depth: catalogItem.d,
            rotation: 0
        };

        // VALIDACIÓN ANTES DE AGREGAR
        const validation = validatePlacement(newItem, items, openings, wallLength);

        if (!validation.valid) {
            setErrorMsg(`No se puede colocar: ${validation.reason}`);
            // Opcional: Podríamos agregarlo igual pero marcarlo visualmente como inválido
            return;
        }

        setErrorMsg(null);
        updateStoreItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        updateStoreItems(items.filter(i => i.id !== id));
    };

    const moveItem = (id: string, deltaMm: number) => {
        const targetItem = items.find(i => i.id === id);
        if (!targetItem || activeWallIndex === null) return;

        const wallLength = getCurrentWallLength();
        const newItemState = { ...targetItem, distFromStart: targetItem.distFromStart + deltaMm };

        // Validar movimiento
        const validation = validatePlacement(newItemState, items, openings, wallLength);

        if (validation.valid) {
            const newItems = items.map(i => i.id === id ? newItemState : i);
            updateStoreItems(newItems);
            setErrorMsg(null);
        } else {
            // Feedback sutil (ej. vibración o toast)
            setErrorMsg(validation.reason || "Movimiento inválido");
            setTimeout(() => setErrorMsg(null), 2000);
        }
    };

    // Filtrar items para mostrar solo los del muro activo (Contextual UI)
    const activeWallItems = activeWallIndex !== null
        ? items.filter(i => i.wallIndex === activeWallIndex).sort((a, b) => a.distFromStart - b.distFromStart)
        : [];

    return (
        <div className="p-6 h-full flex flex-col bg-white">
            <div className="mb-4 border-b pb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <LayoutGrid className="text-indigo-600" />
                    Distribución de Mobiliario
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Diseña tu cocina muro por muro.
                    {activeWallIndex !== null
                        ? <span className="ml-1 font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Muro #{activeWallIndex + 1} Activo</span>
                        : <span className="ml-1 text-orange-500 font-medium">(Selecciona un muro en 3D)</span>
                    }
                </p>
                {errorMsg && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                        <AlertTriangle className="w-4 h-4" />
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* LISTA DE MUEBLES EN EL MURO ACTUAL */}
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl border border-gray-200 p-2">
                {activeWallItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                        <Box className="w-8 h-8 mb-2 opacity-50" />
                        <p>Este muro está vacío.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {activeWallItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-2 group hover:border-indigo-300 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-xs font-bold text-gray-700 block">{item.name}</span>
                                        <span className="text-[10px] text-gray-400">Pos: {Math.round(item.distFromStart)}mm | Elev: {item.elevation}mm</span>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Controles de Precisión */}
                                <div className="flex gap-2 mt-1">
                                    <button onClick={() => moveItem(item.id, -50)} className="flex-1 bg-gray-50 hover:bg-gray-100 border rounded flex justify-center py-1 text-gray-600">
                                        <ArrowLeft className="w-3 h-3" />
                                    </button>
                                    <button onClick={() => moveItem(item.id, 50)} className="flex-1 bg-gray-50 hover:bg-gray-100 border rounded flex justify-center py-1 text-gray-600">
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CATÁLOGO */}
            <div className="mt-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catálogo Disponible</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CATALOG.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => addItem(cat)}
                            disabled={activeWallIndex === null}
                            className={`flex items-center gap-3 p-2 text-left border rounded-lg transition-all
                                ${activeWallIndex === null ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:border-indigo-500 hover:bg-indigo-50 bg-white shadow-sm'}
                            `}
                        >
                            <div className="bg-gray-100 p-2 rounded text-gray-600">
                                {cat.icon}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-700">{cat.name}</div>
                                <div className="text-[10px] text-gray-400">{cat.w}x{cat.h} mm</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Position;