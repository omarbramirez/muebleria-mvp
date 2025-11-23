import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Wallet,
  ShoppingBag,
  Truck,
  AlertCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";

// ... imports ...
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";

// Helper para formatear moneda (MXN/USD)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);
};


const Budget = () => {

  // "State Object" universal en Zustand
  // Estrategia de Integración (El Patrón "Sync")
  const { values, setValue } = usePreferenceWizardStore();

  // 1. HYDRATION: Si ya existe 'budget_config', lo usamos. Si no, default.
  const savedConfig = values.budget_config || {};

  // Estado Global del Presupuesto
  const [totalBudget, setTotalBudget] = useState(savedConfig.total || 85000);
  const [allocation, setAllocation] = useState(savedConfig.allocation || {
    furniture: 50000,
    appliances: 25000,
    services: 10000
  });

  // Recalcular total cuando cambian los parciales (o viceversa, dependiendo de la UX deseada)
  // Aquí usamos un enfoque simple: El slider principal escala todo, los inputs ajustan fino.

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseInt(e.target.value);
    setTotalBudget(newTotal);
    // Redistribución proporcional simple (60% / 30% / 10%)
    setAllocation({
      furniture: Math.round(newTotal * 0.6),
      appliances: Math.round(newTotal * 0.3),
      services: Math.round(newTotal * 0.1),
    });
  };

  // Lógica visual para determinar el "Nivel" del proyecto
  const getBudgetTier = (amount: number) => {
    if (amount < 40000) return { label: 'Económico / Essential', color: 'text-green-600', bg: 'bg-green-100' };
    if (amount < 120000) return { label: 'Estándar / Plus', color: 'text-blue-600', bg: 'bg-blue-100' };
    return { label: 'Premium / High-End', color: 'text-purple-600', bg: 'bg-purple-100' };
  };

  const tier = getBudgetTier(totalBudget);

  // 2. SYNC: Cada vez que cambie el presupuesto, actualizamos el Store Global
  useEffect(() => {
    setValue('budget_config', {
      total: totalBudget,
      allocation: allocation,
      tier: totalBudget < 40000 ? 'economy' : totalBudget < 120000 ? 'standard' : 'premium' // Guardamos el Tier también para la IA
    });
  }, [totalBudget, allocation, setValue]);

  return (
    <div className="p-6 shadow-sm bg-white h-full flex flex-col gap-6">

      {/* Header con Contexto */}
      <div className="flex items-start gap-3 mb-2">
        <div className="bg-primary/10 p-2 rounded-lg">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Define tu Inversión</h2>
          <p className="text-sm text-gray-500">
            Ajusta los rangos para que te mostremos materiales y equipos que se adapten a tu realidad financiera.
          </p>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: CONTROL MAESTRO */}
      <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-slate-600" />
            <span className="font-semibold text-slate-700">Presupuesto Total Objetivo</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tier.bg} ${tier.color}`}>
            {tier.label}
          </span>
        </div>

        <div className="flex items-end gap-2 mb-6">
          <DollarSign className="w-8 h-8 text-gray-400 mb-1" />
          <span className="text-4xl font-bold text-gray-900 tracking-tight">
            {formatCurrency(totalBudget)}
          </span>
        </div>

        <input
          type="range"
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          min="15000"
          max="300000"
          step="1000"
          value={totalBudget}
          onChange={handleTotalChange}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
          <span>$15k (Básico)</span>
          <span>$300k+ (Lujo)</span>
        </div>
      </section>

      {/* SECCIÓN DE DESGLOSE (BUCKETS) */}
      <section className="space-y-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Distribución Sugerida
        </h3>

        {/* Bucket: Mobiliario */}
        <div className="group relative">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              Mobiliario y Acabados
            </label>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(allocation.furniture)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Gabinetes, puertas, cubiertas y herrajes.</p>
        </div>

        {/* Bucket: Equipos */}
        <div className="group relative">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calculator className="w-4 h-4 text-orange-500" />
              Electrodomésticos
            </label>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(allocation.appliances)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Estufa, campana, refrigerador, tarja.</p>
        </div>

        {/* Bucket: Servicios */}
        <div className="group relative">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Truck className="w-4 h-4 text-green-600" />
              Logística e Instalación
            </label>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(allocation.services)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">Envío a domicilio y mano de obra técnica.</p>
        </div>
      </section>

      {/* Feedback Proactivo / Insight */}
      <div className="mt-auto bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <p className="text-xs text-yellow-800 leading-relaxed">
          <span className="font-bold">Tip de experto:</span> Con un presupuesto de {formatCurrency(allocation.furniture)} en mobiliario, te recomendamos optar por acabados en <strong>Melamina Texturizada</strong> en lugar de Madera Sólida para maximizar la durabilidad sin salirte del rango.
        </p>
      </div>

    </div>
  )
}

export default Budget