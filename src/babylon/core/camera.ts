import {
  ArcRotateCamera,
  UniversalCamera,
  Viewport,
  Vector3,
  Camera,
} from '@babylonjs/core';
import type { Scene, AbstractMesh, Observer } from '@babylonjs/core';

export type CameraMode = 'single' | 'quad';

const SCENE_TARGET = new Vector3(15, 0, -2);
const ORTHO_RADIUS = 80;

const FOLLOW_RADIUS = 2.6;
const FOLLOW_HEIGHT = 0.9;
const FOLLOW_SPEED  = 0.007;

const FOLLOW_VP = new Viewport(0.70, 0.02, 0.28, 0.34);

export class CameraManager {
  private scene: Scene;

  private mainCamera:  ArcRotateCamera;
  private topCamera:   ArcRotateCamera;
  private frontCamera: ArcRotateCamera;
  private sideCamera:  ArcRotateCamera;
  private followCam:   UniversalCamera;

  private _target:   AbstractMesh | null = null;
  private _angle     = 0;
  private _observer: Observer<Scene> | null = null;

  mode: CameraMode = 'single';

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;

    // ── Main camera ──────────────────────────────────────────────────────────
    this.mainCamera = new ArcRotateCamera('cam-main', -Math.PI / 2, Math.PI / 3, 35, SCENE_TARGET, scene);
    this.mainCamera.attachControl(canvas, false);
    this.mainCamera.lowerRadiusLimit     = 5;
    this.mainCamera.upperRadiusLimit     = 100;
    this.mainCamera.inertia              = 0.85;
    this.mainCamera.wheelDeltaPercentage = 0.06;

    // ── Orthographic cameras ─────────────────────────────────────────────────
    this.topCamera = new ArcRotateCamera('cam-top', -Math.PI / 2, 0.01, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.topCamera.mode      = Camera.ORTHOGRAPHIC_CAMERA;
    this.topCamera.orthoTop  =  48; this.topCamera.orthoBottom = -48;
    this.topCamera.orthoLeft = -32; this.topCamera.orthoRight  =  80;

    this.frontCamera = new ArcRotateCamera('cam-front', -Math.PI / 2, Math.PI / 2, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.frontCamera.mode      = Camera.ORTHOGRAPHIC_CAMERA;
    this.frontCamera.orthoTop  =  38; this.frontCamera.orthoBottom = -38;
    this.frontCamera.orthoLeft = -28; this.frontCamera.orthoRight  =  70;

    this.sideCamera = new ArcRotateCamera('cam-side', 0, Math.PI / 2, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.sideCamera.mode      = Camera.ORTHOGRAPHIC_CAMERA;
    this.sideCamera.orthoTop  =  38; this.sideCamera.orthoBottom = -38;
    this.sideCamera.orthoLeft = -55; this.sideCamera.orthoRight  =  55;

    // ── Follow / orbit camera (bottom-right overlay, single mode only) ────────
    this.followCam = new UniversalCamera('cam-follow', new Vector3(0, FOLLOW_HEIGHT, FOLLOW_RADIUS), scene);
    this.followCam.setTarget(Vector3.Zero());
    this.followCam.viewport = FOLLOW_VP;

    this._observer = scene.onBeforeRenderObservable.add(() => {
      if (!this._target) return;
      this._angle += FOLLOW_SPEED;
      const t = this._target.getAbsolutePosition();
      this.followCam.position.set(
        t.x + Math.sin(this._angle) * FOLLOW_RADIUS,
        t.y + FOLLOW_HEIGHT,
        t.z + Math.cos(this._angle) * FOLLOW_RADIUS,
      );
      this.followCam.setTarget(t);
    });

    scene.activeCamera           = this.mainCamera;
    scene.cameraToUseForPointers = this.mainCamera;

    this.setMode('single');
  }

  /** Set which mesh the follow cam orbits. */
  setFollowTarget(mesh: AbstractMesh | null): void {
    this._target = mesh;
    if (mesh) {
      this._angle = Math.PI / 4;
      // Add follow cam to active cameras (single mode only)
      if (this.mode === 'single' && !this.scene.activeCameras?.includes(this.followCam)) {
        this.scene.activeCameras = [this.mainCamera, this.followCam];
      }
    } else {
      // Remove follow cam — only main camera stays
      if (this.mode === 'single') {
        this.scene.activeCameras = [this.mainCamera];
      }
    }
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;

    if (mode === 'single') {
      this.mainCamera.viewport = new Viewport(0, 0, 1, 1);
      // followCam only added when a target is active (see setFollowTarget)
      this.scene.activeCameras = [this.mainCamera];
      this.scene.activeCamera  = this.mainCamera;

    } else if (mode === 'quad') {
      // Follow cam hidden in quad mode
      this.mainCamera.viewport  = new Viewport(0,   0.5, 0.5, 0.5);
      this.topCamera.viewport   = new Viewport(0.5, 0.5, 0.5, 0.5);
      this.frontCamera.viewport = new Viewport(0,   0,   0.5, 0.5);
      this.sideCamera.viewport  = new Viewport(0.5, 0,   0.5, 0.5);

      this.scene.activeCameras = [
        this.mainCamera, this.topCamera, this.frontCamera, this.sideCamera,
      ];
    }
  }

  /** Camera shake on collision. */
  shakeCamera(intensity = 0.55): void {
    let t = 0;
    const obs = this.scene.onBeforeRenderObservable.add(() => {
      t += this.scene.getEngine().getDeltaTime() / 1000;
      const factor = Math.max(0, 1 - t / 0.5) * intensity;
      this.mainCamera.target.addInPlaceFromFloats(
        (Math.random() - 0.5) * factor,
        (Math.random() - 0.5) * factor * 0.4,
        (Math.random() - 0.5) * factor,
      );
      if (t >= 0.5) this.scene.onBeforeRenderObservable.remove(obs);
    });
  }

  getMainCamera(): ArcRotateCamera { return this.mainCamera; }

  dispose(): void {
    if (this._observer) {
      this.scene.onBeforeRenderObservable.remove(this._observer);
      this._observer = null;
    }
    this.mainCamera.dispose();
    this.topCamera.dispose();
    this.frontCamera.dispose();
    this.sideCamera.dispose();
    this.followCam.dispose();
  }
}
