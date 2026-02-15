import {
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  CabinetModule
} from "@/store/preferenceWizardStore";

// ==========================================
// 1. Definiciones de Vista y Configuración
// ==========================================

/**
 * Define el modo de cámara y renderizado.
 * - PERSPECTIVE: Cámara 3D estándar para inmersión.
 * - BLUEPRINT: Cámara Ortográfica y materiales técnicos para planos.
 */
export type PlannerViewMode = 'PERSPECTIVE' | 'BLUEPRINT';

// ==========================================
// 2. Interfaces de Props del Componente
// ==========================================

/**
 * Props principales para el componente orquestador Room3DPreview.
 * Actúa como contrato entre el componente padre (que tiene los datos)
 * y el motor 3D (que los visualiza).
 */
export interface Room3DPreviewProps {
  // --- Datos Estructurales (Geometría del Cuarto) ---
  /** Array de coordenadas 2D (x,y) que definen el polígono del suelo */
  points: { x: number; y: number }[];
  /** Altura del techo en milímetros */
  height: number;

  // --- Datos de Contenido (Objetos en la escena) ---
  // Son opcionales (?) para permitir que el componente cargue 
  // incluso si los arrays están vacíos o undefined.
  openings?: WallOpening[];
  appliances?: ApplianceModel[];
  installations?: InstallationPoint[];
  gasConfig?: GasConfig;
  layoutItems?: CabinetModule[];

  // --- Estado de Visualización ---
  viewMode?: PlannerViewMode;

  // --- Callbacks de Interacción (Eventos del Sistema Nervioso) ---
  // Estas funciones se ejecutan cuando el usuario termina de arrastrar un objeto (onPointerUp).
  // Permiten que el motor 3D actualice el Store de Zustand sin acoplarse a él directamente.
  
  onGasUpdate?: (gas: GasConfig) => void;
  onInstallationUpdate?: (inst: InstallationPoint) => void;
  onApplianceUpdate?: (app: ApplianceModel) => void;
  onOpeningUpdate?: (op: WallOpening) => void;
  onLayoutUpdate?: (item: CabinetModule) => void;
}

// ==========================================
// 3. Interfaces Auxiliares (Opcional)
// ==========================================

/**
 * Si en el futuro necesitas pasar configuración de ingeniería,
 * puedes centralizarla aquí.
 */
export interface EngineeringConfig {
  wallThickness: number;
  scaleFactor: number;
}