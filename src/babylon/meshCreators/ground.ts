import { CreateGround } from '@babylonjs/core/Meshes/Builders/groundBuilder.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';

export function createGround(scene: Scene): Mesh {
  const ground = CreateGround('ground', { width: 20, height: 20 }, scene);
  const mat = new StandardMaterial('groundMat', scene);
  mat.diffuseColor = new Color3(0.15, 0.15, 0.2);
  mat.specularColor = new Color3(0, 0, 0);
  ground.material = mat;
  ground.isPickable = false;
  return ground;
}
