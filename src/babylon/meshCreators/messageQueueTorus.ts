import { CreateTorus, StandardMaterial, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { ServiceDefinition } from '../../types/services';

export function createMessageQueueTorus(def: ServiceDefinition, scene: Scene): Mesh {
  const { metadata, position, color, dimensions } = def;
  const diameter = dimensions?.diameter ?? 1.2;
  const torus = CreateTorus(metadata.id, { diameter, thickness: 0.35, tessellation: 24 }, scene);
  torus.position.set(position.x, position.y, position.z);

  const mat = new StandardMaterial(`${metadata.id}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(color);
  mat.specularColor = new Color3(0.3, 0.3, 0.3);
  torus.material = mat;

  torus.metadata = { serviceId: metadata.id };
  return torus;
}
