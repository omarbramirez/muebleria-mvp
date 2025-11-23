import React, { useState, useEffect } from 'react';
import {
  Plug,
  Droplets,
  Flame,
  Plus,
  Trash2,
  AlertCircle,
  X, 
} from "lucide-react";

// Importamos el hook Y EL TIPO para el casting estricto
import { usePreferenceWizardStore, WizardStoreValue } from "@/store/preferenceWizardStore";


// --- TIPOS DE DATOS (Mantener la precisión) ---
type InstallationType = 'electrical' | 'plumbing' | 'gas';

interface InstallationPoint {
  id: string;
  type: InstallationType;
  subtype: string;
  x: number; 
  y: number; 
  z: number; 
  notes?: string;
  hasHotWater?: boolean;
  hasColdWater?: boolean;
}

interface GasConfig {
  required: boolean;
  type: 'natural' | 'lp'; 
  x: number;
  z: number;
}

// --- VALORES DE INICIALIZACIÓN ---
const INITIAL_INSTALLATIONS: InstallationPoint[] = [
  { id: 'def_e1', type: 'electrical', subtype: '110v_general', x: 120, y: 0, z: 110 },
  { id: 'def_p1', type: 'plumbing', subtype: 'sink', x: 200, y: 0, z: 55, hasHotWater: true, hasColdWater: true }
];
const INITIAL_GAS_CONFIG: GasConfig = {
  required: false,
  type: 'natural',
  x: 0,
  z: 0
};


