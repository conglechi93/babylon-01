import { ArcRotateCamera, Vector3 } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

export function setupCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 3,
    15,
    new Vector3(0, 0, -2),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 30;
  camera.inertia = 0.85;
  camera.wheelDeltaPercentage = 0.01;
  return camera;
}
