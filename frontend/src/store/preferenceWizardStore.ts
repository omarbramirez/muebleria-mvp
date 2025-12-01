import { create } from 'zustand';


// --- DEFINICIÓN DE TIPOS PARA EL 3D ---

export interface WallOpening {
  id: string;
  type: 'window' | 'door';
  wallIndex: number;      // Índice del muro en el array 'points'
  distFromStart: number;  // Distancia en cm desde el inicio del muro
  width: number;
  height: number;
  sillHeight: number;     // Antepecho (altura desde el piso)
}


export interface ApplianceModel {
  id: string;
  type: 'fridge' | 'stove' | 'dishwasher' | 'hood'; // Tipos conocidos
  width: number;
  height: number;
  depth: number;
  color: string;          // Hex code para el prototipo
  position: { x: number; y: number; z: number }; // Coordenadas mundiales
  rotation: number;       // En radianes
}

export type InstallationType = 'electrical' | 'plumbing' | 'gas';

export interface InstallationPoint {
  id: string;
  type: InstallationType;
  subtype: string; // ej. '110v', '220v', 'agua_fria', 'desague'
  wallIndex: number; // A qué muro pertenece
  distFromStart: number; // Coordenada X local en el muro (mm)
  heightFromFloor: number; // Coordenada Y local desde el suelo (mm)

  // Propiedades opcionales específicas
  notes?: string;
  hasHotWater?: boolean; // Para tomas de agua
  hasColdWater?: boolean;
}

export interface GasConfig {
  required: boolean;
  type: 'natural' | 'lp';
  x: number; // Coordenada X global o relativa al muro principal
  z: number; // Altura
  wallIndex: number; // Muro donde está la válvula
}

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
    limit: number;       // El tope que pone el usuario
    currentCost: number; // El costo real calculado del diseño actual
    tier: 'economy' | 'standard' | 'premium';
  };
  installations: string[];
  appliances: ApplianceModel[];
  style: {
    look: string;
    palette: string;
  };
  activeWallIndex: number | null; // <--- NUEVO ESTADO GLOBAL
  // --- ESTADO DINÁMICO ---
  // Aquí usamos el tipo recursivo. TypeScript ya no se quejará de 'any'.
  values: Record<string, WizardStoreValue>;
  installation_points: InstallationPoint[];
  gas_config: GasConfig;

  // --- ACCIONES ---
  setValue: (key: string, value: WizardStoreValue) => void;
  setNestedValue: (category: NestedCategory, key: string, value: WizardStoreValue) => void;
  setAppliances: (appliances: ApplianceModel[]) => void;
  updateApplianceSpecs: (id: string, specs: Partial<ApplianceModel>) => void;
  setActiveWall: (index: number | null) => void; // <--- NUEVA ACCIÓN
  setBudgetLimit: (amount: number) => void;
  recalculateProjectCost: () => void; // Llama a esto cada que cambie algo en el 3D
  applyBudgetOptimization: () => void; // La función "mágica" que baja costos
  setInstallationPoints: (points: InstallationPoint[]) => void;
  updateInstallationPoint: (id: string, data: Partial<InstallationPoint>) => void;
}

export const usePreferenceWizardStore = create<WizardState>((set, get) => ({
  // Inicialización
  space: {
    dimensions: { width: 0, length: 0, height: 0 },
    constraints: { windowWall: '', doorWall: '' },
    files: []
  },
  budget: {
    limit: 85000,
    currentCost: 0,
    tier: 'standard'
  },
  installations: [],
  appliances: [],
  style: { look: '', palette: '' },
  values: {},
  activeWallIndex: null,
  installation_points: [],
  gas_config: {
    required: false,
    type: 'natural',
    x: 0,
    z: 0,
    wallIndex: -1
  },
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
  }),

  setAppliances: (appliances) => set(() => ({ appliances })),

  updateApplianceSpecs: (id, specs) => set((state) => ({
    appliances: state.appliances.map((app) =>
      app.id === id ? { ...app, ...specs } : app
    )
  })),
  setActiveWall: (index) => set(() => ({ activeWallIndex: index })),
  setBudgetLimit: (amount) => set((state) => ({
    budget: {
      ...state.budget,
      limit: amount,
      tier: amount < 40000 ? 'economy' : amount < 120000 ? 'standard' : 'premium'
    }
  })),
  // Esta función simula el cálculo real sumando muros, muebles y electrodomésticos
  recalculateProjectCost: () => {
    const state = get();

    // 1. Costo Base (Muros y Obra civil aproximada)
    // Supongamos $5,000 MXN por metro lineal de muro (solo ejemplo)
    const wallCost = (state.values.room_points as any[] || []).length * 5000;

    // 2. Costo Electrodomésticos
    const appCost = state.appliances.reduce((acc, app) => {
      // Precio simulado según el tipo
      const price = app.type === 'fridge' ? 15000 : app.type === 'stove' ? 12000 : 8000;
      return acc + price;
    }, 0);

    // 3. Costo Acabados (Si hubiera seleccionados)
    const materialsCost = 60000; // Mock

    const total = wallCost + appCost + materialsCost;

    set((s) => ({
      budget: { ...s.budget, currentCost: total }
    }));
  },

  // La función que ejecuta la "Sugerencia" del Pop-up
  applyBudgetOptimization: () => set((state) => {
    // LÓGICA DE DOWNGRADE:
    // 1. Eliminar electrodomésticos no esenciales (ej. Hood / Dishwasher)
    const essentialApps = state.appliances.filter(a => a.type === 'fridge' || a.type === 'stove');

    // 2. Aquí podrías cambiar materiales a versiones baratas, etc.

    // 3. Recalcular costo
    // (En una app real, llamarías a recalculateProjectCost después)

    return {
      appliances: essentialApps,
      // Simulamos que bajó el costo forzando un update del budget actual
      budget: { ...state.budget, currentCost: state.budget.limit }
    };
  }),
  setInstallationPoints: (points) => set(() => ({ installation_points: points })),
  updateInstallationPoint: (id, data) => set((state) => ({
    installation_points: state.installation_points.map((p) =>
      p.id === id ? { ...p, ...data } : p
    )
  })),
}));