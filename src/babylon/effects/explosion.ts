/**
 * Explosion effect — triggered when two planets collide.
 *
 *  3 particle layers:
 *    1. Core burst  — fast white/yellow sparks
 *    2. Fire ring   — slower orange/red fireball
 *    3. Debris      — slow dark fragments that fall with gravity
 *
 *  + PointLight flash that fades in 0.4 s
 *  + Target mesh shrinks to zero and is disabled
 */
import {
  ParticleSystem,
  DynamicTexture,
  Vector3,
  Color4,
  Color3,
  PointLight,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';

/** Procedurally generate a soft radial glow texture */
function makeGlowTex(scene: Scene): DynamicTexture {
  const tex = new DynamicTexture('exp-glow', { width: 32, height: 32 }, scene, false);
  const ctx = tex.getContext() as CanvasRenderingContext2D;
  const g   = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0,   'rgba(255,255,255,1)');
  g.addColorStop(0.25,'rgba(255,220,80,0.9)');
  g.addColorStop(0.6, 'rgba(255,80,20,0.5)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  tex.update();
  // Auto-dispose after all particles have finished
  setTimeout(() => tex.dispose(), 3000);
  return tex;
}

export function triggerExplosion(
  position: Vector3,
  scene:    Scene,
  targetMesh?: Mesh,
  onShake?: (pos: Vector3) => void,
): void {
  const tex = makeGlowTex(scene);
  const pos = position.clone();

  // ── 1. Flash light ────────────────────────────────────────────────────────
  const flash       = new PointLight('exp-flash', pos, scene);
  flash.diffuse     = new Color3(1, 0.65, 0.25);
  flash.intensity   = 20;
  flash.range       = 30;

  let flashT = 0;
  const flashObs = scene.onBeforeRenderObservable.add(() => {
    flashT += scene.getEngine().getDeltaTime() / 1000;
    flash.intensity = 20 * Math.max(0, 1 - flashT / 0.45);
    if (flashT >= 0.45) {
      flash.dispose();
      scene.onBeforeRenderObservable.remove(flashObs);
    }
  });

  // ── 2. Core burst (white / yellow, very fast) ─────────────────────────────
  const core = new ParticleSystem('exp-core', 140, scene);
  core.particleTexture    = tex;
  core.emitter            = pos;
  core.minEmitBox         = new Vector3(-0.08, -0.08, -0.08);
  core.maxEmitBox         = new Vector3( 0.08,  0.08,  0.08);
  core.direction1         = new Vector3(-1, -1, -1);
  core.direction2         = new Vector3( 1,  1,  1);
  core.color1             = new Color4(1,    1,    0.85, 1);
  core.color2             = new Color4(1,    0.75, 0.2,  1);
  core.colorDead          = new Color4(1,    0.3,  0,    0);
  core.minSize            = 0.06;  core.maxSize        = 0.26;
  core.minLifeTime        = 0.08;  core.maxLifeTime    = 0.30;
  core.emitRate           = 900;
  core.minEmitPower       = 5;     core.maxEmitPower   = 11;
  core.updateSpeed        = 0.02;
  core.blendMode          = ParticleSystem.BLENDMODE_ADD;
  core.gravity            = new Vector3(0, -0.4, 0);
  core.targetStopDuration = 0.10;
  core.disposeOnStop      = true;
  core.start();

  // ── 3. Fire ring (orange / red, medium speed) ─────────────────────────────
  const fire = new ParticleSystem('exp-fire', 200, scene);
  fire.particleTexture    = tex;
  fire.emitter            = pos;
  fire.minEmitBox         = new Vector3(-0.18, -0.18, -0.18);
  fire.maxEmitBox         = new Vector3( 0.18,  0.18,  0.18);
  fire.direction1         = new Vector3(-1, -1, -1);
  fire.direction2         = new Vector3( 1,  1,  1);
  fire.color1             = new Color4(1,    0.42, 0.04, 1);
  fire.color2             = new Color4(0.85, 0.18, 0.02, 1);
  fire.colorDead          = new Color4(0.2,  0.05, 0,    0);
  fire.minSize            = 0.14;  fire.maxSize        = 0.55;
  fire.minLifeTime        = 0.28;  fire.maxLifeTime    = 0.75;
  fire.emitRate           = 450;
  fire.minEmitPower       = 1.8;   fire.maxEmitPower   = 5;
  fire.updateSpeed        = 0.018;
  fire.blendMode          = ParticleSystem.BLENDMODE_ADD;
  fire.gravity            = new Vector3(0, -0.25, 0);
  fire.targetStopDuration = 0.20;
  fire.disposeOnStop      = true;
  fire.start();

  // ── 4. Debris (dark rocks, slow, long lifetime) ───────────────────────────
  const debris = new ParticleSystem('exp-debris', 90, scene);
  debris.particleTexture    = tex;
  debris.emitter            = pos;
  debris.minEmitBox         = new Vector3(-0.12, -0.12, -0.12);
  debris.maxEmitBox         = new Vector3( 0.12,  0.12,  0.12);
  debris.direction1         = new Vector3(-1, -1, -1);
  debris.direction2         = new Vector3( 1,  1,  1);
  debris.color1             = new Color4(0.55, 0.28, 0.08, 1);
  debris.color2             = new Color4(0.28, 0.12, 0.04, 1);
  debris.colorDead          = new Color4(0.08, 0.03, 0,    0);
  debris.minSize            = 0.04;  debris.maxSize        = 0.16;
  debris.minLifeTime        = 0.55;  debris.maxLifeTime    = 1.40;
  debris.emitRate           = 160;
  debris.minEmitPower       = 0.5;   debris.maxEmitPower   = 2.2;
  debris.updateSpeed        = 0.015;
  debris.blendMode          = ParticleSystem.BLENDMODE_STANDARD;
  debris.gravity            = new Vector3(0, -1.5, 0);
  debris.targetStopDuration = 0.28;
  debris.disposeOnStop      = true;
  debris.start();

  // ── 5. Camera shake ───────────────────────────────────────────────────────
  onShake?.(pos);

  // ── 6. Destroy target planet (shrink → hide) ──────────────────────────────
  if (targetMesh) {
    let dt = 0;
    const shrinkObs = scene.onBeforeRenderObservable.add(() => {
      dt += scene.getEngine().getDeltaTime() / 1000;
      const s = Math.max(0, 1 - dt * 3.5); // ~0.28 s to collapse
      targetMesh.scaling.setAll(s);
      // Scale all children (atmosphere, overlay spheres) too
      for (const child of targetMesh.getChildMeshes()) {
        // preserve child's own relative scale while collapsing parent
        void child; // children inherit parent scale automatically
      }
      if (s <= 0) {
        targetMesh.setEnabled(false);
        scene.onBeforeRenderObservable.remove(shrinkObs);
      }
    });
  }
}
