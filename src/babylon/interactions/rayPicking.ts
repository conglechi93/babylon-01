import { ActionManager } from '@babylonjs/core/Actions/actionManager.js';
import { ExecuteCodeAction } from '@babylonjs/core/Actions/directActions.js';
import { ActionEvent } from '@babylonjs/core/Actions/actionEvent.js';
import type { Scene } from '@babylonjs/core/scene.js';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh.js';
import type { Mesh } from '@babylonjs/core/Meshes/mesh.js';
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
      new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt: ActionEvent) => {
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
