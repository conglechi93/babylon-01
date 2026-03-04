import type { Scene, Mesh } from '@babylonjs/core';
import type { MeshMetadata } from '../../types/mesh';

export function setupMeshAnimations(scene: Scene, meshes: Mesh[], defs: MeshMetadata[]): void {
  // Store base Y position for bob animation
  for (const mesh of meshes) {
    mesh.metadata = { ...mesh.metadata, baseY: mesh.position.y };
  }

  scene.registerBeforeRender(() => {
    const delta = scene.getEngine().getDeltaTime() / 1000;
    const t = performance.now() / 1000;

    for (const mesh of meshes) {
      const anim = defs.find((d) => d.id === mesh.name)?.animation;
      if (!anim) continue;

      if (anim.rotationY) mesh.rotation.y += anim.rotationY * delta;
      if (anim.rotationX) mesh.rotation.x += anim.rotationX * delta;
      if (anim.rotationZ) mesh.rotation.z += anim.rotationZ * delta;
      if (anim.bobY) {
        mesh.position.y = mesh.metadata.baseY + Math.sin(t * (anim.bobSpeed ?? 1) * Math.PI) * anim.bobY;
      }
    }
  });
}
