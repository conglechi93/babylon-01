import type { Scene, Mesh } from '@babylonjs/core';

export function setupIdleRotation(scene: Scene, meshes: Mesh[]): void {
  scene.registerBeforeRender(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    for (const mesh of meshes) {
      mesh.rotation.y += 0.15 * delta;
    }
  });
}
