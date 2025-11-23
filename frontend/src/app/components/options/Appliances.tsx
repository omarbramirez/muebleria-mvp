import React, { useState, useEffect } from 'react';
import {
  Refrigerator,
  Flame,
  Wind,
  Waves,
  Check,
  Ruler,
  ShoppingCart,
  PackageOpen,
  Info
} from "lucide-react";

// ... imports ...
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// --- Tipos de Datos y Catálogos Estáticos ---

type Ownership = 'own' | 'buy';

interface ApplianceConfig {
  id: string;
  active: boolean;
  ownership: Ownership;
  type: string; // ej. 'french_door', 'slide_in'
  width: number;
  height: number;
  depth: number;
}

// Datos base para presets de "Comprar Nuevo" (Estándares de mercado)
const PRESETS = {
  fridge: [
    { id: 'top_mount', label: 'Top Mount (Congelador Arriba)', w: 70, h: 170, d: 70 },
    { id: 'french_door', label: 'French Door (Puertas Dobles)', w: 90, h: 178, d: 85 },
    { id: 'side_by_side', label: 'Side by Side', w: 91, h: 178, d: 80 },
  ],
  stove: [
    { id: 'freestanding_30', label: 'Piso 30" (76cm)', w: 76, h: 90, d: 65 },
    { id: 'slide_in_30', label: 'Empotre 30" (76cm)', w: 76, h: 90, d: 60 },
    { id: 'cooktop_30', label: 'Parrilla Superior 30"', w: 76, h: 10, d: 50 },
  ],
  hood: [
    { id: 'wall_mount', label: 'Pared / Decorativa', w: 76, h: 60, d: 50 },
    { id: 'under_cabinet', label: 'Bajo Gabinete', w: 76, h: 15, d: 50 },
  ],
  dishwasher: [
    { id: 'standard_24', label: 'Estándar 24" (60cm)', w: 60, h: 85, d: 60 },
  ]
};

const Appliances = () => {

  // "State Object" universal en Zustand
  // Estrategia de Integración (El Patrón "Sync")
  const { values, setValue } = usePreferenceWizardStore();

  const defaultAppliances = {
    fridge: { id: 'fridge', active: true, ownership: 'buy', type: 'french_door', width: 90, height: 178, depth: 85 },
    stove: { id: 'stove', active: true, ownership: 'buy', type: 'freestanding_30', width: 76, height: 90, depth: 65 },
    // ... resto de defaults
  };

  // 1. HYDRATION
  const [appliances, setAppliances] = useState<Record<string, ApplianceConfig>>(
    values.appliances_config || defaultAppliances
  );

  // Manejadores de Estado
  const toggleActive = (key: string) => {
    setAppliances(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const setOwnership = (key: string, mode: Ownership) => {
    setAppliances(prev => ({
      ...prev,
      [key]: { ...prev[key], ownership: mode }
    }));
  };

  const updateDimension = (key: string, field: 'width' | 'height' | 'depth', value: number) => {
    setAppliances(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const selectPreset = (key: string, preset: any) => {
    setAppliances(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        type: preset.id,
        width: preset.w,
        height: preset.h,
        depth: preset.d
      }
    }));
  };

  // 2. SYNC
  useEffect(() => {
    setValue('appliances_config', appliances);
  }, [appliances, setValue]);

  // Sub-componente de Tarjeta para mantener el código limpio
  const renderApplianceCard = (key: string, icon: React.ReactNode, title: string, presets: any[]) => {
    const app = appliances[key];
    const isActive = app.active;

    return (
      <div className={`border rounded-xl transition-all duration-200 ${isActive ? 'border-primary bg-white shadow-md' : 'border-gray-200 bg-gray-50 opacity-80'}`}>

        {/* Header de la Tarjeta (Activador) */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => toggleActive(key)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-500'}`}>
              {icon}
            </div>
            <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
          </div>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'bg-primary border-primary' : 'border-gray-300'}`}>
            {isActive && <Check className="w-4 h-4 text-white" />}
          </div>
        </div>

        {/* Cuerpo de Configuración (Solo si está activo) */}
        {isActive && (
          <div className="px-4 pb-5 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="border-t border-gray-100 my-3"></div>

            {/* Switch: Tengo vs Compro */}
            <div className="flex bg-gray-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setOwnership(key, 'buy')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${app.ownership === 'buy' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ShoppingCart className="w-3 h-3" /> Comprar Nuevo
              </button>
              <button
                onClick={() => setOwnership(key, 'own')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${app.ownership === 'own' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <PackageOpen className="w-3 h-3" /> Ya lo tengo
              </button>
            </div>

            {/* Lógica Condicional: Selección o Input Manual */}
            {app.ownership === 'buy' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Modelo Sugerido</label>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map(preset => (
                    <div
                      key={preset.id}
                      onClick={() => selectPreset(key, preset)}
                      className={`text-xs p-2 border rounded cursor-pointer flex justify-between items-center ${app.type === preset.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-gray-300'}`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-gray-400">{preset.w}x{preset.h} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded text-[11px] text-yellow-800 border border-yellow-100 mb-2">
                  <Info className="w-3 h-3 flex-shrink-0" />
                  Mide el espacio exterior máximo (incluyendo manijas).
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">ANCHO (cm)</label>
                    <input type="number" value={app.width} onChange={(e) => updateDimension(key, 'width', Number(e.target.value))} className="w-full border rounded p-2 text-sm text-center focus:ring-2 ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">ALTO (cm)</label>
                    <input type="number" value={app.height} onChange={(e) => updateDimension(key, 'height', Number(e.target.value))} className="w-full border rounded p-2 text-sm text-center focus:ring-2 ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">FONDO (cm)</label>
                    <input type="number" value={app.depth} onChange={(e) => updateDimension(key, 'depth', Number(e.target.value))} className="w-full border rounded p-2 text-sm text-center focus:ring-2 ring-primary/20 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Visual de Dimensiones (Siempre visible para confirmar) */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400 bg-gray-50 py-2 rounded border border-gray-100">
              <div className="flex items-center gap-1"><Ruler className="w-3 h-3" /> W: <span className="font-mono text-gray-700">{app.width}</span></div>
              <div className="flex items-center gap-1"><Ruler className="w-3 h-3 rotate-90" /> H: <span className="font-mono text-gray-700">{app.height}</span></div>
              <div className="flex items-center gap-1"><Move3DIcon className="w-3 h-3" /> D: <span className="font-mono text-gray-700">{app.depth}</span></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 shadow-sm h-full bg-white flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Refrigerator className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-gray-800">Equipamiento</h2>
        </div>
        <p className="text-sm text-gray-500">
          Define las dimensiones de tus equipos para asegurar que la carpintería encaje perfectamente.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
        {renderApplianceCard('fridge', <Refrigerator className="w-5 h-5" />, 'Refrigerador', PRESETS.fridge)}
        {renderApplianceCard('stove', <Flame className="w-5 h-5" />, 'Estufa / Parrilla', PRESETS.stove)}
        {renderApplianceCard('hood', <Wind className="w-5 h-5" />, 'Campana Extractora', PRESETS.hood)}
        {renderApplianceCard('dishwasher', <Waves className="w-5 h-5" />, 'Lavavajillas', PRESETS.dishwasher)}
      </div>
    </div>
  )
}

// Helper Icon
const Move3DIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 3v16h16" /><path d="m5 19 6-6" />
  </svg>
)

export default Appliances