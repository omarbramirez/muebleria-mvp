
import {
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  CabinetModule
} from "@/store/preferenceWizardStore";

export type PlannerViewMode = 'PERSPECTIVE' | 'BLUEPRINT';

export interface Room3DPreviewProps {
  points: { x: number; y: number }[];
  height: number; // en mm
  openings?: WallOpening[];
  appliances?: ApplianceModel[];
  installations?: InstallationPoint[];
  gasConfig?: GasConfig;
  layoutItems?: CabinetModule[];
  viewMode?: PlannerViewMode;
  // Callbacks
  onGasUpdate?: (gas: GasConfig) => void;
  onInstallationUpdate?: (inst: InstallationPoint) => void;
  onApplianceUpdate?: (app: ApplianceModel) => void;
  onOpeningUpdate?: (op: WallOpening) => void;
  onLayoutUpdate?: (item: CabinetModule) => void;
}

  // Definición de tipos
  export type DraggableItemType = 'installation' | 'appliance' | 'opening' | 'gas' | 'furniture';