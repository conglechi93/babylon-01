import { PointerEventTypes } from '@babylonjs/core';
import type { Scene, AbstractMesh, Mesh, Observer, PointerInfo } from '@babylonjs/core';
import type { SelectionId } from '../../types/selection';
import type { HighlightManager } from './highlight';

export interface HoverCallbacks {
  onHoverEnter?: (selectionId: SelectionId, mesh: Mesh) => void;
  onHoverLeave?: (selectionId: SelectionId, mesh: Mesh) => void;
}

function selectionIdFromMesh(mesh: AbstractMesh): SelectionId {
  if (mesh.metadata?.meshId) {
    return { kind: 'mesh', id: mesh.metadata.meshId };
  }
  if (mesh.metadata?.celestialId) {
    return { kind: 'celestial', id: mesh.metadata.celestialId };
  }
  return null;
}

export class HoverManager {
  private scene: Scene;
  private highlightManager: HighlightManager | null = null;
  private currentHoveredMesh: Mesh | null = null;
  private callbacks: HoverCallbacks;
  private observer: Observer<PointerInfo> | null = null;

  constructor(
    scene: Scene,
    callbacks: HoverCallbacks = {},
    highlightManager?: HighlightManager,
  ) {
    this.scene = scene;
    this.highlightManager = highlightManager ?? null;
    this.callbacks = callbacks;
    this.setupHoverDetection();
  }

  private setupHoverDetection(): void {
    this.observer = this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERMOVE) return;

      // POINTERMOVE không tự pick — phải gọi thủ công
      const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
      console.log('HoverManager: Pointer moved, pick result:', pickResult);
      const pickedMesh = pickResult?.hit ? (pickResult.pickedMesh as Mesh) : null;

      // Không có gì thay đổi, bỏ qua
      if (pickedMesh === this.currentHoveredMesh) return;

      const prevMesh = this.currentHoveredMesh;
      const prevId = prevMesh ? selectionIdFromMesh(prevMesh) : null;
      const newId = pickedMesh ? selectionIdFromMesh(pickedMesh) : null;

      // Leave mesh cũ
      if (prevMesh && prevId) {
        this.highlightManager?.clearHover();
        this.callbacks.onHoverLeave?.(prevId, prevMesh);
      }

      // Luôn cập nhật tracking dù có metadata hay không — tránh spam
      this.currentHoveredMesh = pickedMesh;

      // Enter mesh mới (chỉ khi có selectionId)
      if (pickedMesh && newId) {
        this.highlightManager?.hover(pickedMesh);
        this.callbacks.onHoverEnter?.(newId, pickedMesh);
      }
    });
  }

  setCallbacks(callbacks: HoverCallbacks): void {
    this.callbacks = callbacks;
  }

  getCurrentHoveredMesh(): Mesh | null {
    return this.currentHoveredMesh;
  }

  dispose(): void {
    if (this.observer) {
      this.scene.onPointerObservable.remove(this.observer);
      this.observer = null;
    }
    this.highlightManager?.clearHover();
    this.currentHoveredMesh = null;
  }
}
