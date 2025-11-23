import { create } from 'zustand';

// 1. TIPO RECURSIVO (La solución definitiva a 'any')
// Este tipo define exactamente qué es un dato válido en tu aplicación.
// Al ser recursivo, permite objetos anidados sin usar 'any' ni 'unknown'.
export type WizardStoreValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined 
  | File[]
  | File          // <--- IMPORTANTE: Permitir archivos
  | null
  | WizardStoreValue[] 
  | { [key: string]: WizardStoreValue };

// 2. Claves para anidación
type NestedCategory = 'space' | 'budget' | 'style';

// 3. Estructura del Store
interface WizardState {
  // --- DATOS ESTRUCTURADOS ---
  space: {
    dimensions: { width: number; length: number; height: number };
    constraints: { windowWall: string; doorWall: string };
    files: File[];
  };
  budget: {
    range: string;
    strict: boolean;
  };
  installations: string[];
  style: {
    look: string;
    palette: string;
  };
  
  // --- ESTADO DINÁMICO ---
  // Aquí usamos el tipo recursivo. TypeScript ya no se quejará de 'any'.
  values: Record<string, WizardStoreValue>; 
  
  // --- ACCIONES ---
  setValue: (key: string, value: WizardStoreValue) => void;
  setNestedValue: (category: NestedCategory, key: string, value: WizardStoreValue) => void; 
}

export const usePreferenceWizardStore = create<WizardState>((set) => ({
  // Inicialización
  space: { 
    dimensions: { width: 0, length: 0, height: 0 }, 
    constraints: { windowWall: '', doorWall: '' }, 
    files: [] 
  },
  budget: { range: '', strict: false },
  installations: [],
  style: { look: '', palette: '' },
  values: {},

  // Setter Plano
  setValue: (key, value) => set((state) => ({
    values: { ...state.values, [key]: value }
  })),

  // Setter Anidado
  setNestedValue: (category, key, value) => set((state) => {
    // INGENIERÍA: Aserción de Tipo Controlada
    // 1. Obtenemos la sección del estado.
    // 2. Forzamos a TypeScript a tratarlo como un objeto indexable genérico para permitir la escritura dinámica.
    // 3. 'as unknown' rompe la inferencia inicial, y 'as Record...' define la forma segura.
    const targetSection = state[category] as unknown as Record<string, WizardStoreValue>;

    return {
      [category]: {
        ...targetSection,
        [key]: value
      }
    } as Partial<WizardState>; // Hacemos cast del retorno para asegurar coincidencia con el Store
  })
}));