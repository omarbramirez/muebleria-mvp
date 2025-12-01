import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Wallet,
  ShoppingBag,
  Truck,
  AlertTriangle, // Icono de alerta para el conflicto
  TrendingUp,
  DollarSign,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// Helper moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
};

const Budget = () => {
  const {
    budget,
    setBudgetLimit,
    recalculateProjectCost,
    applyBudgetOptimization
  } = usePreferenceWizardStore();

  // Estado local para el slider (para que sea fluido)
  const [localLimit, setLocalLimit] = useState(budget.limit);

  // Estado para el Pop-up de Conflicto
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);

  // Al montar, recalculamos el costo real del proyecto basado en lo que el usuario ya diseñó
  useEffect(() => {
    recalculateProjectCost();
    setLocalLimit(budget.limit);
  }, [recalculateProjectCost, budget.limit]);

  // Manejador del Slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setLocalLimit(val);
  };

  // Manejador al SOLTAR el slider (MouseUp) - Aquí ocurre la validación mágica
  const handleSliderCommit = () => {
    // 1. Actualizamos el store
    setBudgetLimit(localLimit);

    // 2. VALIDACIÓN: ¿El nuevo límite es menor al costo real de lo que ya diseñó?
    if (localLimit < budget.currentCost) {
      setShowOptimizationModal(true);
    }
  };

  // Acción del Pop-up: ACEPTAR AJUSTE
  const handleOptimize = () => {
    applyBudgetOptimization(); // Borra cosas del store
    setShowOptimizationModal(false);
    recalculateProjectCost(); // Actualiza el precio mostrado
  };

  // Acción del Pop-up: CANCELAR (Revertir slider)
  const handleCancel = () => {
    setLocalLimit(budget.currentCost); // Regresa el slider al mínimo necesario
    setBudgetLimit(budget.currentCost);
    setShowOptimizationModal(false);
  };

  // Cálculos visuales de la barra
  const percentageUsed = Math.min(100, (budget.currentCost / localLimit) * 100);
  const isOverBudget = budget.currentCost > localLimit;

  return (
    <div className="p-6 shadow-sm bg-white h-full flex flex-col gap-6 relative overflow-hidden">

      {/* --- MODAL DE OPTIMIZACIÓN (Conflict Resolution) --- */}
      {showOptimizationModal && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Ajuste de Presupuesto Requerido</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            El diseño actual cuesta <strong className="text-gray-900">{formatCurrency(budget.currentCost)}</strong>,
            pero tu nuevo límite es de <strong className="text-gray-900">{formatCurrency(localLimit)}</strong>.
          </p>

          <div className="bg-gray-50 p-4 rounded-lg text-left text-xs text-gray-600 w-full mb-6 border border-gray-200">
            <p className="font-semibold mb-2">Sugerencia de Optimización:</p>
            <ul className="space-y-1 list-disc pl-4">
              <li>Reemplazar encimeras de Mármol por Granito.</li>
              <li>Eliminar lavavajillas (no esencial).</li>
              <li>Simplificar herrajes de gabinetes.</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleOptimize}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Aplicar Ajustes Automáticos
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm transition-all"
            >
              Cancelar y Mantener Diseño
            </button>
          </div>
        </div>
      )}

      {/* --- UI PRINCIPAL --- */}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Define tu Inversión</h2>
          <p className="text-sm text-gray-500">
            El diseño actual cuesta: <span className="font-bold text-blue-600">{formatCurrency(budget.currentCost)}</span>
          </p>
        </div>
      </div>

      {/* Control Maestro */}
      <section className={`border rounded-xl p-5 transition-colors duration-300 ${isOverBudget ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Tu Límite Máximo</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
            ${localLimit < 40000 ? 'bg-green-100 text-green-700' : localLimit < 120000 ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
            {localLimit < 40000 ? 'Económico' : localLimit < 120000 ? 'Estándar' : 'Premium'}
          </span>
        </div>

        <div className="flex items-end gap-2 mb-6">
          <DollarSign className="w-8 h-8 text-gray-400 mb-1" />
          <span className="text-4xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(localLimit)}
          </span>
        </div>

        {/* Input Range */}
        <div className="relative w-full h-6 flex items-center">
          {/* Track de fondo */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
            {/* Barra de "Costo Actual" (Visualización de qué tanto del presupuesto se come el diseño) */}
            <div
              className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <input
            type="range"
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
            min="15000"
            max="650000"
            step="5000"
            value={localLimit}
            onChange={handleSliderChange}
            onMouseUp={handleSliderCommit} // <--- AQUÍ SE DISPARA LA VALIDACIÓN
            onTouchEnd={handleSliderCommit}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-3 font-medium">
          <span>Min: $15k</span>
          <span className={isOverBudget ? "text-red-500 font-bold" : "text-gray-500"}>
            Uso: {percentageUsed.toFixed(0)}%
          </span>
          <span>Max: $300k</span>
        </div>
      </section>

      {/* Desglose de Gastos (Proyección basada en el límite) */}
      <section className="space-y-4 opacity-75 hover:opacity-100 transition-opacity">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-3 h-3" />
          Distribución Proyectada
        </h3>

        {/* Mobiliario */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Mobiliario (60%)</span>
            <span className="font-bold">{formatCurrency(localLimit * 0.6)}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Electrodomésticos */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Equipos (30%)</span>
            <span className="font-bold">{formatCurrency(localLimit * 0.3)}</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Budget;