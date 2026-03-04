import { ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import type { Scene, AbstractMesh, Mesh } from '@babylonjs/core';
import type { HighlightManager } from './highlight';

export function setupRayPicking(
  scene: Scene,
  meshes: Mesh[],
  highlightManager: HighlightManager,
  onSelect: (serviceId: string | null) => void,
): void {
  for (const mesh of meshes) {
    mesh.actionManager = new ActionManager(scene);
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
        const picked = evt.meshUnderPointer as AbstractMesh | null;
        if (picked?.metadata?.serviceId) {
          highlightManager.select(picked as Mesh);
          onSelect(picked.metadata.serviceId);
        }
      }),
    );
  }

  // Click on empty space to deselect
  scene.onPointerDown = (_evt, pickResult) => {
    if (!pickResult?.hit || !pickResult.pickedMesh?.metadata?.serviceId) {
      highlightManager.clear();
      onSelect(null);
    }
  };
}
