import React, { useState, useEffect } from 'react';
import {
  Plug,
  Droplets,
  Flame,
  Plus,
  Trash2,
  AlertCircle,
  X
} from "lucide-react";

import { usePreferenceWizardStore, WizardStoreValue, InstallationPoint, GasConfig, InstallationType } from "@/store/preferenceWizardStore";

// Objeto base para inicialización segura
const INITIAL_GAS_CONFIG: GasConfig = {
  required: false,
  type: 'natural',
  x: 200,
  z: 200,
  wallIndex: 0,
};

const Compatibility = () => {
  const { values, setValue, activeWallIndex } = usePreferenceWizardStore();

  // 1. ESTADO LOCAL (Buffer de UI)
  // Inicializamos con lo que haya en el store, o con el default si está vacío.
  const [points, setPoints] = useState<InstallationPoint[]>(
    (values.installation_points as unknown as InstallationPoint[]) || []
  );

  const [gasConfig, setGasConfig] = useState<GasConfig>(
    (values.gas_config as unknown as GasConfig) || INITIAL_GAS_CONFIG
  );

  // ----------------------------------------------------------------------
  // LOGICA DE SINCRONIZACIÓN (El corazón de la reactividad 2D <-> 3D)
  // ----------------------------------------------------------------------

  // A. HIDRATACIÓN DE PUNTOS (Store -> Local)
  useEffect(() => {
    const storePoints = values.installation_points as unknown as InstallationPoint[];
    // Verificamos cambios profundos para evitar re-renders si el objeto es idéntico
    if (storePoints && JSON.stringify(storePoints) !== JSON.stringify(points)) {
      setPoints(storePoints);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.installation_points]);

  // B. PERSISTENCIA DE PUNTOS (Local -> Store)
  useEffect(() => {
    setValue('installation_points', points as unknown as WizardStoreValue);
  }, [points, setValue]);


  // C. HIDRATACIÓN DE GAS (Store -> Local) <--- ESTO FALTABA
  useEffect(() => {
    const storeGas = values.gas_config as unknown as GasConfig;

    // Si el store tiene datos y son diferentes a mi estado local (ej. se movió en 3D)
    // actualizo mi estado local para que los inputs numéricos cambien.
    if (storeGas && JSON.stringify(storeGas) !== JSON.stringify(gasConfig)) {
      setGasConfig(storeGas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.gas_config]); // Escuchamos cambios en el store


  // D. PERSISTENCIA DE GAS (Local -> Store)
  useEffect(() => {
    // Cuando el usuario escribe en los inputs, actualizamos el store
    // para que el 3D reaccione.
    setValue('gas_config', gasConfig as unknown as WizardStoreValue);
  }, [gasConfig, setValue]);


  // ----------------------------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------------------------

  const addPoint = (type: InstallationType) => {
    if (activeWallIndex === null) {
      alert("Por favor, selecciona un muro en el visor 3D primero.");
      return;
    }

    const newPoint: InstallationPoint = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      subtype: type === 'electrical' ? '110v' : 'sink',
      wallIndex: activeWallIndex,
      distFromStart: 500,
      heightFromFloor: type === 'electrical' ? 1100 : 550,
      hasHotWater: type === 'plumbing' ? true : undefined,
      hasColdWater: type === 'plumbing' ? true : undefined,
    };
    setPoints([...points, newPoint]);
  };

  const updatePoint = <K extends keyof InstallationPoint>(id: string, field: K, value: InstallationPoint[K]) => {
    setPoints(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePoint = (id: string) => {
    setPoints(prev => prev.filter(p => p.id !== id));
  };

  // Handler genérico y tipado para GasConfig
  const handleGasConfigChange = <K extends keyof GasConfig>(field: K, value: GasConfig[K]) => {
    setGasConfig(prev => ({ ...prev, [field]: value }));
  };

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <div className="p-6 bg-white flex flex-col gap-6 pb-24">

      {/* Header Contextual */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Mapeo de Instalaciones</p>
          <p>
            Registra la ubicación exacta de tus salidas actuales.
            {activeWallIndex !== null
              ? <span className="font-bold text-blue-700 ml-1">Editando Muro #{activeWallIndex + 1}</span>
              : <span className="italic text-gray-500 ml-1">(Selecciona un muro en el 3D para agregar puntos)</span>
            }
          </p>
        </div>
      </div>

      {/* SECCIÓN 1: ELÉCTRICO */}
      <section className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-800 text-sm">Salidas Eléctricas</h3>
          </div>
          <button
            onClick={() => addPoint('electrical')}
            disabled={activeWallIndex === null}
            className={`text-xs flex items-center gap-1 border px-3 py-1.5 rounded font-medium transition-all
                ${activeWallIndex !== null
                ? 'bg-white hover:bg-yellow-50 text-gray-700 border-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent'}`}
          >
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>

        <div className="p-2 space-y-2">
          {points.filter(p => p.type === 'electrical').length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Sin registros en este muro.</p>
          )}
          {points.filter(p => p.type === 'electrical').map(p => (
            <div key={p.id} className="grid grid-cols-12 gap-2 items-center bg-yellow-50/30 p-2 rounded border border-yellow-100">
              {/* Tipo */}
              <div className="col-span-4">
                <select
                  value={p.subtype}
                  onChange={(e) => updatePoint(p.id, 'subtype', e.target.value)}
                  className="w-full text-xs border-gray-200 rounded py-1"
                >
                  <option value="110v">110v (Común)</option>
                  <option value="220v">220v (Bifásica)</option>
                </select>
              </div>
              {/* Coordenadas */}
              <div className="col-span-3">
                <input type="number" placeholder="X" value={Math.round(p.distFromStart)} onChange={(e) => updatePoint(p.id, 'distFromStart', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                <span className="text-[9px] text-gray-400 block text-center">Distancia (mm)</span>
              </div>
              <div className="col-span-3">
                <input type="number" placeholder="Y" value={Math.round(p.heightFromFloor)} onChange={(e) => updatePoint(p.id, 'heightFromFloor', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                <span className="text-[9px] text-gray-400 block text-center">Altura (mm)</span>
              </div>
              <div className="col-span-2 text-right">
                <button onClick={() => removePoint(p.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: HIDROSANITARIO */}
      <section className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-800 text-sm">Agua y Drenaje</h3>
          </div>
          <button
            onClick={() => addPoint('plumbing')}
            disabled={activeWallIndex === null}
            className={`text-xs flex items-center gap-1 border px-3 py-1.5 rounded font-medium transition-all
                ${activeWallIndex !== null
                ? 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent'}`}
          >
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>

        <div className="p-2 space-y-2">
          {points.filter(p => p.type === 'plumbing').length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Sin registros.</p>
          )}
          {points.filter(p => p.type === 'plumbing').map(p => (
            <div key={p.id} className="bg-blue-50/30 p-2 rounded border border-blue-100 relative">
              <button onClick={() => removePoint(p.id)} className="absolute top-1 right-1 text-gray-300 hover:text-red-500"><X className="w-3 h-3" /></button>

              <div className="flex gap-2 mb-2">
                <select
                  value={p.subtype}
                  onChange={(e) => updatePoint(p.id, 'subtype', e.target.value)}
                  className="flex-1 text-xs border-gray-200 rounded py-1"
                >
                  <option value="sink">Tarja / Fregadero</option>
                  <option value="dishwasher">Lavavajillas</option>
                  <option value="fridge">Toma Refri</option>
                </select>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-1 text-[10px] text-gray-600">
                    <input type="checkbox" checked={p.hasColdWater} onChange={(e) => updatePoint(p.id, 'hasColdWater', e.target.checked)} /> Fría
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-gray-600">
                    <input type="checkbox" checked={p.hasHotWater} onChange={(e) => updatePoint(p.id, 'hasHotWater', e.target.checked)} /> Caliente
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="number" value={Math.round(p.distFromStart)} onChange={(e) => updatePoint(p.id, 'distFromStart', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                  <span className="text-[9px] text-gray-400 block text-center">Distancia X (mm)</span>
                </div>
                <div>
                  <input type="number" value={Math.round(p.heightFromFloor)} onChange={(e) => updatePoint(p.id, 'heightFromFloor', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                  <span className="text-[9px] text-gray-400 block text-center">Altura Y (mm)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: GAS */}
      <section className="border rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="bg-gray-50 p-3 border-b flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-800 text-sm">Gas</h3>
        </div>
        <div className="p-3">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={gasConfig.required}
              onChange={(e) => handleGasConfigChange('required', e.target.checked)}
              className="rounded text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700">Requiere conexión de gas</span>
          </label>

          {gasConfig.required && (
            <div className="animate-in fade-in space-y-3 bg-orange-50/50 p-3 rounded border border-orange-100">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">TIPO</label>
                  <select
                    value={gasConfig.type}
                    onChange={(e) => handleGasConfigChange('type', e.target.value as unknown as GasConfig['type'])}
                    className="w-full text-xs border border-gray-300 rounded-lg py-2 px-3 bg-white shadow-sm focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all text-black"
                  >
                    <option value="natural">Gas Natural</option>
                    <option value="lp">Gas LP</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">MURO ACTIVO</label>
                  <div className="text-xs py-2 px-2 bg-white border rounded text-gray-500">
                    {/* Visualizamos el muro donde está guardada la config, no necesariamente el activo actualmente */}
                    {gasConfig.wallIndex !== undefined ? `#${gasConfig.wallIndex + 1}` : 'Ninguno'}
                  </div>
                </div>
              </div>
              {/* Coordenadas Gas */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="number" placeholder="X" value={Math.round(gasConfig.x)} onChange={(e) => handleGasConfigChange('x', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                  <span className="text-[9px] text-gray-400 block text-center">Distancia X (mm)</span>
                </div>
                <div>
                  <input type="number" placeholder="Y" value={Math.round(gasConfig.z)} onChange={(e) => handleGasConfigChange('z', Number(e.target.value))} className="w-full text-xs border-gray-200 rounded py-1 text-center" />
                  <span className="text-[9px] text-gray-400 block text-center">Altura Y (mm)</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Compatibility;