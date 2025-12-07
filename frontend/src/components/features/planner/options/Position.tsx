import React, { useState, useCallback } from 'react';
import {
    LayoutGrid,
    Trash2,
    Box,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Layers,
    AlertTriangle,
    MoveVertical
} from "lucide-react";

// Importación estricta de tipos
import { usePreferenceWizardStore, CabinetModule, WizardStoreValue, WallOpening } from "@/store/preferenceWizardStore";
import { validatePlacement } from "@/utils/designRules";

// --- CATÁLOGO ESTÁTICO ---
const CATALOG = [
    { id: 'base_60', name: 'Módulo Base 60cm', type: 'base', w: 600, h: 900, d: 600, icon: <Layers className="w-5 h-5" /> },
    { id: 'drawer_60', name: 'Cajonera 3 Niveles', type: 'base', w: 600, h: 900, d: 600, icon: <Box className="w-5 h-5" /> },
    { id: 'tall_pantry', name: 'Torre Alacena', type: 'tall', w: 600, h: 2100, d: 600, icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'wall_60', name: 'Alacena Aérea', type: 'wall', w: 600, h: 700, d: 350, icon: <Box className="w-5 h-5" /> },
] as const;

interface Point { x: number; y: number }

const Position = () => {
    const { values, setValue, activeWallIndex } = usePreferenceWizardStore();

    // 1. HYDRATION SEGURA
    const items = (values.layout_items as unknown as CabinetModule[]) || [];
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Datos del entorno para validaciones
    const openings = (values.room_openings as unknown as WallOpening[]) || [];
    const points = (values.room_points as unknown as Point[]) || [];

    // --- HELPER: CÁLCULO DE LONGITUD DEL MURO ---
    const getCurrentWallLength = useCallback((): number => {
        if (activeWallIndex === null || points.length === 0) return 3000;
        const p1 = points[activeWallIndex];
        const p2 = points[(activeWallIndex + 1) % points.length];

        // Distancia Euclidiana (Asumiendo conversión de unidades 3D a mm)
        const dx = (p2.x - p1.x) * 10;
        const dy = (p2.y - p1.y) * 10;
        return Math.sqrt(dx * dx + dy * dy);
    }, [activeWallIndex, points]);

    // --- SINCRONIZACIÓN CON STORE ---
    const updateStoreItems = (newItems: CabinetModule[]) => {
        setValue('layout_items', newItems as unknown as WizardStoreValue);
    };

    // --- LÓGICA DE ACTUALIZACIÓN UNIFICADA (CORE) ---
    const updateItemState = (id: string, changes: Partial<CabinetModule>) => {
        const targetItem = items.find(i => i.id === id);
        if (!targetItem || activeWallIndex === null) return;

        // --- CAPA DE SANITIZACIÓN DE DATOS (INGENIERÍA) ---
        // Antes de validar colisiones, aseguramos la integridad lógica de los datos.
        const sanitizedChanges = { ...changes };

        // Regla de Negocio: La elevación nunca puede ser negativa (enterrado en el piso)
        if (typeof sanitizedChanges.elevation === 'number') {
            sanitizedChanges.elevation = Math.max(0, sanitizedChanges.elevation);
        }

        // Crear el estado hipotético futuro
        const newItemState = { ...targetItem, ...sanitizedChanges };
        const wallLength = getCurrentWallLength();

        // Validación de Ingeniería: Colisiones y Límites Espaciales
        const validation = validatePlacement(newItemState, items, openings, wallLength);

        if (validation.valid) {
            const newItems = items.map(i => i.id === id ? newItemState : i);
            updateStoreItems(newItems);
            setErrorMsg(null);
        } else {
            // Feedback de error temporal
            setErrorMsg(validation.reason || "Movimiento inválido por colisión o límites.");
            setTimeout(() => setErrorMsg(null), 3000);
        }
    };

    // --- HANDLERS DE INTERACCIÓN ---

    const addItem = (catalogItem: typeof CATALOG[number]) => {
        if (activeWallIndex === null) {
            setErrorMsg("Selecciona un muro en el visor 3D para agregar muebles.");
            return;
        }

        const wallLength = getCurrentWallLength();

        // Lógica Smart Placement
        const itemsOnWall = items.filter(i => i.wallIndex === activeWallIndex);
        const lastItem = itemsOnWall.sort((a, b) => (a.distFromStart + a.width) - (b.distFromStart + b.width)).pop();

        let startX = 100;
        if (lastItem) {
            startX = lastItem.distFromStart + lastItem.width + 10;
        }

        const elevation = catalogItem.type === 'wall' ? 1450 : 0;

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

        const validation = validatePlacement(newItem, items, openings, wallLength);

        if (!validation.valid) {
            setErrorMsg(`No se puede colocar: ${validation.reason}`);
            return;
        }

        setErrorMsg(null);
        updateStoreItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        updateStoreItems(items.filter(i => i.id !== id));
    };

    // Wrappers para movimientos relativos
    const moveLateral = (id: string, deltaMm: number) => {
        const item = items.find(i => i.id === id);
        if (item) updateItemState(id, { distFromStart: item.distFromStart + deltaMm });
    };

    const moveVertical = (id: string, deltaMm: number) => {
        const item = items.find(i => i.id === id);
        if (item) {
            // Validación preventiva antes de llamar al update
            const nextElevation = item.elevation + deltaMm;
            if (nextElevation < 0) return; // Bloqueo temprano
            updateItemState(id, { elevation: nextElevation });
        }
    };

    // Wrapper para input numérico directo
    const handleManualInput = (id: string, field: 'distFromStart' | 'elevation', valueStr: string) => {
        let value = parseInt(valueStr, 10);
        if (!isNaN(value)) {
            // Validación específica para input manual
            if (field === 'elevation' && value < 0) value = 0;
            updateItemState(id, { [field]: value });
        }
    };

    // Filtrado de items para el muro activo
    const activeWallItems = activeWallIndex !== null
        ? items.filter(i => i.wallIndex === activeWallIndex).sort((a, b) => a.distFromStart - b.distFromStart)
        : [];

    return (
        <div className="p-6 h-full flex flex-col bg-white">
            {/* HEADER */}
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
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1 shadow-sm">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">{errorMsg}</span>
                    </div>
                )}
            </div>

            {/* LISTA DE MUEBLES (SCROLLABLE AREA) */}
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-xl border border-gray-200 p-2 scrollbar-thin scrollbar-thumb-gray-300">
                {activeWallItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm select-none">
                        <Box className="w-8 h-8 mb-2 opacity-50" />
                        <p>Este muro está vacío.</p>
                        <p className="text-xs opacity-70 mt-1">Agrega módulos del catálogo inferior.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeWallItems.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm flex flex-col gap-3 group hover:border-indigo-300 transition-all duration-200">

                                {/* Header de Tarjeta */}
                                <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-indigo-50 p-1.5 rounded text-indigo-600">
                                            {CATALOG.find(c => c.id === item.catalogId)?.icon || <Box className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-800 block leading-tight">{item.name}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">ID: {item.catalogId}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="Eliminar mueble"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Controles de Precisión (GRID 2x2) */}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                                    {/* COLUMNA 1: Posición Horizontal (X) */}
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
                                            <ArrowRight className="w-3 h-3" /> Posición X (mm)
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => moveLateral(item.id, -50)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 active:scale-95 transition-transform">
                                                <ArrowLeft className="w-3 h-3" />
                                            </button>
                                            <input
                                                type="number"
                                                value={Math.round(item.distFromStart)}
                                                onChange={(e) => handleManualInput(item.id, 'distFromStart', e.target.value)}
                                                className="flex-1 min-w-0 h-7 text-center text-xs border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-gray-700"
                                            />
                                            <button onClick={() => moveLateral(item.id, 50)} className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-600 active:scale-95 transition-transform">
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* COLUMNA 2: Elevación (Y) - VALIDADA */}
                                    <div>
                                        <label className="text-[9px] font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                                            <MoveVertical className="w-3 h-3" /> Elevación (mm)
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {/* Botón DOWN deshabilitado si ya es 0 */}
                                            <button
                                                onClick={() => moveVertical(item.id, -50)}
                                                disabled={item.elevation <= 0}
                                                className={`w-7 h-7 flex items-center justify-center rounded border text-indigo-600 transition-transform ${item.elevation <= 0 ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed' : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 active:scale-95'}`}
                                            >
                                                <ArrowDown className="w-3 h-3" />
                                            </button>

                                            <input
                                                type="number"
                                                value={Math.round(item.elevation)}
                                                min="0" // Validación HTML
                                                onChange={(e) => handleManualInput(item.id, 'elevation', e.target.value)}
                                                className="flex-1 min-w-0 h-7 text-center text-xs border border-indigo-200 bg-indigo-50/20 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-indigo-700 font-medium"
                                            />

                                            <button onClick={() => moveVertical(item.id, 50)} className="w-7 h-7 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 rounded border border-indigo-200 text-indigo-600 active:scale-95 transition-transform">
                                                <ArrowUp className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CATÁLOGO INFERIOR */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Catálogo Disponible</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CATALOG.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => addItem(cat)}
                            disabled={activeWallIndex === null}
                            className={`flex items-center gap-3 p-2.5 text-left border rounded-lg transition-all duration-200 group
                ${activeWallIndex === null
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                                    : 'hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md bg-white border-gray-200 cursor-pointer'}
              `}
                        >
                            <div className={`p-2 rounded transition-colors ${activeWallIndex === null ? 'bg-gray-200 text-gray-400' : 'bg-gray-100 text-gray-600 group-hover:bg-white group-hover:text-indigo-600'}`}>
                                {cat.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold truncate ${activeWallIndex === null ? 'text-gray-400' : 'text-gray-700 group-hover:text-indigo-700'}`}>
                                    {cat.name}
                                </div>
                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                    <span className="font-mono">{cat.w}x{cat.h}</span>
                                    <span className="opacity-50">mm</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Position;