import type { Scene } from '@babylonjs/core/scene.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';

export function setupIdleRotation(scene: Scene, meshes: Mesh[]): void {
  scene.registerBeforeRender(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    for (const mesh of meshes) {
      mesh.rotation.y += 0.15 * delta;
    }
  });
}
