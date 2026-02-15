'use client';
import React, { useState, useRef } from "react";
import { Button } from '@/components/ui/Button';
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"; // Importar HelpCircle

// Imports de Componentes de Presentación (Vistas)
import Room3DPreview from '@/components/features/planner/Room3DPreview_';

// Imports de Módulos de Configuración
import Materials from '@/components/features/planner/options/Materials';
import Budget from '@/components/features/planner/options/Budget';
import Appliances from '@/components/features/planner/options/Appliances';
import Compatibility from '@/components/features/planner/options/Compatibility';
import Position from '@/components/features/planner/options/Position';
import RoomGeometryPlanner from '@/components/features/planner/options/RoomGeometryPlanner/RoomGeometryPlanner';

// NUEVO: Importar el Modal
import PlannerWelcomeModal from '@/components/features/planner/PlannerWelcomeModal';

// Imports de Tipos y Store
import {
  usePreferenceWizardStore,
  WallOpening,
  ApplianceModel,
  InstallationPoint,
  GasConfig,
  WizardStoreValue,
  CabinetModule
} from "@/store/preferenceWizardStore";

interface roomPlannerProps {
  link: string;
}

interface Point {
  x: number;
  y: number;
}

export type PlannerViewMode = 'PERSPECTIVE' | 'BLUEPRINT';

const MODULES: Record<string, React.ReactNode> = {
  "Geometría": <RoomGeometryPlanner />,
  "Distribución": <Position />,
  "Instalaciones": <Compatibility />,
  "Materiales": <Materials />,
  "Electrodomésticos": <Appliances />,
  "Presupuesto": <Budget />,
};

const DEFAULT_POINTS = [
  { x: 50, y: 100 }, { x: 450, y: 100 },
  { x: 450, y: 200 }, { x: 350, y: 200 },
  { x: 350, y: 400 }, { x: 50, y: 400 },
];
const DEFAULT_HEIGHT = 2500;
const DEFAULT_GAS: GasConfig = { required: false, type: 'natural', x: 0, z: 0, wallIndex: 0 };

