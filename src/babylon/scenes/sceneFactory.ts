import { Scene } from '@babylonjs/core';
import type { Engine, Mesh } from '@babylonjs/core';
import { ServiceType } from '../types/services';
import type { ServiceDefinition } from '../types/services';
import type { SelectionId } from '../types/selection';
import { SERVICE_DEFINITIONS } from '../data/serviceDefinitions';
import { setupCamera } from '../core/camera';
import { setupLighting } from '../core/lighting';
import { createGround } from '../meshCreators/ground';
import { createServiceBox } from '../meshCreators/serviceBox';
import { createDatabaseCylinder } from '../meshCreators/databaseCylinder';
import { createMessageQueueTorus } from '../meshCreators/messageQueueTorus';
import { HighlightManager } from '../interactions/highlight';
import { setupRayPicking } from '../interactions/rayPicking';
import { setupIdleRotation } from '../animations/rotation';
import { createSolarSystem } from './solarSystemFactory';

function createMeshForService(def: ServiceDefinition, scene: Scene): Mesh {
  switch (def.metadata.type) {
    case ServiceType.Database:
      return createDatabaseCylinder(def, scene);
    case ServiceType.MessageQueue:
      return createMessageQueueTorus(def, scene);
    case ServiceType.Microservice:
    default:
      return createServiceBox(def, scene);
  }
}

export interface SceneResult {
  scene: Scene;
  highlightManager: HighlightManager;
}

export function createScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  onSelect: (selectionId: SelectionId) => void,
): SceneResult {
  const scene = new Scene(engine);
  scene.clearColor.set(0.08, 0.08, 0.12, 1);

  setupCamera(scene, canvas);
  setupLighting(scene);
  createGround(scene);

  const serviceMeshes: Mesh[] = SERVICE_DEFINITIONS.map((def) =>
    createMeshForService(def, scene),
  );

  // Create solar system
  const { pickableMeshes: solarMeshes } = createSolarSystem(scene);

  const allPickableMeshes = [...serviceMeshes, ...solarMeshes];

  const highlightManager = new HighlightManager(scene);
  setupRayPicking(scene, allPickableMeshes, highlightManager, onSelect);
  setupIdleRotation(scene, serviceMeshes);

  return { scene, highlightManager };
}
