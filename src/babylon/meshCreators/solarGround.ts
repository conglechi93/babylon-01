import { CreateGround, StandardMaterial, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

export function createSolarGround(centerX: number, scene: Scene): Mesh {
  const ground = CreateGround('solarGround', { width: 60, height: 60 }, scene);
  ground.position.set(centerX, -0.01, 0);

  const mat = new StandardMaterial('solarGroundMat', scene);
  mat.diffuseColor = new Color3(0.06, 0.06, 0.1);
  mat.specularColor = new Color3(0, 0, 0);
  ground.material = mat;

  ground.isPickable = false;
  return ground;
}
