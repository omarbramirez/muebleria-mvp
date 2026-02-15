'use client';

import React, { useRef } from "react";
import { usePreferenceWizardStore } from "@/store/preferenceWizardStore";
// Hooks
import { useThreeEngine } from "./hooks/useThreeEngine";
import { useSceneBuilder } from "./hooks/useSceneBuilder";
import { useInteractionSystem } from "./hooks/useInteractionSystem";
// Types
import { Room3DPreviewProps } from "./types";

const Room3DPreview: React.FC<Room3DPreviewProps> = (props) => {
  // 1. Store Global (Estado de la UI)
  const { activeWallIndex, setActiveWall } = usePreferenceWizardStore();
  
  // 2. Referencia al DOM (El contenedor HTML)
  const containerRef = useRef<HTMLDivElement>(null);

  // 3. HOOK DE INFRAESTRUCTURA (Hardware)
  // Inicializa WebGL, Luces, Cámara y Loop.
  const { engineRef, isReady } = useThreeEngine(
    containerRef, 
    props.viewMode || 'PERSPECTIVE'
  );

  // 4. HOOK DE CONTENIDO (Arquitecto)
  // Construye las mallas 3D basándose en los datos.
  // Nota: Pasamos props explícitamente para asegurar que coincidan con la interfaz SceneBuilderData
  const { roomGroup, wallsRef } = useSceneBuilder(
    engineRef.current?.scene, 
    { 
      points: props.points,
      height: props.height,
      openings: props.openings || [],
      appliances: props.appliances || [],
      installations: props.installations || [],
      gasConfig: props.gasConfig,
      layoutItems: props.layoutItems || [],
      activeWallIndex: activeWallIndex,
      viewMode: props.viewMode || 'PERSPECTIVE'
    }
  );

  // 5. HOOK DE COMPORTAMIENTO (Sistema Nervioso)
  // Maneja los eventos del mouse y actualiza los datos.
  useInteractionSystem(
    engineRef.current,
    roomGroup.current,
    wallsRef.current,
    {
      setActiveWall,
      onLayoutUpdate: props.onLayoutUpdate,
      onApplianceUpdate: props.onApplianceUpdate,
      onOpeningUpdate: props.onOpeningUpdate,
      onInstallationUpdate: props.onInstallationUpdate,
      onGasUpdate: props.onGasUpdate
    },
    // CRÍTICO: Contexto completo de datos para "hydrate" al soltar el mouse
    { 
      height: props.height,
      layoutItems: props.layoutItems || [],
      appliances: props.appliances || []
      // Si tienes lógica para instalaciones/gas, agrégalos aquí también
    }
  );

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-move bg-gray-50 relative outline-none"
      // tabIndex={0} // Opcional: Para capturar eventos de teclado en el futuro
      aria-label="Vista 3D Interactiva de la Cocina"
    >
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          Cargando Motor 3D...
        </div>
      )}
    </div>
  );
};

export default Room3DPreview;