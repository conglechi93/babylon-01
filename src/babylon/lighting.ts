import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import type { Scene } from '@babylonjs/core/scene.js';

export function setupLighting(scene: Scene): HemisphericLight {
  const light = new HemisphericLight('light', new Vector3(0, 1, 0.3), scene);
  light.intensity = 1.0;
  return light;
}
