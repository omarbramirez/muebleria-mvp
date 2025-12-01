import React, { useState, useEffect, useCallback } from 'react';
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

import { usePreferenceWizardStore, ApplianceModel, WizardStoreValue } from "@/store/preferenceWizardStore";

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
interface AppliancePreset {
  id: string;
  label: string;
  w: number;
  h: number;
  d: number;
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

// Icono Helper para la dimensión de Fondo (Depth)
const Move3DIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 3v16h16" /><path d="m5 19 6-6" />
  </svg>
)

const Appliances = () => {
  // 1. CONEXIÓN REAL A ZUSTAND
  const {
    appliances: storeAppliances3D,
    updateApplianceSpecs,
    setAppliances: setStoreAppliances,
    values,
    setValue
  } = usePreferenceWizardStore();

  // Definiciones de configuraciones iniciales completas
  const defaultAppliances: Record<string, ApplianceConfig> = {
    fridge: { id: 'fridge', active: true, ownership: 'buy', type: 'french_door', width: 90, height: 178, depth: 85 },
    stove: { id: 'stove', active: true, ownership: 'buy', type: 'freestanding_30', width: 76, height: 90, depth: 65 },
    hood: { id: 'hood', active: false, ownership: 'buy', type: 'wall_mount', width: 76, height: 60, depth: 50 },
    dishwasher: { id: 'dishwasher', active: false, ownership: 'buy', type: 'standard_24', width: 60, height: 85, depth: 60 },
  };

  // 1. HYDRATION (Uso del operador de fusión lógica para garantizar un objeto completo)
  const [localConfig, setLocalConfig] = useState<Record<string, ApplianceConfig>>(() => {
    // Si hay configuración en el store, la usamos. 
    // Luego, la fusionamos con los defaults para asegurar que todas las claves existan.
    return { ...defaultAppliances, ...(values.appliances_config as unknown as Record<string, ApplianceConfig> || {}) };
  });

  // Helper para actualizar Store Global (3D) y Estado Local (UI)
  // NOTA: Ya no usamos useCallback para evitar dependencias complejas y closures desactualizados en este caso simple.
  const syncToStore = (key: string, changes: Partial<ApplianceConfig>) => {
    const current = localConfig[key];
    if (!current) return;

    const updatedConfig = { ...current, ...changes };

    // 1. Actualizar UI Local
    setLocalConfig(prev => ({ ...prev, [key]: updatedConfig }));

    // 2. Sincronización Inteligente con el Store 3D
    // IMPORTANTE: Esto ocurre FUERA del render loop, en el event handler.
    const isActive = updatedConfig.active;
    const targetId = `${key}_${updatedConfig.type}`; // ID único basado en tipo y config

    // Buscamos si ya existe en el store (por ID o por tipo base)
    const existingIndex = storeAppliances3D.findIndex(a => a.id === targetId || a.type === key);
    const existingApp = storeAppliances3D[existingIndex];

    if (isActive) {
      if (existingApp) {
        // ACTUALIZAR: Si ya existe, actualizamos sus specs
        const specsToUpdate: Partial<ApplianceModel> = {};
        if (changes.width !== undefined) specsToUpdate.width = changes.width;
        if (changes.height !== undefined) specsToUpdate.height = changes.height;
        if (changes.depth !== undefined) specsToUpdate.depth = changes.depth;
        if (changes.type !== undefined) specsToUpdate.id = targetId; // Actualizar ID si cambia el tipo

        if (Object.keys(specsToUpdate).length > 0) {
          updateApplianceSpecs(existingApp.id, specsToUpdate);
        }
      } else {
        // CREAR: Si no existe y está activo, lo agregamos
        const newApp: ApplianceModel = {
          id: targetId,
          type: key as ApplianceModel['type'], // 'fridge', 'stove', etc.
          width: updatedConfig.width,
          height: updatedConfig.height,
          depth: updatedConfig.depth,
          color: '#e5e7eb', // Default color
          position: { x: 0, y: 0, z: 0 }, // Posición inicial default
          rotation: 0
        };
        setStoreAppliances([...storeAppliances3D, newApp]);
      }
    } else {
      // ELIMINAR: Si se desactivó y existe, lo quitamos
      if (existingApp) {
        const newStoreApps = storeAppliances3D.filter(a => a.id !== existingApp.id);
        setStoreAppliances(newStoreApps);
      }
    }
  };

  // Manejadores Refactorizados
  const toggleActive = (key: string) => {
    syncToStore(key, { active: !localConfig[key]?.active });
  };

  const setOwnership = (key: string, mode: Ownership) => {
    syncToStore(key, { ownership: mode });
  };

  const updateDimension = (key: string, field: 'width' | 'height' | 'depth', value: number) => {
    syncToStore(key, { [field]: value });
  };

  const selectPreset = (key: string, preset: AppliancePreset) => {
    syncToStore(key, {
      type: preset.id,
      width: preset.w,
      height: preset.h,
      depth: preset.d
    });
  };

  // 2. SYNC INITIAL (Mount only)
  // Si al cargar el componente hay items activos en localConfig pero no en el store, agregarlos.
  useEffect(() => {
    // Solo corremos esto una vez al montar para hidratar el store si está vacío
    if (storeAppliances3D.length === 0) {
      const initialApps: ApplianceModel[] = [];
      Object.entries(localConfig).forEach(([key, config]) => {
        if (config.active) {
          initialApps.push({
            id: `${key}_${config.type}`,
            type: key as ApplianceModel['type'],
            width: config.width,
            height: config.height,
            depth: config.depth,
            color: '#e5e7eb',
            position: { x: 0, y: 0, z: 0 },
            rotation: 0
          });
        }
      });
      if (initialApps.length > 0) {
        setStoreAppliances(initialApps);
      }
    }
  }, []); // Empty dependency array = mount only

  // 3. SYNC VALUES
  useEffect(() => {
    setValue('appliances_config', localConfig as unknown as WizardStoreValue);
  }, [localConfig, setValue]);

  // Sub-componente de Tarjeta
  const renderApplianceCard = (key: string, icon: React.ReactNode, title: string, presets: AppliancePreset[]) => {
    const app = localConfig[key]; // <--- USAR localConfig
    if (!app) return null;
    const isActive = app.active;

    return (
      <div className={`border rounded-xl transition-all duration-200 ${isActive ? 'border-indigo-500 bg-white shadow-lg' : 'border-gray-200 bg-gray-50 opacity-80'}`}>

        {/* Header de la Tarjeta (Activador) */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => toggleActive(key)}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500/10 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
              {icon}
            </div>
            <span className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>{title}</span>
          </div>
          <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'}`}>
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
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${app.ownership === 'buy' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ShoppingCart className="w-3 h-3" /> Comprar Nuevo
              </button>
              <button
                onClick={() => setOwnership(key, 'own')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-all ${app.ownership === 'own' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
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
                      className={`text-xs p-3 border rounded-lg cursor-pointer flex justify-between items-center ${app.type === preset.id ? 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500 font-medium' : 'hover:border-gray-300 text-gray-700'}`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-gray-400 font-mono">{preset.w}x{preset.h} cm</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg text-[11px] text-yellow-800 border border-yellow-200 mb-2">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Mide el espacio exterior máximo (incluyendo manijas) o la dimensión de encastre requerida si el equipo es de empotrar (slide-in).</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">ANCHO (cm)</label>
                    <input
                      type="number"
                      value={app.width}
                      onChange={(e) => updateDimension(key, 'width', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm text-center focus:ring-2 ring-indigo-500/50 outline-none transition-shadow"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">ALTO (cm)</label>
                    <input
                      type="number"
                      value={app.height}
                      onChange={(e) => updateDimension(key, 'height', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm text-center focus:ring-2 ring-indigo-500/50 outline-none transition-shadow"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold block mb-1">FONDO (cm)</label>
                    <input
                      type="number"
                      value={app.depth}
                      onChange={(e) => updateDimension(key, 'depth', Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm text-center focus:ring-2 ring-indigo-500/50 outline-none transition-shadow"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Visual de Dimensiones (Siempre visible para confirmar) */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500 bg-gray-100 py-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1"><Ruler className="w-3 h-3 text-indigo-500" /> W: <span className="font-mono text-gray-700 font-bold">{app.width}</span></div>
              <div className="flex items-center gap-1"><Ruler className="w-3 h-3 rotate-90 text-indigo-500" /> H: <span className="font-mono text-gray-700 font-bold">{app.height}</span></div>
              <div className="flex items-center gap-1"><Move3DIcon className="w-3 h-3 text-indigo-500" /> D: <span className="font-mono text-gray-700 font-bold">{app.depth}</span></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 shadow-xl h-full bg-white flex flex-col rounded-xl">
      <div className="mb-6 border-b pb-4 border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Refrigerator className="w-7 h-7 text-indigo-600" />
          <h2 className="text-2xl font-extrabold text-gray-900">Configuración de Electrodomésticos</h2>
        </div>
        <p className="text-sm text-gray-600">
          Define las dimensiones y el estado de propiedad de tus equipos para garantizar un diseño de carpintería (muebles) que encaje perfectamente.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-5 pb-4">
        {renderApplianceCard('fridge', <Refrigerator className="w-5 h-5" />, 'Refrigerador', PRESETS.fridge)}
        {renderApplianceCard('stove', <Flame className="w-5 h-5" />, 'Estufa / Parrilla', PRESETS.stove)}
        {renderApplianceCard('hood', <Wind className="w-5 h-5" />, 'Campana Extractora', PRESETS.hood)}
        {renderApplianceCard('dishwasher', <Waves className="w-5 h-5" />, 'Lavavajillas', PRESETS.dishwasher)}
      </div>
    </div>
  )
}

export default Appliances