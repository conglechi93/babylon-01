import { CreateBox, StandardMaterial, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { ServiceDefinition } from '../../types/services';

export function createServiceBox(def: ServiceDefinition, scene: Scene): Mesh {
  const { metadata, position, color } = def;
  const box = CreateBox(metadata.id, { size: 1.2 }, scene);
  box.position.set(position.x, position.y, position.z);

  const mat = new StandardMaterial(`${metadata.id}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(color);
  mat.specularColor = new Color3(0.3, 0.3, 0.3);
  box.material = mat;

  box.metadata = { serviceId: metadata.id };
  return box;
}
