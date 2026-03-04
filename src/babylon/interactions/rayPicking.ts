import { ActionManager, ExecuteCodeAction, PointerEventTypes } from '@babylonjs/core';
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

  // Click on empty space to deselect — ignore drags (pointer moved between down and up)
  let pointerDownPos = { x: 0, y: 0 };

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
      pointerDownPos = { x: pointerInfo.event.clientX, y: pointerInfo.event.clientY };
    }
    if (pointerInfo.type === PointerEventTypes.POINTERUP) {
      const dx = pointerInfo.event.clientX - pointerDownPos.x;
      const dy = pointerInfo.event.clientY - pointerDownPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 4) return; // was a drag, not a click

      const pickResult = pointerInfo.pickInfo;
      const picked = pickResult?.pickedMesh;
      if (!pickResult?.hit || !picked || !selectionIdFromMesh(picked)) {
        highlightManager.clear();
        onSelect(null);
      }
    }
  });
}
