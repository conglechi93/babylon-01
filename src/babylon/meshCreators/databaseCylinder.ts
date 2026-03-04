import { CreateCylinder } from '@babylonjs/core/Meshes/Builders/cylinderBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';
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
