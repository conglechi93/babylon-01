import { PointerEventTypes } from '@babylonjs/core';
import type { Scene, AbstractMesh, Mesh } from '@babylonjs/core';
import type { HighlightManager } from './highlight';
import type { SelectionId } from '../../types/selection';

function selectionIdFromMesh(mesh: AbstractMesh): SelectionId {
  if (mesh.metadata?.meshId) {
    return { kind: 'mesh', id: mesh.metadata.meshId };
  }
  if (mesh.metadata?.celestialId) {
    return { kind: 'celestial', id: mesh.metadata.celestialId };
  }
  return null;
}

// Previous implementation: rayPicking.old.ts
// NEW: Single onPointerObservable handles both select and deselect.
// One entry point, linear logic — no risk of double-fire.
export function setupRayPicking(
  scene: Scene,
  _meshes: Mesh[],
  highlightManager: HighlightManager,
  onSelect: (selectionId: SelectionId) => void,
): void {
  let pointerDownPos = { x: 0, y: 0 };

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        pointerDownPos = { x: pointerInfo.event.clientX, y: pointerInfo.event.clientY };
        break;

      case PointerEventTypes.POINTERUP: {
        const dx = pointerInfo.event.clientX - pointerDownPos.x;
        const dy = pointerInfo.event.clientY - pointerDownPos.y;
        if (dx * dx + dy * dy > 16) return; // was a drag, not a click

        const picked = pointerInfo.pickInfo?.pickedMesh;
        const id = picked ? selectionIdFromMesh(picked) : null;

        if (id) {
          highlightManager.select(picked as Mesh);
          onSelect(id);
        } else {
          highlightManager.clear();
          onSelect(null);
        }
        break;
      }
    }
  });
}
