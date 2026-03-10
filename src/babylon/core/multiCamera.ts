/**
 * CameraManager
 *
 * Manages the three camera modes for the scene:
 *   - 'single' : one ArcRotateCamera, full canvas (default)
 *   - 'quad'   : four cameras split into Perspective / Top / Front / Side viewports
 *   - 'pip'    : main camera full-screen + a small Picture-in-Picture orbit camera
 *
 * Key BabylonJS concepts used here:
 *   scene.activeCameras[]      — array of cameras each rendered to its own viewport
 *   scene.activeCamera         — single camera used when activeCameras is empty
 *   camera.viewport            — Viewport(left, bottom, width, height) in 0–1 space,
 *                                origin at bottom-left
 *   scene.cameraToUseForPointers — which camera casts pick rays for pointer events;
 *                                  must be set explicitly in multi-camera setups
 *   Camera.ORTHOGRAPHIC_CAMERA — parallel projection, no perspective distortion
 *
 * PiP camera design note:
 *   ArcRotateCamera.setTarget() internally calls rebuildAnglesAndRadius(), which
 *   recomputes alpha from the camera's current world position. Calling this every
 *   frame conflicts with a manually accumulated orbit angle. UniversalCamera avoids
 *   this: position and look-at are set directly each frame via trigonometry.
 */
import {
  ArcRotateCamera,
  UniversalCamera,
  Viewport,
  Vector3,
  Camera,
} from '@babylonjs/core';
import type { Scene, AbstractMesh, Observer } from '@babylonjs/core';

export type CameraMode = 'single' | 'quad' | 'pip';

const SCENE_TARGET = new Vector3(15, 0, -2);
const ORTHO_RADIUS = 80;

const PIP_ORBIT_RADIUS = 14;
const PIP_ORBIT_HEIGHT = 5;

export class CameraManager {
  private scene: Scene;

  private mainCamera: ArcRotateCamera;
  private topCamera: ArcRotateCamera;
  private frontCamera: ArcRotateCamera;
  private sideCamera: ArcRotateCamera;

  /**
   * PiP camera (UniversalCamera).
   * Position is computed manually each frame via polar coordinates so that
   * orbit angle accumulates without interference from BabylonJS internals.
   */
  private pipCamera: UniversalCamera;

  private _followTarget: AbstractMesh | null = null;
  private _orbitAngle = Math.PI / 4;
  private _pipObserver: Observer<Scene> | null = null;

  mode: CameraMode = 'single';

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.scene = scene;

    // ── Main camera ────────────────────────────────────────────────────────────
    this.mainCamera = new ArcRotateCamera(
      'cam-main',
      -Math.PI / 2,
      Math.PI / 3,
      35,
      SCENE_TARGET,
      scene,
    );
    this.mainCamera.attachControl(canvas, false);
    this.mainCamera.lowerRadiusLimit = 5;
    this.mainCamera.upperRadiusLimit = 100;
    this.mainCamera.inertia = 0.85;
    this.mainCamera.wheelDeltaPercentage = 0.06;

