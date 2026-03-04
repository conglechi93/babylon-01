import { HemisphericLight, Vector3 } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

export function setupLighting(scene: Scene): HemisphericLight {
  const light = new HemisphericLight('light', new Vector3(0, 1, 0.3), scene);
  light.intensity = 1.0;
  return light;
}
