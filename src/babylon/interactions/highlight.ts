import { HighlightLayer, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

export class HighlightManager {
  private layer: HighlightLayer;
  private currentMesh: Mesh | null = null;

  constructor(scene: Scene) {
    this.layer = new HighlightLayer('highlight', scene);
  }

  select(mesh: Mesh): void {
    this.clear();
    this.layer.addMesh(mesh, Color3.White());
    this.currentMesh = mesh;
  }

  clear(): void {
    if (this.currentMesh) {
      this.layer.removeMesh(this.currentMesh);
      this.currentMesh = null;
    }
  }

  dispose(): void {
    this.layer.dispose();
  }
}