const RoomPlannerHeight: React.FC<roomPlannerProps> = ({ link }) => {
  // 1. HOOK DEL STORE
  const { values, setValue, appliances, updateApplianceSpecs } = usePreferenceWizardStore();

  // 2. HIDRATACIÓN
  const points = (values.room_points as unknown as Point[]) || DEFAULT_POINTS;
  const heightMm = (values.room_height as unknown as number) || DEFAULT_HEIGHT;
  const openings = (values.room_openings as unknown as WallOpening[]) || [];
  const installations = (values.installation_points as unknown as InstallationPoint[]) || [];
  const gasConfig = (values.gas_config as unknown as GasConfig) || DEFAULT_GAS;
  const layoutItems = (values.layout_items as unknown as CabinetModule[]) || [];

  // 3. ESTADO LOCAL
  const [activeLayout, setActiveLayout] = useState<number>(3);
  const [activeOption, setActiveOption] = useState<string>("MODULO");
  const [currentModule, setCurrentModule] = useState<string | null>("Geometría");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOptionsRef, setIsOptionsRef] = useState(true);
  const [viewMode, setViewMode] = useState<PlannerViewMode>('PERSPECTIVE');

  // ESTADO DEL MODAL
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true); // Se abre al inicio

  const optionsRef = useRef<HTMLDivElement>(null);

  // 4. HANDLERS
  const handleInstallationDrag = (updated: InstallationPoint) => {
    const newInstallations = installations.map(p => p.id === updated.id ? updated : p);
    setValue("installation_points", newInstallations as unknown as WizardStoreValue);
  };

  const handleApplianceDrag = (updated: ApplianceModel) => {
    updateApplianceSpecs(updated.id, { position: updated.position, rotation: updated.rotation });
  };

  const handleOpeningDrag = (updatedOp: WallOpening) => {
    const newOpenings = openings.map(op => op.id === updatedOp.id ? updatedOp : op);
    setValue("room_openings", newOpenings as unknown as WizardStoreValue);
  };

  const handleLayoutUpdate = (updatedItem: CabinetModule) => {
    const currentItems = (values.layout_items as unknown as CabinetModule[]) || [];
    const newItems = currentItems.map(item => item.id === updatedItem.id ? updatedItem : item);
    setValue('layout_items', newItems as unknown as WizardStoreValue);
  };

  const handleGasUpdate = (updatedGas: GasConfig) => {
    setValue('gas_config', updatedGas as unknown as WizardStoreValue);
  };

  // 5. INTERACCIÓN DE UI
  const toggleMenu = () => {
    setActiveOption("MENU");
    setIsMenuOpen((prev) => !prev);
    setIsOptionsRef(true);
  };

  const openModule = () => {
    setActiveOption("MODULO");
    setIsMenuOpen(false);
    setIsOptionsRef(true);
  };

  const handleSelectOption = (option: string) => {
    setCurrentModule(option);
    setActiveOption("MODULO");
    setIsMenuOpen(false);
    setIsOptionsRef(true);
  };

  return (
    <div className=" flex flex-col select-none bg-[#FAFAF8] h-screen overflow-hidden relative">

      {/* --- MODAL DE BIENVENIDA --- */}
      <PlannerWelcomeModal
        isOpen={isWelcomeOpen}
        onClose={() => setIsWelcomeOpen(false)}
      />

      {/* Header Flotante */}
      <div className="absolute top-0 z-10 flex flex-row px-5 py-4 justify-center items-center w-full gap-4 pointer-events-none">
        <div className="min-w-[300px] pointer-events-auto bg-white/80 backdrop-blur-md p-1 rounded-lg shadow-sm border border-gray-200 flex gap-1 flex-row items-center justify-center relative">
          <Button variant={`${viewMode === "PERSPECTIVE" ? "primary" : "secondary"}`} onClick={() => setViewMode("PERSPECTIVE")} size="sm" >AMATEUR</Button>
          <Button variant={`${viewMode === "BLUEPRINT" ? "primary" : "secondary"}`} onClick={() => setViewMode("BLUEPRINT")} size="sm" >EXPERTO</Button>
          <Button variant={`${"secondary"}`} onClick={() => setIsWelcomeOpen(true)} size="sm" className="p-2 !rounded-full shadow-sm"><HelpCircle size={20} /></Button>
        </div>
      </div>

      <div className="h-full w-full">
        {activeLayout === 3 && <Room3DPreview
          points={points}
          height={heightMm}
          openings={openings}
          appliances={appliances}
          installations={installations}
          gasConfig={gasConfig}
          layoutItems={layoutItems}
          onInstallationUpdate={handleInstallationDrag}
          onApplianceUpdate={handleApplianceDrag}
          onOpeningUpdate={handleOpeningDrag}
          onLayoutUpdate={handleLayoutUpdate}
          onGasUpdate={handleGasUpdate}
          viewMode={viewMode}
        />}
      </div>

      {/* Panel Inferior */}
      <div ref={optionsRef} className={`absolute bottom-0 w-full z-20 flex flex-col justify-end transition-all duration-500 ease-in-out ${isOptionsRef ? 'translate-y-0' : 'translate-y-[85%]'}`}>

        {/* Pestaña del Panel */}
        <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-2xl">
          <div className="flex flex-row px-6 justify-between items-center w-full">
            <div className="w-5/6 flex gap-2 ">
              <Button variant={activeOption === "MODULO" ? "primary" : "secondary"} onClick={openModule} size="sm">
                CONFIGURACIÓN
              </Button>
              <Button variant={activeOption === "MENU" ? "primary" : "secondary"} onClick={toggleMenu} size="sm">
                MÓDULOS
              </Button>
            </div>
            <Button variant="primary" onClick={() => setIsOptionsRef(!isOptionsRef)}>
              {isOptionsRef ? <ChevronDown className="w-[3em] h-[4em]" /> : <ChevronUp className="w-[3em] h-[4em] animate-bounce-slow" />}
            </Button>
          </div>
        </div>

        {/* Contenido del Panel */}
        <div className="bg-white h-[60vh] w-full relative flex flex-col">
          {/* Overlay de Menú de Módulos */}
          <div className={`absolute inset-0 bg-white z-20 transition-opacity duration-300 ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
            <div className="p-6 grid grid-cols-2 gap-3 overflow-y-auto h-full pb-20">
              {Object.keys(MODULES).map((item) => (
                <button
                  key={item}
                  className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${currentModule === item ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handleSelectOption(item)}
                >
                  <span className="font-semibold text-gray-700 block">{item}</span>
                  <span className="text-xs text-gray-400">Configurar {item.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Módulo Activo Renderizado */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pb-24 overscroll-contain">
            {currentModule && (
              <div className="min-h-full w-full">
                {MODULES[currentModule]}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPlannerHeight;