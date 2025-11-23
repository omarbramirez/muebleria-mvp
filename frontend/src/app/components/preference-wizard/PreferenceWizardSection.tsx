"use client";

import React from "react";
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore"; // Importamos el store aquí para leer valores
import { StringSchema } from "yup";

// --- DEFINICIONES DE TIPOS (Domain Models) ---

// 1. Definimos qué valores acepta tu formulario. 
// Evitamos 'any' para mantener control sobre los datos primitivos.
export type FormValue = string | number | boolean | string[];

// 2. Definimos la firma de la función onChange.
// Esto estandariza cómo todos los inputs reportan cambios hacia arriba.
export type FieldChangeHandler = (fieldId: string, value: FormValue) => void;


// Definimos la estructura de una Opción (para Radios/Cards)
export interface WizardOption {
  key: string;
  label: string;
  description?: string;
  imageUrl?: string | { src: string }; // Soporte para string directo o objeto importado
}

// Definimos la estructura de un Electrodoméstico
export interface WizardAppliance {
  key: string;
  label: string;
  fields?: string[]; // IDs de campos adicionales si se selecciona
}

export interface WizardOptionConfig {
  label: string;
  // Permitimos que el valor sea string o number
  value: string | number; 
  // Opcional: Si en el futuro necesitas un ID distinto al valor (ej. key interna de BD)
  key?: string; 
  imageUrl?: string | { src: string };
}

// 3. Modelo de un Campo (Field)
export interface WizardFieldConfig {
  id: string;
  name?: string;
 type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | 'image-select';
  label: string;
  placeholder?: string;
  options?: WizardOptionConfig[];
  validation?: (value: FormValue) => string | null; // Opcional: validación inline
}

// Modelo de una Sección (Actualizado con lo que usas en JSX)
export interface WizardSectionConfig {
  key: string; // Usas .key en el JSX para identificar la sección
  title: string;
  description?: string;
  fields?: WizardFieldConfig[];
  options?: WizardOption[];       // Faltaba en tu definición original
  appliances?: WizardAppliance[]; // Faltaba en tu definición original
}

// --- PROPS INTERFACE COMPARTIDA ---
interface InputHelperProps {
  id: string;
  field: WizardFieldConfig;
  value: FormValue | undefined; // Puede ser undefined antes de que el usuario interactúe
  onChange: FieldChangeHandler;
}


// --- PROPS INTERFACE ---
interface PreferenceWizardSectionProps {
  section: WizardSectionConfig;
  // Si este componente solo renderiza, quizás reciba los valores desde el padre,
  // o quizás se conecta al store. Asumiremos que es "Controlado" desde el padre para este ejemplo.
  currentValues: Record<string, any>;
  onChange: FieldChangeHandler; // <--- AQUÍ SOLUCIONAMOS EL ERROR
}
const PreferenceWizardSection = ({ section, currentValues, onChange }: PreferenceWizardSectionProps) => {
  const { values } = usePreferenceWizardStore();

  // Fusión de estrategia: Usamos values del store si existen, o props
  const effectiveValues = { ...values, ...currentValues };

  return (
    <div className="p-6 border rounded-xl bg-white shadow-sm mb-6">
      <h2 className="text-xl font-bold mb-1">{section.title}</h2>
      <p className="text-gray-600 mb-4">{section.description}</p>

      <div className="flex flex-col gap-6">

        {/* 1. RENDERIZADO DE OPCIONES (Radios/Checkboxes tipo Card) */}
        {section.options && (
          <div className="grid grid-cols-1 gap-3">
            {section.options.map((opt) => {
              // Inferencia de tipo para las secciones de selección única
              const isSingleSelect = ['project_type', 'budget', 'usage_profile', 'style', 'color_palette'].includes(section.key);
              const isSelected = Boolean(effectiveValues[opt.key]);

              return (
                <div
                  key={opt.key}
                  className={`p-4 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  onClick={() => {
                    if (isSingleSelect && section.options) {
                      // Lógica de Radio: Desmarcar otros
                      section.options.forEach(o => {
                        if (o.key !== opt.key) onChange(o.key, false);
                      });
                      onChange(opt.key, true);
                    } else {
                      // Lógica de Checkbox
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

        {/* 2. RENDERIZADO DE ELECTRODOMÉSTICOS */}
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
                  {effectiveValues[app.key] && app.fields?.map(fieldKey => (
                    <div key={fieldKey}>
                      <label className="text-xs text-gray-500 capitalize">{fieldKey.replace('_', ' ')}</label>
                      <input
                        type="number"
                        className="w-full border rounded p-1 text-sm"
                        value={effectiveValues[`${app.key}_${fieldKey}`] || ''}
                        onChange={(e) => onChange(`${app.key}_${fieldKey}`, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. RENDERIZADO DE CAMPOS MANUALES */}
        {section.fields?.map((field, index) => (
          <FieldRenderer
            // SOLUCIÓN: Usamos String() para asegurar un primitivo.
            // Añadimos 'index' como fallback de último recurso para garantizar unicidad absoluta.
            key={String(field.id || field.name || index)}

            field={field}
            sectionId={section.key}
            onChange={onChange}

            // Para el value también es buena práctica asegurar el índice
            value={effectiveValues[field.name || field.id]}
          />
        ))}

      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// RENDERIZADOR PRINCIPAL DE CAMPOS
// -----------------------------------------------------------------------------

// Reutilizamos la interfaz definida anteriormente
interface FieldRendererProps {
  field: WizardFieldConfig;
  sectionId: string;
  value: FormValue;
  onChange: FieldChangeHandler;
}

const FieldRenderer = ({ field, sectionId, onChange, value }: FieldRendererProps) => {
  // Identificador único compuesto si es necesario, o usar field.id directo
  const fieldId = field.name || field.id;

  // Delegación a componentes especializados
  // Esto mantiene el código limpio y modular
  if (field.type === 'image-select') {
    return <ImageSelectField id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'select') {
    return <SelectField id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'number') {
    return <InputNumber id={fieldId} field={field} value={value} onChange={onChange} />;
  }

  // Fallback para texto y checkboxes simples
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
// INPUTS CORREGIDOS (Tipado Estricto)
// -----------------------------------------------------------------------------

// Aplicamos la interfaz InputHelperProps para resolver los 'implicit any'

function InputNumber({ id, field, value, onChange }: InputHelperProps) {
  
  // LÓGICA DE SANITIZACIÓN (Type Narrowing):
  // Si el valor llega como boolean (false/true) o array (por error de estado),
  // lo convertimos a cadena vacía para no romper el input numérico.
  const safeValue = (typeof value === 'number' || typeof value === 'string') 
    ? value 
    : '';

  return (
    <div>
      <label className="block text-sm mb-1 font-medium">{field.label}</label>
      <input
        type="number"
        className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-500 outline-none"
        
        // SOLUCIÓN: Usamos el valor sanitizado
        value={safeValue} 
        
        // Opcional: Manejo robusto de NaN en el cambio
        onChange={(e) => {
            const val = e.target.value;
            // Si está vacío, podríamos querer enviar '' o undefined, no 0
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
        value={String(value ?? '')} // Forzamos string para el value del select
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
            // Aseguramos que onChange reciba el tipo correcto (string o number según tu modelo)
            onClick={() => onChange(id, opt.key as string)}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${value === opt.key ? 'ring-2 ring-blue-500 border-transparent' : 'hover:border-gray-400'
              }`}
          >
            {opt.imageUrl && (
              <img
                // Validación segura del tipo de imagen
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