/**
 * @barrel engine/index.ts
 * @description
 * Exportaciones públicas del módulo engine del planner 3D.
 * Permite imports limpios desde el orquestador:
 *   import { useSceneSetup, useCameraControls, ... } from './engine';
 */

export { createSceneMaterials } from './sceneMaterials';
export type { SceneMaterials }  from './sceneMaterials';

export { useSceneSetup }        from './useSceneSetup';
export type { SceneSetupRefs }  from './useSceneSetup';

export { useCameraControls }       from './useCameraControls';
export type { CameraControlsRefs } from './useCameraControls';

export { useSceneObjects }      from './useSceneObjects';

export { useInteraction }       from './useInteraction';

export { updateMeasurements, clearMeasurements } from './measurementOverlay';