    // ── Orthographic cameras for quad view ────────────────────────────────────
    // beta ≈ 0 — looking straight down; exact 0 causes gimbal lock
    this.topCamera = new ArcRotateCamera('cam-top', -Math.PI / 2, 0.01, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.topCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.topCamera.orthoTop    =  48;
    this.topCamera.orthoBottom = -48;
    this.topCamera.orthoLeft   = -32;
    this.topCamera.orthoRight  =  80;

    // beta = π/2 — looking horizontally from +Z
    this.frontCamera = new ArcRotateCamera('cam-front', -Math.PI / 2, Math.PI / 2, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.frontCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.frontCamera.orthoTop    =  38;
    this.frontCamera.orthoBottom = -38;
    this.frontCamera.orthoLeft   = -28;
    this.frontCamera.orthoRight  =  70;

    // alpha = 0 — looking horizontally from +X
    this.sideCamera = new ArcRotateCamera('cam-side', 0, Math.PI / 2, ORTHO_RADIUS, SCENE_TARGET, scene);
    this.sideCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
    this.sideCamera.orthoTop    =  38;
    this.sideCamera.orthoBottom = -38;
    this.sideCamera.orthoLeft   = -55;
    this.sideCamera.orthoRight  =  55;

    // ── PiP camera ─────────────────────────────────────────────────────────────
    // Starts at orbit position around SCENE_TARGET; no attachControl (read-only).
    this.pipCamera = new UniversalCamera(
      'cam-pip',
      new Vector3(
        SCENE_TARGET.x + Math.sin(this._orbitAngle) * PIP_ORBIT_RADIUS,
        SCENE_TARGET.y + PIP_ORBIT_HEIGHT,
        SCENE_TARGET.z + Math.cos(this._orbitAngle) * PIP_ORBIT_RADIUS,
      ),
      scene,
    );
    this.pipCamera.setTarget(SCENE_TARGET);

    // Reposition the PiP camera every frame around the current follow target.
    // Uses getAbsolutePosition() to correctly handle meshes parented to a pivot
    // (e.g. planets attached to a TransformNode for orbital motion).
    this._pipObserver = scene.onBeforeRenderObservable.add(() => {
      if (!this._followTarget) return;

      this._orbitAngle += 0.008;
      const t = this._followTarget.getAbsolutePosition();

      this.pipCamera.position.set(
        t.x + Math.sin(this._orbitAngle) * PIP_ORBIT_RADIUS,
        t.y + PIP_ORBIT_HEIGHT,
        t.z + Math.cos(this._orbitAngle) * PIP_ORBIT_RADIUS,
      );
      this.pipCamera.setTarget(t);
    });

    scene.activeCamera = this.mainCamera;

    // Ensure pointer picks always use the main camera's ray, regardless of how
    // many cameras are active. Without this, BabylonJS uses the last camera in
    // activeCameras[], which would be pipCamera — pointing in the wrong direction.
    scene.cameraToUseForPointers = this.mainCamera;
  }

  setMode(mode: CameraMode): void {
    this.mode = mode;

    if (mode === 'single') {
      this.mainCamera.viewport = new Viewport(0, 0, 1, 1);
      this.scene.activeCameras = [];
      this.scene.activeCamera  = this.mainCamera;

    } else if (mode === 'quad') {
      /**
       * Viewport layout (bottom-left origin):
       *
       *  ┌─────────────┬─────────────┐  y=1
       *  │ Perspective │    Top      │
       *  ├─────────────┼─────────────┤  y=0.5
       *  │    Front    │    Side     │
       *  └─────────────┴─────────────┘  y=0
       *  x=0          x=0.5          x=1
       */
      this.mainCamera.viewport  = new Viewport(0,   0.5, 0.5, 0.5);
      this.topCamera.viewport   = new Viewport(0.5, 0.5, 0.5, 0.5);
      this.frontCamera.viewport = new Viewport(0,   0,   0.5, 0.5);
      this.sideCamera.viewport  = new Viewport(0.5, 0,   0.5, 0.5);

      this.scene.activeCameras = [
        this.mainCamera,
        this.topCamera,
        this.frontCamera,
        this.sideCamera,
      ];

    } else if (mode === 'pip') {
      // Main camera fills the canvas; PiP occupies the bottom-right 28×34%.
      this.mainCamera.viewport = new Viewport(0,   0,    1,    1);
      this.pipCamera.viewport  = new Viewport(0.7, 0.02, 0.28, 0.34);

      this.scene.activeCameras = [this.mainCamera, this.pipCamera];
    }
  }

  /**
   * Set the mesh the PiP camera orbits around.
   * Called directly from the picking callback with the actual AbstractMesh,
   * avoiding a secondary getMeshByName lookup.
   */
  setFollowTarget(mesh: AbstractMesh | null): void {
    this._followTarget = mesh;

    if (mesh) {
      // Snap to a consistent starting angle so the camera doesn't sweep
      // across the scene when switching from one target to another.
      this._orbitAngle = Math.PI / 4;
      const t = mesh.getAbsolutePosition();
      this.pipCamera.position.set(
        t.x + Math.sin(this._orbitAngle) * PIP_ORBIT_RADIUS,
        t.y + PIP_ORBIT_HEIGHT,
        t.z + Math.cos(this._orbitAngle) * PIP_ORBIT_RADIUS,
      );
      this.pipCamera.setTarget(t);
    }
  }

  getMainCamera(): ArcRotateCamera {
    return this.mainCamera;
  }

  dispose(): void {
    if (this._pipObserver) {
      this.scene.onBeforeRenderObservable.remove(this._pipObserver);
      this._pipObserver = null;
    }
    this.mainCamera.dispose();
    this.topCamera.dispose();
    this.frontCamera.dispose();
    this.sideCamera.dispose();
    this.pipCamera.dispose();
  }
}
