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
    Layers
} from "lucide-react";

// ... imports ...
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// --- 1. CATÁLOGO DE PIEZAS DISPONIBLES ---
// Esto simula tu base de datos de productos "Standard"
const CATALOG = [
    { id: 'base_60', name: 'Módulo Base 60cm', type: 'Base', w: 600, h: 900, d: 600, icon: <Box className="w-4 h-4" /> },
    { id: 'drawer_60', name: 'Cajonera 3 Niveles', type: 'Base', w: 600, h: 900, d: 600, icon: <Layers className="w-4 h-4" /> },
    { id: 'tall_pantry', name: 'Despensero Vertical', type: 'Tall', w: 600, h: 2100, d: 600, icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'wall_30', name: 'Alacena Aérea', type: 'Wall', w: 300, h: 700, d: 350, icon: <Box className="w-4 h-4" /> },
];

// Tipo para el estado local de la lista
interface PlacedItem {
    uid: string; // Unique ID para el render (ej. base_60_timestamp)
    catalogId: string;
    name: string;
    position: { x: number, y: number, z: number };
    rotation: number;
}

const LayoutManager = () => {

    // "State Object" universal en Zustand
    // Estrategia de Integración (El Patrón "Sync")
    const { values, setValue } = usePreferenceWizardStore();

    // --- ESTADO LOCAL (Simulando Zustand para este componente) ---
    // Lista de muebles colocados en la escena
    const [items, setItems] = useState<PlacedItem[]>(values.layout_items || []);
    // ID del mueble seleccionado actualmente para mover
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // --- ACCIONES ---

    // 1. AGREGAR (Instanciar)
    const addItem = (catalogItem: typeof CATALOG[0]) => {
        const newItem: PlacedItem = {
            uid: `${catalogItem.id}_${Date.now()}`,
            catalogId: catalogItem.id,
            name: catalogItem.name,
            // Posición inicial inteligente (ej. centro del room o siguiente disponible)
            position: { x: 500 + (items.length * 650), y: 0, z: catalogItem.type === 'Wall' ? 1450 : 0 },
            rotation: 0
        };
        setItems([...items, newItem]);
        setSelectedId(newItem.uid); // Auto-seleccionar el nuevo
    };

    // 2. ELIMINAR
    const deleteItem = () => {
        if (!selectedId) return;
        setItems(items.filter(i => i.uid !== selectedId));
        setSelectedId(null);
    };

    // 3. MOVER (La lógica de tu Position.tsx anterior)
    const updatePos = (axis: 'x' | 'y' | 'z', delta: number) => {
        if (!selectedId) return;
        setItems(items.map(item => {
            if (item.uid !== selectedId) return item;
            return {
                ...item,
                position: { ...item.position, [axis]: item.position[axis] + delta }
            };
        }));
    };

    const rotateItem = () => {
        if (!selectedId) return;
        setItems(items.map(item => {
            if (item.uid !== selectedId) return item;
            return { ...item, rotation: (item.rotation + 90) % 360 };
        }));
    };

    // Helper para obtener el item seleccionado actual
    const activeItem = items.find(i => i.uid === selectedId);

    // 2. SYNC: Guardamos cada movimiento
    useEffect(() => {
        setValue('layout_items', items);

        // Opcional: Calcular métricas derivadas para la IA
        // Ej: ¿Cuántos metros lineales de cocina hay?
        const totalLinearMeters = items.reduce((acc, item) => acc + (item.name.includes('Base') ? 0.6 : 0), 0);
        setValue('layout_metrics', { total_linear_meters: totalLinearMeters, total_items: items.length });

    }, [items, setValue]);

    return (
        <div className="p-6 shadow-sm bg-white h-full flex flex-col gap-4">

            {/* HEADER */}
            <div className="border-b pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800">Distribución y Mobiliario</h2>
                </div>
                <p className="text-sm text-gray-500">
                    Agrega módulos desde el catálogo y organízalos en tu planta.
                </p>
            </div>

            {/* SECCIÓN 1: LISTA DE ELEMENTOS ACTIVOS (SCENE GRAPH) */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Muebles en escena ({items.length})</span>
                    {selectedId && (
                        <button onClick={deleteItem} className="text-xs text-red-500 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded">
                            <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                    )}
                </div>

                {/* Lista horizontal o grid de items ya colocados */}
                <div className="flex gap-2 overflow-x-auto pb-2 min-h-[60px]">
                    {items.length === 0 && (
                        <div className="w-full text-center text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-lg py-4">
                            Tu espacio está vacío. Agrega un módulo abajo.
                        </div>
                    )}

                    {items.map(item => (
                        <button
                            key={item.uid}
                            onClick={() => setSelectedId(item.uid)}
                            className={`
                            flex-shrink-0 px-3 py-2 rounded-lg border text-left min-w-[120px] transition-all relative
                            ${selectedId === item.uid ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                        `}
                        >
                            <div className="text-xs font-bold text-gray-700 truncate">{item.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                                X:{item.position.x} Y:{item.position.z} {/* Nota: Z visual es Y en plano 2D a veces, depende tu lógica */}
                            </div>
                            {/* Indicador de activo */}
                            {selectedId === item.uid && <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* SECCIÓN 2: CONTROLES DE POSICIÓN (Solo visible si hay selección) */}
            {activeItem ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Editando: {activeItem.name}</span>
                        <div className="text-[10px] bg-white px-2 py-1 rounded border text-slate-400">ID: {activeItem.uid.slice(-4)}</div>
                    </div>

                    <div className="flex gap-4">
                        {/* D-PAD (Reutilizado de tu componente anterior) */}
                        <div className="grid grid-cols-3 gap-1 w-24 shrink-0">
                            <div />
                            <button onClick={() => updatePos('z', -10)} className="btn-control"><ArrowUp className="icon-sm" /></button>
                            <div />
                            <button onClick={() => updatePos('x', -10)} className="btn-control"><ArrowLeft className="icon-sm" /></button>
                            <div className="flex items-center justify-center"><Move3D className="w-4 h-4 text-slate-300" /></div>
                            <button onClick={() => updatePos('x', 10)} className="btn-control"><ArrowRight className="icon-sm" /></button>
                            <div />
                            <button onClick={() => updatePos('z', 10)} className="btn-control"><ArrowDown className="icon-sm" /></button>
                            <div />
                        </div>

                        {/* Botones de Acción Rápida */}
                        <div className="flex-1 grid grid-cols-1 gap-2">
                            <button onClick={rotateItem} className="flex items-center justify-center gap-2 bg-white border rounded hover:bg-gray-50 py-1 text-sm text-gray-700">
                                <RotateCw className="w-4 h-4" /> Rotar 90°
                            </button>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-white border rounded px-2 py-1">
                                    <span className="text-[10px] text-gray-400 block">Elevación</span>
                                    <span className="text-sm font-mono">{activeItem.position.y}</span>
                                </div>
                                <div className="flex flex-col gap-1 justify-center">
                                    <button onClick={() => updatePos('y', 150)} className="bg-white border rounded p-1 hover:bg-blue-50 text-[10px]">▲</button>
                                    <button onClick={() => updatePos('y', -150)} className="bg-white border rounded p-1 hover:bg-blue-50 text-[10px]">▼</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                    Selecciona un mueble arriba o agrega uno nuevo para editar su posición.
                </div>
            )}

            {/* SECCIÓN 3: CATÁLOGO (ADD NEW) */}
            <div className="mt-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Catálogo Rápido</h3>
                <div className="grid grid-cols-2 gap-2">
                    {CATALOG.map(catItem => (
                        <button
                            key={catItem.id}
                            onClick={() => addItem(catItem)}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group text-left"
                        >
                            <div className="bg-gray-100 p-2 rounded group-hover:bg-white transition-colors">
                                {catItem.icon}
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-700">{catItem.name}</div>
                                <div className="text-[10px] text-gray-400">{catItem.w}x{catItem.h}mm</div>
                            </div>
                            <Plus className="w-4 h-4 text-blue-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Estilos locales para el ejemplo (puedes moverlos a tu CSS) */}
            <style jsx>{`
            .btn-control {
                @apply bg-white border shadow-sm p-1.5 rounded hover:bg-blue-50 active:bg-blue-100 flex justify-center text-slate-600;
            }
            .icon-sm {
                @apply w-3 h-3;
            }
        `}</style>
        </div>
    )
}

export default LayoutManager