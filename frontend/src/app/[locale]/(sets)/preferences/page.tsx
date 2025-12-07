'use client'
import React, { useState } from 'react'
import PageLayout from "@/components/layout/PageLayout";
import { PREFERENCE_WIZARD_ITEMS, WizardSection, ApplianceOption } from "@/app/assets/assets";
import { Heading } from '@/components/ui/Heading';
import { Paragraph } from '@/components/ui/Paragraph';
import { LinkItem } from "@/components/ui/LinkItem";
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { usePreferenceWizardStore } from '@/store/preferenceWizardStore';
import Image from 'next/image';

// --- DEFINICIONES DE TIPOS LOCALES ---

// Type Guard para appliances
interface SectionWithAppliances extends WizardSection {
  appliances: ApplianceOption[];
}

const Preferences = () => {
  const [activeSection, setActiveSection] = useState<string>('project_type'); // Inicialización segura
  const [openWizardSections, setWizardSections] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // Zustand store
  const { values, setValue } = usePreferenceWizardStore();

  /** * TYPE GUARD (Ingeniería de Tipos)
   * Verifica en tiempo de ejecución si una sección tiene la propiedad 'appliances'.
   * Si retorna true, TypeScript sabe que dentro del if, 'section' tiene 'appliances'.
   */
  const sectionHasAppliances = (section: WizardSection): section is SectionWithAppliances => {
    return Array.isArray(section.appliances) && section.appliances.length > 0;
  };

  /** Activador del aside */
  function wizardSectionActivator() {
    setWizardSections(!openWizardSections);
  }

  /** Validaciones de dimensiones numéricas */
  const validateDimensions = (fields: Record<string, number | ''>) => {
    const errs: Record<string, string> = {};
    for (const key in fields) {
      const value = fields[key];
      if (value === '' || value === null || value === undefined) {
        errs[key] = 'Requerido';
      } else if (typeof value === 'number' && (value <= 0 || value > 50)) {
        errs[key] = 'Valor fuera de rango (0-50m)';
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
  const validateSection = (sectionKey: string): boolean => {
    const section = PREFERENCE_WIZARD_ITEMS.find(s => s.key === sectionKey);
    if (!section) return true;

    let sectionErrors: Record<string, string> = {};

    // Validación de Campos Numéricos
    if (section.fields) {
      const fieldsValues: Record<string, number | ''> = {};
      section.fields.forEach(f => {
        const rawVal = values[f.name];
        fieldsValues[f.name] = (typeof rawVal === 'number') ? rawVal : '';
      });
      sectionErrors = validateDimensions(fieldsValues);
    }

    // Validación de Archivos (Simplificada para el ejemplo)
    if (section.upload) {
      // Lógica de validación de archivo existente...
    }

    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  };

  const handleNext = (currentIndex: number) => {
    if (!validateSection(activeSection)) return;
    const nextSection = PREFERENCE_WIZARD_ITEMS[currentIndex + 1];
    if (nextSection) setActiveSection(nextSection.key);
    else if (activeSection === 'constraints') router.push('/generation/area');
  };

  /** Manejo de cambios de input de dimensiones */
  const handleDimensionChange = (name: string, value: string) => {
    const numericValue = value === '' ? '' : Number(value);
    setValue(name, numericValue); // Ahora es compatible con WizardStoreValue (number | string)

    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  /** Manejo de archivos */
  /** Manejo de archivos */
  const handleFileChange = (sectionKey: string, file: File | null) => {
    // Necesitamos envolver el File en un array si tu store espera File[] 
    // O si espera File | null, pasarlo directo. 
    // Asumiendo que WizardStoreValue acepta File | null.
    // RECOMENDACIÓN: Asegúrate que WizardStoreValue incluya 'File' en su definición.
    setValue(sectionKey, file); // CORRECCIÓN: Eliminado el 'as any'

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
                <div className={
                  // Lógica de clases condicionales basada en el layout
                  section.layout === 'grid-3' ? "grid grid-cols-1 md:grid-cols-3 gap-6" :
                    section.layout === 'grid-2' ? "grid grid-cols-1 md:grid-cols-2 gap-6" :
                      "space-y-4" // Layout por defecto (lista)
                }>
                  {section.options.map((option, idx) => {
                    const isSingleSelect = !['appliances', 'new_appliances'].includes(section.key); // Lógica de selección
                    const isSelected = Boolean(values[option.key]);

                    return (
                      <div
                        key={`option-${idx}`}
                        onClick={() => {
                          if (isSingleSelect) {
                            section.options?.forEach(opt => setValue(opt.key, false));
                            setValue(option.key, true);
                          } else {
                            setValue(option.key, !values[option.key]);
                          }
                        }}
                        className={`
                          group relative cursor-pointer transition-all duration-200 rounded-xl border-2 overflow-hidden
                          ${isSelected
                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                            : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'}
                        `}
                      >
                        {/* ZONA DE IMAGEN (Solo si existe imageSrc) */}
                        {option.imageSrc && (
                          <div className="w-full h-40 bg-gray-100 relative overflow-hidden border-b border-gray-100">
                            <Image
                              src={option.imageSrc}
                              alt={option.label}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105 object-contain! bg-white"
                            />
                            {/* Overlay de selección visual */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-600/10 flex items-center justify-center">
                                <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONTENIDO TEXTUAL */}
                        <div className="p-4 flex items-start gap-3">
                          {/* Checkbox/Radio visual (oculto si hay imagen y está seleccionado para limpieza visual, opcional) */}
                          <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0
                                ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'}
                            `}>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>

                          <div>
                            <span className={`block font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {option.label}
                            </span>
                            {option.description && (
                              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}




              {/* CASO 2: ELECTRODOMÉSTICOS (SOLUCIÓN TYPE GUARD) */}
              {/* Usamos el Type Guard para confirmar que 'appliances' existe y es un array */}
              {sectionHasAppliances(section) && (
                <div className="grid grid-cols-1 gap-4">
                  {section.appliances.map((appliance) => (
                    <div key={appliance.key} className="border p-4 rounded-xl bg-white">
                      <h4 className="font-bold mb-2">{appliance.label}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {appliance.fields?.map((fieldKey) => (
                          <div key={fieldKey}>
                            <label className="text-xs text-gray-500 capitalize">{fieldKey.replace('_', ' ')}</label>
                            <input
                              type="number"
                              placeholder="0"
                              // Casting seguro a string o number para el value
                              value={String(values[`${appliance.key}_${fieldKey}`] || '')}
                              onChange={(e) => setValue(`${appliance.key}_${fieldKey}`, Number(e.target.value))}
                              className="w-full border rounded p-1 text-sm"
                            />
                          </div>
                        ))}

                        {/* Checkbox simple si no hay campos adicionales */}
                        {!appliance.fields && (
                          <div className="col-span-3 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(values[appliance.key])}
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

              {/* CASO 3: CAMPOS DE TEXTO / NUMÉRICOS */}
              {section.fields?.map(field => (
                <div key={field.name} className="mb-4">
                  <label className="block text-sm font-medium mb-1 text-gray-700">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.type}
                      // Conversión explícita a string para el input
                      value={String(values[field.name] ?? '')}
                      onChange={e => handleDimensionChange(field.name, e.target.value)}
                      className={`border p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
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
                {section.key === 'constraints' ? 'Finalizar' : 'Siguiente'}
              </Button>

            </section>
          ))}

        </div>

        {/* ASIDE: navegación derecha */}
        <aside
          id="wizard-sections"
          className={`w-74 h-full flex flex-col gap-4 absolute top-0 py-20 drop-shadow-xl overflow-y-scroll ${openWizardSections ? 'right-0' : 'right-[-65%]'
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