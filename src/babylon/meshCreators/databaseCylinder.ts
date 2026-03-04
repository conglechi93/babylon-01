import { CreateCylinder, StandardMaterial, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { ServiceDefinition } from '../../types/services';

export function createDatabaseCylinder(def: ServiceDefinition, scene: Scene): Mesh {
  const { metadata, position, color, dimensions } = def;
  const diameter = dimensions?.diameter ?? 1.5;
  const height = dimensions?.height ?? 1.5;
  const cylinder = CreateCylinder(metadata.id, { diameter, height, tessellation: 24 }, scene);
  cylinder.position.set(position.x, position.y, position.z);

  const mat = new StandardMaterial(`${metadata.id}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(color);
  mat.specularColor = new Color3(0.3, 0.3, 0.3);
  cylinder.material = mat;

  cylinder.metadata = { serviceId: metadata.id };
  return cylinder;
}
