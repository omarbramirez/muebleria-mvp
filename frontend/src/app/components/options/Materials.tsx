import React, { useState, useEffect } from 'react';
import {
    Paintbrush,
    Layers,
    Box,
    Info,
    CheckCircle2,
    DollarSign
} from "lucide-react";

// ... imports ...
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// Tipos de datos para escalabilidad
type MaterialCategory = 'cabinets' | 'countertops' | 'details';

interface MaterialOption {
    id: string;
    name: string;
    description: string;
    priceTier: 1 | 2 | 3; // 1: Económico, 2: Estándar, 3: Premium
    hexColor: string; // Fallback visual o color base
    gradient?: string; // Para simular textura en el mockup
    tags: string[];
}

// Define el tipo para el objeto que almacena las selecciones
interface MaterialSelections {
    cabinets: MaterialOption;
    countertops: MaterialOption;
    details: MaterialOption;
}

const MATERIALS_DB: Record<MaterialCategory, MaterialOption[]> = {
    cabinets: [
        { id: 'mel_white', name: 'Melamina Blanco Mate', description: 'Limpio, minimalista y económico. Fácil de limpiar.', priceTier: 1, hexColor: '#f3f4f6', tags: ['Básico'] },
        { id: 'mel_oak', name: 'Roble Claro', description: 'Textura de madera natural con calidez nórdica.', priceTier: 1, hexColor: '#e5d0b1', gradient: 'linear-gradient(45deg, #e5d0b1, #d4b895)', tags: ['Tendencia'] },
        { id: 'lac_grey', name: 'Gris Grafito (Laqueado)', description: 'Acabado premium ultra suave al tacto, anti-huellas.', priceTier: 3, hexColor: '#374151', tags: ['Premium'] },
        { id: 'lam_blue', name: 'Azul Noche', description: 'Color sólido profundo para contrastes modernos.', priceTier: 2, hexColor: '#1e3a8a', tags: ['Moderno'] },
        { id: 'ven_walnut', name: 'Chapa de Nogal', description: 'Madera real. Elegancia clásica y veta natural.', priceTier: 3, hexColor: '#5d4037', gradient: 'linear-gradient(135deg, #5d4037, #3e2723)', tags: ['Lujo'] },
        { id: 'mel_concrete', name: 'Concreto Urbano', description: 'Estilo industrial con textura de cemento aparente.', priceTier: 2, hexColor: '#9ca3af', gradient: 'linear-gradient(to bottom, #9ca3af, #6b7280)', tags: ['Industrial'] },
    ],
    countertops: [
        { id: 'lam_granite', name: 'Laminado Granito', description: 'Resistente y económico. Apariencia de piedra.', priceTier: 1, hexColor: '#d1d5db', gradient: 'radial-gradient(#d1d5db, #9ca3af)', tags: ['Económico'] },
        { id: 'qtz_white', name: 'Cuarzo Blanco Puro', description: 'Superficie no porosa, antibacteriana y eterna.', priceTier: 3, hexColor: '#ffffff', tags: ['Premium', 'Higiene'] },
        { id: 'granite_black', name: 'Granito San Gabriel', description: 'Piedra natural resistente al calor y rayaduras.', priceTier: 2, hexColor: '#111827', gradient: 'repeating-linear-gradient(45deg, #111827, #1f2937 10px)', tags: ['Resistente'] },
    ],
    details: [
        { id: 'handle_black', name: 'Herrajes Negro Mate', description: 'Tiradores y grifería en negro.', priceTier: 1, hexColor: '#000', tags: [] },
        { id: 'handle_gold', name: 'Latón Cepillado', description: 'Toque dorado elegante.', priceTier: 2, hexColor: '#fbbf24', tags: [] },
    ]
};

