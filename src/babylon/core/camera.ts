import { ArcRotateCamera, Vector3 } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

export function setupCamera(scene: Scene, canvas: HTMLCanvasElement): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 3,
    35,
    new Vector3(15, 0, -2),
    scene,
  );
  camera.attachControl(canvas, false);
  camera.lowerRadiusLimit = 5;
  camera.upperRadiusLimit = 100;
  camera.inertia = 0.85;
  camera.wheelDeltaPercentage = 0.06;
  return camera;
}
