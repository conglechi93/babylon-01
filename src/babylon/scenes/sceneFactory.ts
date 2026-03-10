import { Scene } from '@babylonjs/core';
import type { Engine, Mesh } from '@babylonjs/core';
import type { SelectionId } from '../../types/selection';
import { MESH_DEFINITIONS } from '../../data/meshDefinitions';
import { CameraManager } from '../core/multiCamera';
import { setupLighting } from '../core/lighting';
import { createGround } from '../meshCreators/ground';
import { createPrimitiveMesh } from '../meshCreators/primitiveMesh';
import { HighlightManager } from '../interactions/highlight';
import { HoverManager } from '../interactions/hover';
import { setupRayPicking } from '../interactions/rayPicking';
import { setupMeshAnimations } from '../animations/rotation';
import { createSolarSystem } from '../meshCreators/solarSystem';

export interface SceneResult {
  scene: Scene;
  highlightManager: HighlightManager;
  hoverManager: HoverManager;
  cameraManager: CameraManager;
}

export function createScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  onSelect: (selectionId: SelectionId) => void,
): SceneResult {
  const scene = new Scene(engine);
  scene.clearColor.set(0.08, 0.08, 0.12, 1);

  const cameraManager = new CameraManager(scene, canvas);
  setupLighting(scene);
  createGround(scene);

  const primitiveMeshes: Mesh[] = MESH_DEFINITIONS.map((def) =>
    createPrimitiveMesh(def, scene),
  );

  const { pickableMeshes: solarMeshes } = createSolarSystem(scene);
  const allPickableMeshes = [...primitiveMeshes, ...solarMeshes];

  const highlightManager = new HighlightManager(scene);
  const hoverManager = new HoverManager(scene, {}, highlightManager);

  setupRayPicking(
    scene,
    allPickableMeshes,
    highlightManager,
    onSelect,
    (mesh) => cameraManager.setFollowTarget(mesh),
  );

  setupMeshAnimations(scene, primitiveMeshes, MESH_DEFINITIONS);

  return { scene, highlightManager, hoverManager, cameraManager };
}