const Materials = () => {

    // "State Object" universal en Zustand
    // Estrategia de Integración (El Patrón "Sync")
    const { values, setValue } = usePreferenceWizardStore();

    // Defaults definidos en tu archivo anterior
    const defaultSelections = {
        cabinets: MATERIALS_DB.cabinets[1],
        countertops: MATERIALS_DB.countertops[1],
        details: MATERIALS_DB.details[0]
    };

    // 1. HYDRATION
    const [selections, setSelections] = useState<MaterialSelections>(values.materials_config || defaultSelections);
    const [activeTab, setActiveTab] = useState<MaterialCategory>('cabinets');

    const handleSelect = (category: MaterialCategory, material: MaterialOption) => {
        setSelections(prev => ({ ...prev, [category]: material }));
    };

    // 2. SYNC
  useEffect(() => {
    setValue('materials_config', selections);
  }, [selections, setValue]);

    // Helper para renderizar indicadores de costo ($ $$ $$$)
    const renderPriceTier = (tier: number) => (
        <div className="flex text-[10px] font-bold text-gray-400 gap-0.5">
            {[1, 2, 3].map(i => (
                <span key={i} className={i <= tier ? 'text-green-600' : 'opacity-30'}>$</span>
            ))}
        </div>
    );

    return (
        <div className="p-0 h-full flex flex-col bg-white shadow-sm overflow-hidden rounded-xl">

            {/* Header Fijo */}
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Paintbrush className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-gray-800">Paleta de Materiales</h2>
                </div>
                <p className="text-sm text-gray-500">
                    Personaliza la estética. Recuerda que los acabados influyen en el presupuesto final.
                </p>
            </div>

            {/* Tabs de Navegación (Categorías) */}
            <div className="flex border-b px-6 gap-6">
                <button
                    onClick={() => setActiveTab('cabinets')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'cabinets' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Gabinetes
                    {activeTab === 'cabinets' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('countertops')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'countertops' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Cubiertas
                    {activeTab === 'countertops' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'details' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Detalles
                    {activeTab === 'details' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
            </div>

            {/* Área de Selección con Scroll */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {MATERIALS_DB[activeTab].map((material) => {
                        const isSelected = selections[activeTab].id === material.id;
                        return (
                            <div
                                key={material.id}
                                onClick={() => handleSelect(activeTab, material)}
                                className={`
                                group relative flex flex-col border-2 rounded-xl cursor-pointer transition-all duration-200 overflow-hidden bg-white shadow-sm
                                ${isSelected ? 'border-blue-500 ring-2 ring-blue-100 ring-offset-1' : 'border-transparent hover:border-gray-300'}
                            `}
                            >
                                {/* Simulación de Textura (Imagen/Gradiente) */}
                                <div
                                    className="h-24 w-full bg-cover bg-center relative"
                                    style={{ background: material.gradient || material.hexColor }}
                                >
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                            <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                                        </div>
                                    )}
                                    {/* Badge de Tier en la imagen */}
                                    <div className="absolute bottom-1 right-1 bg-white/90 px-1.5 py-0.5 rounded text-[10px] shadow-sm backdrop-blur-sm">
                                        {renderPriceTier(material.priceTier)}
                                    </div>
                                </div>

                                {/* Info del Material */}
                                <div className="p-3 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {material.name}
                                        </h4>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">
                                        {material.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer: Mood Board Resumen */}
            <div className="bg-white border-t p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <Layers className="w-3 h-3" />
                    Tu Mood Board Actual
                </div>
                <div className="flex gap-3">
                    {/* Resumen Visual Gabinetes */}
                    <div className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-lg flex-1">
                        <div className="w-6 h-6 rounded-full border shadow-sm flex-shrink-0" style={{ background: selections.cabinets.gradient || selections.cabinets.hexColor }} />
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Frentes</p>
                            <p className="text-xs text-gray-800 truncate font-medium">{selections.cabinets.name}</p>
                        </div>
                    </div>

                    {/* Resumen Visual Cubierta */}
                    <div className="flex items-center gap-2 bg-gray-50 border px-3 py-2 rounded-lg flex-1">
                        <div className="w-6 h-6 rounded-full border shadow-sm flex-shrink-0" style={{ background: selections.countertops.gradient || selections.countertops.hexColor }} />
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Cubierta</p>
                            <p className="text-xs text-gray-800 truncate font-medium">{selections.countertops.name}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Materials