import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';
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
