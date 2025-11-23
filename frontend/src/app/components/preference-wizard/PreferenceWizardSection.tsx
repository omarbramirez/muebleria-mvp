"use client";

import React from "react";
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore"; 
import { StringSchema } from "yup";

// --- DEFINICIONES DE TIPOS (Domain Models) ---

export type FormValue = string | number | boolean | string[];

export type FieldChangeHandler = (fieldId: string, value: FormValue) => void;

export interface WizardOption {
  key: string;
  label: string;
  description?: string;
  imageUrl?: string | { src: string }; 
}

export interface WizardAppliance {
  key: string;
  label: string;
  fields?: string[]; 
}

export interface WizardOptionConfig {
  label: string;
  value: string | number; 
  key?: string; 
  imageUrl?: string | { src: string };
}

export interface WizardFieldConfig {
  id: string;
  name?: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'image-select';
  label: string;
  placeholder?: string;
  options?: WizardOptionConfig[];
  validation?: (value: FormValue) => string | null; 
}

export interface WizardSectionConfig {
  key: string; 
  title: string;
  description?: string;
  fields?: WizardFieldConfig[];
  options?: WizardOption[];       
  appliances?: WizardAppliance[]; 
}

// --- PROPS INTERFACE COMPARTIDA ---
interface InputHelperProps {
  id: string;
  field: WizardFieldConfig;
  value: FormValue | undefined; 
  onChange: FieldChangeHandler;
}

interface PreferenceWizardSectionProps {
  section: WizardSectionConfig;
  currentValues: Record<string, FormValue | undefined>;
  onChange: FieldChangeHandler; 
}


// Agrega esta función auxiliar fuera o dentro del componente
// Esta función actúa como un "Filtro de Seguridad"
const getSafeValue = (val: unknown): FormValue => {
  // 1. Si es undefined o null, devolvemos cadena vacía (para inputs controlados)
  if (val === undefined || val === null) return '';

  // 2. Si es un tipo primitivo válido, lo dejamos pasar
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  // 3. Si es un array de strings (ej. multiselect), lo dejamos pasar
  if (Array.isArray(val) && val.every(item => typeof item === 'string')) {
    return val as string[];
  }

  // 4. Si es cualquier otra cosa (File, Objeto complejo), devolvemos cadena vacía
  // para evitar que el renderizado se rompa.
  return '';
};

