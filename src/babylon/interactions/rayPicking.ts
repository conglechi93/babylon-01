import { ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import type { Scene, AbstractMesh, Mesh } from '@babylonjs/core';
import type { HighlightManager } from './highlight';
import type { SelectionId } from '../../types/selection';

function selectionIdFromMesh(mesh: AbstractMesh): SelectionId {
  if (mesh.metadata?.serviceId) {
    return { kind: 'service', id: mesh.metadata.serviceId };
  }
  if (mesh.metadata?.celestialId) {
    return { kind: 'celestial', id: mesh.metadata.celestialId };
  }
  return null;
}

export function setupRayPicking(
  scene: Scene,
  meshes: Mesh[],
  highlightManager: HighlightManager,
  onSelect: (selectionId: SelectionId) => void,
): void {
  for (const mesh of meshes) {
    mesh.actionManager = new ActionManager(scene);
    mesh.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnPickTrigger, (evt) => {
        const picked = evt.meshUnderPointer as AbstractMesh | null;
        if (picked) {
          const id = selectionIdFromMesh(picked);
          if (id) {
            highlightManager.select(picked as Mesh);
            onSelect(id);
          }
        }
      }),
    );
  }

  // Click on empty space to deselect
  scene.onPointerDown = (_evt, pickResult) => {
    const picked = pickResult?.pickedMesh;
    if (!pickResult?.hit || !picked || !selectionIdFromMesh(picked)) {
      highlightManager.clear();
      onSelect(null);
    }
  };
}
