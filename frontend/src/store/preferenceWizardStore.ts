import { create } from 'zustand';

// 1. Tipado Estricto de los Valores Permitidos
// En lugar de 'any', definimos explícitamente qué tipos de datos puede manejar tu store.
// Esto satisface al linter y protege tu lógica.
export type WizardStoreValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | File[] 
  | null
  | undefined
  // Permitimos objetos genéricos controlados para sub-configuraciones, 
  // usando 'unknown' en lugar de 'any' para obligar a verificar el tipo antes de usarlo si fuera necesario.
  | Record<string, unknown>; 

// 2. Claves permitidas para anidación
type NestedCategory = 'space' | 'budget' | 'style';

// 3. Estructura del Store
interface WizardState {
  // --- DATOS ESTRUCTURADOS (Tipado Fuerte) ---
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
  
  // --- ESTADO PLANO (Legacy/Dinámico) ---
  // Reemplazamos Record<string, any> por Record<string, WizardStoreValue>
  values: Record<string, WizardStoreValue>; 
  
  // --- ACCIONES ---
  // El valor de entrada ahora está restringido por nuestro tipo
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
    // INGENIERÍA: Casting Seguro
    // TypeScript necesita saber que state[category] es un objeto que se puede expandir (...spread).
    // Usamos 'Record<string, unknown>' que es la versión segura de 'any' para objetos.
    // Esto le dice al compilador: "Sé que esto es un objeto con claves strings, 
    // aunque no conozco la forma exacta de sus valores en este momento genérico".
    const currentCategoryState = state[category] as Record<string, unknown>;
    
    return {
      [category]: { 
        ...currentCategoryState, 
        [key]: value 
      }
    };
  })
}));