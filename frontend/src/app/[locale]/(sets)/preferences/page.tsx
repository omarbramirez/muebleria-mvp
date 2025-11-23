'use client'
import React, { useState } from 'react'
import PageLayout from "@/app/components/ui/PageLayout";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";
import { Button } from '@/app/components/ui/Button';
import { useRouter } from 'next/navigation';
import { usePreferenceWizardStore } from '@/store/preferenceWizardStore';

interface DimensionFields {
  [key: string]: number | '';
}

interface FileFields {
  [key: string]: File | null;
}

const Preferences = () => {
  const [activeSection, setActiveSection] = useState(PREFERENCE_WIZARD_ITEMS[0]?.key);
  const [openWizardSections, setWizardSections] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Zustand store
  const { values, setValue } = usePreferenceWizardStore();

  /** Activador del aside */
  function wizardSectionActivator() {
    setWizardSections(!openWizardSections);
  }

  /** Validaciones de dimensiones numéricas */
  const validateDimensions = (fields: DimensionFields) => {
    const errs: Record<string, string> = {};
    for (const key in fields) {
      const value = fields[key];
      if (value === '' || value === null || value === undefined) {
        errs[key] = 'Este campo es obligatorio';
      } else if (isNaN(Number(value))) {
        errs[key] = 'Debe ser un número';
      } else if (Number(value) <= 0) {
        errs[key] = 'Debe ser mayor que cero';
      } else if (Number(value) > 50) {
        errs[key] = 'Valor demasiado grande';
      }
    }
    return errs;
  };

  /** Validación de archivos */
  const validateFileUpload = (file: File | null) => {
    if (!file) return 'Debe subir un archivo';
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) return 'Tipo de archivo no permitido';
    const maxSizeMB = 5;
    if (file.size / 1024 / 1024 > maxSizeMB) return `Archivo demasiado grande. Máximo ${maxSizeMB} MB`;
    return null;
  };

  /** Validación general de sección */
  const validateSection = (sectionKey: string) => {
    const section = PREFERENCE_WIZARD_ITEMS.find(s => s.key === sectionKey);
    let sectionErrors: Record<string, string> = {};

    if (!section) return true;

    if (section.fields) {
      const fieldsValues: DimensionFields = {};
      section.fields.forEach(f => {
        fieldsValues[f.name] = values[f.name] ?? '';
      });
      sectionErrors = validateDimensions(fieldsValues);
    }

    if (section.upload) {
      const file = values[section.key] || null;
      const fileError = validateFileUpload(file);
      if (fileError) sectionErrors['file'] = fileError;
    }

    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  };

  /** Maneja el avance a la siguiente sección */
  const handleNext = (currentIndex: number) => {
    if (!validateSection(activeSection)) return;

    const nextSection = PREFERENCE_WIZARD_ITEMS[currentIndex + 1];
    if (nextSection) {
      setActiveSection(nextSection.key);
    } else if (activeSection === 'materials') {
      router.push('/generation/area');
    }
  };

  /** Manejo de cambios de input de dimensiones */
  const handleDimensionChange = (name: string, value: string) => {
    const numericValue = value === '' ? '' : Number(value);
    setValue(name, numericValue); // sincroniza con Zustand
    // actualizar errores en tiempo real si quieres
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  /** Manejo de archivos */
  const handleFileChange = (sectionKey: string, file: File | null) => {
    setValue(sectionKey, file); // sincroniza con Zustand
    const fileError = validateFileUpload(file);
    setErrors(prev => ({ ...prev, file: fileError || '' }));
  };

  return (
    <PageLayout>
      <div className="w-full min-h-screen flex flex-row items-start justify-between gap-12 relative overflow-hidden px-10 pr-20">

        <div className="w-full min-h-screen flex-1 pt-10 text-left">

          {PREFERENCE_WIZARD_ITEMS.filter(
            section => section.key === activeSection
          ).map((section, index) => (
            <section key={`module-${section.key}`} className="animate-fadeIn transition-all duration-500 pt-20">

              {/* TÍTULO */}
              <Heading as="h2" variant="primary" size="lg" hierarchy="forContent" className='text-left'>
                {section.title}
              </Heading>

              {/* DESCRIPCIÓN */}
              <Paragraph variant="primary" size="md" className="mb-6 text-left">
                {section.description}
              </Paragraph>

{/* --------------------------------------------------------- */}
{/* LOGICA DE RENDERIZADO MEJORADA (Soporta Radios y Arrays)  */}
{/* --------------------------------------------------------- */}

{/* CASO 1: OPCIONES SIMPLES (Checkboxes o Radios) */}
{section.options && (
  <ul className="space-y-4">
    {section.options.map((option, idx) => {
      // Detectar si esta sección debería ser de selección única (Radio)
      // Hack rápido: Si la sección es "project_type", "budget", "usage", actúa como Radio.
      const isSingleSelect = ['project_type', 'budget', 'usage_profile', 'style'].includes(section.key);
      
      return (
        <li 
          key={`option-${idx}`} 
          className={`p-4 rounded-2xl cursor-pointer transition-all border ${
            values[option.key] ? 'bg-blue-50 border-blue-500' : 'hover:bg-neutral-100 border-transparent'
          }`}
          // Hacemos que todo el li sea clicable
          onClick={() => {
             if (isSingleSelect) {
               // Desmarcar hermanos y marcar este
               section.options?.forEach(opt => setValue(opt.key, false));
               setValue(option.key, true);
             } else {
               // Toggle normal
               setValue(option.key, !values[option.key]);
             }
          }}
        >
          <div className="flex items-center gap-3">
            <input
              type={isSingleSelect ? "radio" : "checkbox"}
              name={section.key} // Agrupa los radios
              id={`${section.key}-${option.key}`}
              checked={values[option.key] || false}
              onChange={() => {}} // Manejado por el onClick del li
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <label htmlFor={`${section.key}-${option.key}`} className="font-medium cursor-pointer">
                {option.label}
              </label>
              {option.description && (
                <p className="text-sm text-gray-500 mt-1">{option.description}</p>
              )}
            </div>
          </div>
        </li>
      );
    })}
  </ul>
)}

{/* CASO 2: ELECTRODOMÉSTICOS (Recuperando la data perdida) */}
{/* Nota: Debes agregar 'appliances' a la interfaz de tus items en assets o usar 'any' temporalmente */}
{(section as any).appliances && (
  <div className="grid grid-cols-1 gap-4">
    {(section as any).appliances.map((appliance: any) => (
       <div key={appliance.key} className="border p-4 rounded-xl bg-white">
          <h4 className="font-bold mb-2">{appliance.label}</h4>
          <div className="grid grid-cols-3 gap-2">
             {appliance.fields?.map((fieldKey: string) => (
                <div key={fieldKey}>
                   <label className="text-xs text-gray-500 capitalize">{fieldKey.replace('_', ' ')}</label>
                   <input 
                      type="number"
                      placeholder="0"
                      // Guardamos como: refrigerador_ancho_cm
                      value={values[`${appliance.key}_${fieldKey}`] || ''}
                      onChange={(e) => setValue(`${appliance.key}_${fieldKey}`, Number(e.target.value))}
                      className="w-full border rounded p-1 text-sm"
                   />
                </div>
             ))}
             {/* Si no tiene campos, es un checkbox simple (ej. tiene lavavajillas o no) */}
             {!appliance.fields && (
                <div className="col-span-3 flex items-center gap-2">
                   <input 
                      type="checkbox"
                      checked={values[appliance.key] || false}
                      onChange={(e) => setValue(appliance.key, e.target.checked)}
                   />
                   <span className="text-sm">Incluir en diseño</span>
                </div>
             )}
          </div>
       </div>
    ))}
  </div>
)}

{/* CASO 3: CAMPOS DE TEXTO / NUMÉRICOS (Inputs estándar) */}
{section.fields?.map(field => (
  <div key={field.name} className="mb-4">
    <label className="block text-sm font-medium mb-1 text-gray-700">{field.label}</label>
    <div className="relative">
        <input
          type={field.type}
          value={values[field.name] ?? ''}
          onChange={e => handleDimensionChange(field.name, e.target.value)}
          className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
             errors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {field.name.includes('_m') && <span className="absolute right-3 top-3 text-gray-400 text-sm">mts</span>}
    </div>
    {errors[field.name] && <p className="text-red-500 text-xs mt-1 ml-1">{errors[field.name]}</p>}
  </div>
))}

              {/* UPLOAD */}
              {section.upload && (
                <div className="mb-4">
                  <input
                    type="file"
                    onChange={e => handleFileChange(section.key, e.target.files?.[0] || null)}
                    className="border p-2 rounded w-full"
                  />
                  {errors.file && <p className="text-red-500">{errors.file}</p>}
                </div>
              )}

              {/* BOTÓN SIGUIENTE */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleNext(index)}
              >
                {section.key === 'materials' ? 'Finalizar' : 'Siguiente'}
              </Button>

            </section>
          ))}

        </div>

        {/* ASIDE: navegación derecha */}
        <aside
          id="wizard-sections"
          className={`w-74 h-full flex flex-col gap-4 absolute top-0 py-20 drop-shadow-xl overflow-y-scroll ${
            openWizardSections ? 'right-0' : 'right-[-65%]'
          }`}
          onClick={() => wizardSectionActivator()}
        >
          {PREFERENCE_WIZARD_ITEMS.map(section => {
            const isActive = activeSection === section.key;
            return (
              <div key={`nav-${section.key}`} className="w-full px-2">
                <LinkItem
                  as="button"
                  size="lg"
                  variant={isActive ? "secondary" : "primary"}
                  onClick={() => setActiveSection(section.key)}
                  className="!block w-full text-left !whitespace-normal !break-words !flex-wrap leading-snug text-right"
                >
                  {section.title}
                </LinkItem>
              </div>
            );
          })}
        </aside>

      </div>
    </PageLayout>
  );
};

export default Preferences;
