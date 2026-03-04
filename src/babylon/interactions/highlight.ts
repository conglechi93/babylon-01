import '@babylonjs/core/Layers/effectLayerSceneComponent.js';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';

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
