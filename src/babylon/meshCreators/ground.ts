import { CreateGround, StandardMaterial, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

export function createGround(scene: Scene): Mesh {
  const ground = CreateGround('ground', { width: 20, height: 20 }, scene);
  const mat = new StandardMaterial('groundMat', scene);
  mat.diffuseColor = new Color3(0.15, 0.15, 0.2);
  mat.specularColor = new Color3(0, 0, 0);
  ground.material = mat;
  ground.isPickable = false;
  return ground;
}
