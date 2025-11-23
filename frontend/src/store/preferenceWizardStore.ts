import { create } from 'zustand';

// 1. Definimos las claves permitidas para anidación (para evitar errores con las funciones)
type NestedCategory = 'space' | 'budget' | 'style';

// Definir la estructura REAL que necesita tu motor de diseño
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
  
  // --- ESTADO PLANO (Legacy/Rápido) ---
  values: Record<string, any>; 
  
  // --- ACCIONES ---
  setValue: (key: string, value: any) => void;
  
  // Corregimos el tipo de 'category' para que sea seguro
  setNestedValue: (category: NestedCategory, key: string, value: any) => void; 
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

  // Setter Anidado (Corregido para TS)
  setNestedValue: (category, key, value) => set((state) => {
    // Recuperamos el objeto actual de esa categoría (ej. state.space)
    const currentCategoryState = state[category] as Record<string, any>;
    
    return {
      [category]: { 
        ...currentCategoryState, 
        [key]: value 
      }
    };
  })
}));