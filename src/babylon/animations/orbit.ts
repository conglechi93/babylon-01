import type { Scene, TransformNode } from '@babylonjs/core';

export function setupOrbitalMotion(
  scene: Scene,
  pivots: { pivot: TransformNode; speed: number }[],
): void {
  scene.registerBeforeRender(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    for (const { pivot, speed } of pivots) {
      pivot.rotation.y += speed * delta;
    }
  });
}
