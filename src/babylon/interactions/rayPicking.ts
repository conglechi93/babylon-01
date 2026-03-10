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

/**
 * Registers pointer-based mesh selection on the scene.
 *
 * Uses a single onPointerObservable handler for both select and deselect so
 * there is one clear code path and no risk of duplicate events.
 *
 * Drag detection: a POINTERUP is treated as a click only when the pointer
 * moved less than 4 px (distSq ≤ 16) since POINTERDOWN. This prevents
 * accidental selection at the end of a camera drag.
 *
 * @param onMeshPicked  Optional callback receiving the raw AbstractMesh on
 *   each successful pick. Kept separate from onSelect so callers (e.g.
 *   CameraManager) get the mesh reference directly without a getMeshByName
 *   lookup. Not called on a miss — callers retain the last valid target.
 */
export function setupRayPicking(
  scene: Scene,
  _meshes: Mesh[],
  highlightManager: HighlightManager,
  onSelect: (selectionId: SelectionId) => void,
  onMeshPicked?: (mesh: AbstractMesh | null) => void,
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
        if (dx * dx + dy * dy > 16) return;

        const picked = pointerInfo.pickInfo?.pickedMesh;
        const id = picked ? selectionIdFromMesh(picked) : null;

        if (id) {
          highlightManager.select(picked as Mesh);
          onSelect(id);
          onMeshPicked?.(picked ?? null);
        } else {
          highlightManager.clear();
          onSelect(null);
        }
        break;
      }
    }
  });
}
