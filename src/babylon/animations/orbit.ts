import type { Scene, TransformNode } from '@babylonjs/core';

/** Shared mutable clock — mutate it directly; no re-registration needed. */
export interface SimClock {
  timeScale: number;
  paused:    boolean;
}

export function setupOrbitalMotion(
  scene: Scene,
  pivots: { pivot: TransformNode; speed: number }[],
  clock: SimClock,
): void {
  scene.registerBeforeRender(() => {
    if (clock.paused) return;
    const delta = scene.getEngine().getDeltaTime() / 1000;
    for (const { pivot, speed } of pivots) {
      pivot.rotation.y += speed * delta * clock.timeScale;
    }
  });
}