const PreferenceWizardSection = ({ section, currentValues, onChange }: PreferenceWizardSectionProps) => {
  const { values } = usePreferenceWizardStore();

  // Fusión de estrategia
  const effectiveValues = { ...values, ...currentValues };

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-1">{section.title}</h2>
      <p className="text-gray-600 mb-4">{section.description}</p>

      <div className="flex flex-col gap-6">

        {/* 1. RENDERIZADO DE OPCIONES */}
        {section.options && (
          <div className="grid grid-cols-1 gap-3">
            {section.options.map((opt) => {
              const isSingleSelect = ['project_type', 'budget', 'usage_profile', 'style', 'color_palette'].includes(section.key);
              const isSelected = Boolean(effectiveValues[opt.key]);

              return (
                <div
                  key={opt.key}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  onClick={() => {
                    if (isSingleSelect && section.options) {
                      section.options.forEach(o => {
                        if (o.key !== opt.key) onChange(o.key, false);
                      });
                      onChange(opt.key, true);
                    } else {
                      onChange(opt.key, !isSelected);
                    }
                  }}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                    {isSelected && <div className="w-3 h-3 bg-blue-600 rounded-full" />}
                  </div>
                  <div>
                    <span className="font-medium">{opt.label}</span>
                    {opt.description && <p className="text-sm text-gray-500">{opt.description}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 2. RENDERIZADO DE ELECTRODOMÉSTICOS (CORRECCIÓN APLICADA AQUÍ) */}
        {section.appliances && (
          <div className="grid grid-cols-1 gap-4">
            {section.appliances.map(app => (
              <div key={app.key} className="border p-4 rounded-lg bg-gray-50">
                <div className="font-bold mb-2">{app.label}</div>
                <div className="grid grid-cols-3 gap-3">
                  {/* Checkbox Principal */}
                  <label className="col-span-3 flex items-center gap-2 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={Boolean(effectiveValues[app.key])}
                      onChange={(e) => onChange(app.key, e.target.checked)}
                    />
                    Incluir este equipo
                  </label>

                  {/* Sub-campos dinámicos */}
                  {effectiveValues[app.key] && app.fields?.map(fieldKey => {
                    
                    // --- CORRECCIÓN DE TIPO ---
                    // Extraemos el valor crudo
                    const rawValue = effectiveValues[`${app.key}_${fieldKey}`];
                    
                    // Sanitizamos: Solo permitimos string o number. Si es otra cosa, usamos ''
                    const safeInputValue = (typeof rawValue === 'string' || typeof rawValue === 'number') 
                        ? rawValue 
                        : '';

                    return (
                        <div key={fieldKey}>
                        <label className="text-xs text-gray-500 capitalize">{fieldKey.replace('_', ' ')}</label>
                        <input
                            type="number"
                            className="w-full border rounded p-1 text-sm"
                            // Usamos el valor sanitizado
                            value={safeInputValue}
                            onChange={(e) => onChange(`${app.key}_${fieldKey}`, Number(e.target.value))}
                        />
                        </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

{/* 3. RENDERIZADO DE CAMPOS MANUALES (CORREGIDO) */}
        {section.fields?.map((field, index) => {
           // Extraemos el valor crudo
           const rawValue = effectiveValues[field.name || field.id];
           
           return (
            <FieldRenderer
                // Usamos String() para la key para asegurar unicidad
                key={String(field.id || field.name || index)}
                field={field}
                sectionId={section.key}
                onChange={onChange}
                
                // CORRECCIÓN AQUÍ: Usamos el sanitizador
                // Esto garantiza que FieldRenderer SIEMPRE reciba un FormValue válido
                value={getSafeValue(rawValue)}
            />
           );
        })}

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// RENDERIZADOR PRINCIPAL DE CAMPOS
// -----------------------------------------------------------------------------

interface FieldRendererProps {
  field: WizardFieldConfig;
  sectionId: string;
  value: FormValue;
  onChange: FieldChangeHandler;
}

const FieldRenderer = ({ field, sectionId, onChange, value }: FieldRendererProps) => {
  const fieldId = field.name || field.id;

  if (field.type === 'image-select') {
    return <ImageSelectField id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'select') {
    return <SelectField id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'number') {
    return <InputNumber id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = field.type === 'checkbox' ? e.target.checked : e.target.value;
    onChange(fieldId, newValue);
  };

  if (field.type === 'checkbox') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={handleNativeChange}
          className="h-4 w-4"
        />
        <label className="text-sm">{field.label}</label>
      </div>
    );
  }

  // Default Text Input
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{field.label}</label>
      <input
        type={field.type}
        value={String(value || '')}
        onChange={handleNativeChange}
        placeholder={field.placeholder}
        className="border p-2 rounded"
      />
    </div>
  );
};

export default PreferenceWizardSection;

// -----------------------------------------------------------------------------
// INPUTS HELPER COMPONENTS
// -----------------------------------------------------------------------------

function InputNumber({ id, field, value, onChange }: InputHelperProps) {
  
  // Lógica de Sanitización también aquí para reutilización
  const safeValue = (typeof value === 'number' || typeof value === 'string') 
    ? value 
    : '';

  return (
    <div>
      <label className="block text-sm mb-1 font-medium">{field.label}</label>
      <input
        type="number"
        className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
        value={safeValue} 
        onChange={(e) => {
            const val = e.target.value;
            onChange(id, val === '' ? '' : Number(val));
        }}
      />
    </div>
  );
}

function SelectField({ id, field, value, onChange }: InputHelperProps) {
  return (
    <div>
      <label className="block text-sm mb-1 font-medium">{field.label}</label>
      <select
        className="border px-3 py-2 rounded w-full"
        value={String(value ?? '')} 
        onChange={(e) => onChange(id, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        {field.options?.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ImageSelectField({ id, field, onChange, value }: InputHelperProps) {
  return (
    <div>
      <label className="block text-sm mb-2 font-medium">{field.label}</label>
      <div className="grid grid-cols-2 gap-4">
        {field.options?.map((opt) => (
          <div
            key={opt.key}
            onClick={() => onChange(id, opt.key as string)}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${value === opt.key ? 'ring-2 ring-blue-500 border-transparent' : 'hover:border-gray-400'
              }`}
          >
            {opt.imageUrl && (
              <img
                src={typeof opt.imageUrl === 'string' ? opt.imageUrl : opt.imageUrl.src}
                alt={opt.label}
                className="h-32 w-full object-cover"
              />
            )}
            <p className="p-2 text-center text-sm bg-white">{opt.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}