const Compatibility = () => {
  const { values, setValue } = usePreferenceWizardStore();

  // 1. HYDRATION (Lectura Segura)
  // CORRECCIÓN 1: Usamos 'as unknown as InstallationPoint[]' para filtrar el tipo genérico del store
  const [points, setPoints] = useState<InstallationPoint[]>(
    (values.installation_points as unknown as InstallationPoint[]) || INITIAL_INSTALLATIONS
  );

  // CORRECCIÓN 2: Lo mismo para GasConfig
  const [gasConfig, setGasConfig] = useState<GasConfig>(
    (values.gas_config as unknown as GasConfig) || INITIAL_GAS_CONFIG
  );


  // --- HANDLERS DE ESTADO LOCAL ---

  // 1. Maneja cambios en campos numéricos y selectores
  const handleUpdatePoint = (id: string, field: keyof InstallationPoint, value: string | number | boolean) => {
    setPoints(prev => prev.map(p => {
      if (p.id === id) {
        // Aseguramos que los números se guarden como números y no como strings
        const finalValue = (typeof value === 'string' && !isNaN(parseFloat(value))) ? parseFloat(value) : value;
        // Casting parcial necesario porque TypeScript infiere mal las llaves dinámicas
        return { ...p, [field]: finalValue } as InstallationPoint;
      }
      return p;
    }));
  };

  const addPoint = (type: InstallationType) => {
    const defaultPoint: InstallationPoint = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      subtype: type === 'electrical' ? '110v_general' : type === 'plumbing' ? 'sink' : 'gas_natural',
      x: 100, 
      y: 0,
      z: type === 'electrical' ? 110 : 55, 
      hasHotWater: type === 'plumbing' ? true : undefined,
      hasColdWater: type === 'plumbing' ? true : undefined,
    };
    setPoints([...points, defaultPoint]);
  };

  const removePoint = (id: string) => {
    setPoints(points.filter(p => p.id !== id));
  };
  
  // 2. Maneja cambios en el objeto de configuración de gas
  const handleGasConfigChange = (field: keyof GasConfig, value: boolean | string | number) => {
      setGasConfig(prev => ({ ...prev, [field]: value }));
  };


  // 3. SYNCHRONIZATION (Escritura Segura en el Store Global)
  useEffect(() => { 
    // CORRECCIÓN 3: Casting de salida para evitar conflictos recursivos
    setValue('installation_points', points as unknown as WizardStoreValue);
  }, [points, setValue]);
  
  useEffect(() => { 
    // CORRECCIÓN 4: Casting de salida
    setValue('gas_config', gasConfig as unknown as WizardStoreValue);
  }, [gasConfig, setValue]);
  

  return (
    <div className="p-6 bg-white flex flex-col gap-6">

      {/* Header Informativo */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Dato Clave para Arquitectura</p>
          <p>La posición de tus tomas define la **zonificación de la cocina**. Una colisión aquí detiene la ejecución del proyecto.</p>
        </div>
      </div>

      {/* SECCIÓN 1: SISTEMA ELÉCTRICO */}
      <section className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800">Salidas Eléctricas</h3>
          </div>
          <button
            onClick={() => addPoint('electrical')}
            className="text-xs flex items-center gap-1 bg-white border px-3 py-1.5 rounded hover:bg-gray-50 transition text-gray-700 font-medium shadow-sm"
          >
            <Plus className="w-3 h-3" /> Agregar Salida
          </button>
        </div>

        <div className="p-4 space-y-4">
          {points.filter(p => p.type === 'electrical').length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-2">No has registrado tomas de corriente.</p>
          )}

          {points.filter(p => p.type === 'electrical').map((point, _index) => (
            <div key={point.id} className="grid grid-cols-12 gap-3 items-end border-b border-dashed pb-4 last:border-0 last:pb-0 animate-in fade-in slide-in-from-top-2">

              {/* Selector de Uso/Tipo */}
              <div className="col-span-12 sm:col-span-4">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">Uso / Voltaje</label>
                <select 
                    value={point.subtype}
                    onChange={(e) => handleUpdatePoint(point.id, 'subtype', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="110v_general">General (110V)</option>
                  <option value="110v_fridge">Refrigerador (110V)</option>
                  <option value="220v_oven">Horno/Estufa (220V)</option>
                  <option value="gfci_wet">GFCI (Área Húmeda)</option>
                </select>
              </div>

              {/* Coordenadas Compactas */}
              <div className="col-span-4 sm:col-span-3">
                <label className="text-[10px] uppercase text-gray-500 font-semibold mb-1 block">Dist. X (cm)</label>
                <input 
                    type="number" 
                    value={point.x} 
                    onChange={(e) => handleUpdatePoint(point.id, 'x', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center" 
                    placeholder="0"
                />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <label className="text-[10px] uppercase text-gray-500 font-semibold mb-1 block">Altura Z (cm)</label>
                <input 
                    type="number" 
                    value={point.z} 
                    onChange={(e) => handleUpdatePoint(point.id, 'z', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm text-center" 
                    placeholder="0" 
                />
              </div>

              {/* Botón Eliminar */}
              <div className="col-span-4 sm:col-span-2 flex justify-end pb-2">
                <button onClick={() => removePoint(point.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: HIDROSANITARIO (DRENAJE Y AGUA) */}
      <section className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800">Hidrosanitario</h3>
          </div>
          <button
            onClick={() => addPoint('plumbing')}
            className="text-xs flex items-center gap-1 bg-white border px-3 py-1.5 rounded hover:bg-gray-50 transition text-gray-700 font-medium shadow-sm"
          >
            <Plus className="w-3 h-3" /> Agregar Salida
          </button>
        </div>

        <div className="p-4 space-y-4">
          {points.filter(p => p.type === 'plumbing').length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-2">No has registrado salidas de agua/drenaje.</p>
          )}

          {points.filter(p => p.type === 'plumbing').map((point) => (
            <div key={point.id} className="border border-gray-100 rounded-lg p-3 bg-slate-50/50 relative group">
              
              <button onClick={() => removePoint(point.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1">
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="text-[10px] uppercase text-gray-500 font-semibold mb-1 block">Tipo de Servicio</label>
                  <select 
                      value={point.subtype}
                      onChange={(e) => handleUpdatePoint(point.id, 'subtype', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                  >
                    <option value="sink">Tarja / Fregadero</option>
                    <option value="dishwasher">Lavavajillas</option>
                    <option value="fridge_water">Toma Agua Refri</option>
                    <option value="floor_drain">Coladera de Piso</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!point.hasColdWater}
                        onChange={(e) => handleUpdatePoint(point.id, 'hasColdWater', e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="text-xs text-gray-700 font-medium">Agua Fría</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={!!point.hasHotWater}
                        onChange={(e) => handleUpdatePoint(point.id, 'hasHotWater', e.target.checked)}
                        className="rounded text-red-500 focus:ring-red-500" 
                    />
                    <span className="text-xs text-gray-700 font-medium">Agua Caliente</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-gray-200 pt-3">
                <div>
                  <label className="text-[10px] text-gray-500 block">Posición X (cm)</label>
                  <input 
                      type="number" 
                      value={point.x}
                      onChange={(e) => handleUpdatePoint(point.id, 'x', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block">Altura Z (cm)</label>
                  <input 
                      type="number" 
                      value={point.z}
                      onChange={(e) => handleUpdatePoint(point.id, 'z', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block">Diámetro (Opcional)</label>
                  <select className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>Estándar (2&quot;)</option>
                    <option>Grande (4&quot;)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: GAS */}
      <section className="border rounded-xl overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800">Suministro de Gas</h3>
        </div>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <input 
                type="checkbox" 
                checked={gasConfig.required}
                onChange={(e) => handleGasConfigChange('required', e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500" 
            />
            <div className="w-full">
              <span className="text-sm font-medium text-gray-700 block">Este espacio requiere conexión a gas</span>

              {/* Panel condicional (se muestra si gasConfig.required es true) */}
              {gasConfig.required && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pl-1 animate-in fade-in">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tipo de Gas</label>
                  <select 
                      value={gasConfig.type}
                      onChange={(e) => handleGasConfigChange('type', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  >
                    <option value="natural">Gas Natural (Tubería)</option>
                    <option value="lp">Gas LP (Tanque/Cilindro)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Ubicación de Válvula</label>
                  <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="X (cm)" 
                        value={gasConfig.x}
                        onChange={(e) => handleGasConfigChange('x', Number(e.target.value))}
                        className="w-1/2 border rounded px-2 py-2 text-sm" 
                    />
                    <input 
                        type="number" 
                        placeholder="Z (cm)" 
                        value={gasConfig.z}
                        onChange={(e) => handleGasConfigChange('z', Number(e.target.value))}
                        className="w-1/2 border rounded px-2 py-2 text-sm" 
                    />
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Compatibility;