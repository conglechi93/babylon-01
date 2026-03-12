import { HemisphericLight, Vector3 } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

export function setupLighting(scene: Scene): HemisphericLight {
  // Minimal ambient fill — just enough to see the dark side of planets.
  // The Sun's PointLight (in sun.ts) is the primary light source.
  const light = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
  light.intensity = 0.04;
  return light;
}
