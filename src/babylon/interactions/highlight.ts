import { HighlightLayer, Color3 } from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

export class HighlightManager {
  private layer: HighlightLayer;
  private currentMesh: Mesh | null = null;
  private hoveredMesh: Mesh | null = null;

  constructor(scene: Scene) {
    this.layer = new HighlightLayer('highlight', scene);
  }

  select(mesh: Mesh): void {
    this.clear();
    this.clearHover();
    this.layer.addMesh(mesh, Color3.White());
    this.currentMesh = mesh;
  }

  hover(mesh: Mesh): void {
    if (this.hoveredMesh === mesh) return;

    this.clearHover();
    this.layer.addMesh(mesh, new Color3(0.5, 0.8, 1));
    this.hoveredMesh = mesh;
  }

  clearHover(): void {
    if (this.hoveredMesh) {
      this.layer.removeMesh(this.hoveredMesh);
      this.hoveredMesh = null;
    }
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
