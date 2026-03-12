import {
  CreateSphere,
  CreateTorus,
  StandardMaterial,
  Color3,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { CelestialDefinition } from '../../types/celestial';
import { applyEarthMaterial } from '../materials/earthMaterial';
import type { EarthMaterialApi } from '../materials/earthMaterial';
import type { SimClock } from '../animations/orbit';

export interface PlanetResult {
  pivot:     TransformNode;
  mesh:      Mesh;
  earthApi?: EarthMaterialApi;
}

/** World position of the Sun (matches SOLAR_SYSTEM_OFFSET_X=30, sun y=0) */
const SUN_WORLD_POS = new Vector3(30, 0, 0);

export function createPlanet(
  def: CelestialDefinition,
  centerX: number,
  scene: Scene,
  clock?: SimClock,
): PlanetResult {
  const pivot = new TransformNode(`${def.metadata.id}-pivot`, scene);
  pivot.position.set(centerX, 0, 0);

  const sphere = CreateSphere(def.metadata.id, {
    diameter: def.visualRadius * 2,
    segments: def.metadata.id === 'earth' ? 48 : 24,
  }, scene);

  // ── All planets sit flat in the orbital plane (y = 0) ───────────────────
  sphere.position.set(def.orbitRadius, 0, 0);
  sphere.parent = pivot;
  sphere.metadata = { celestialId: def.metadata.id };

  // ── Earth: full GLSL shader + atmosphere ─────────────────────────────────
  let earthApi: EarthMaterialApi | undefined;

  if (def.metadata.id === 'earth') {
    earthApi = applyEarthMaterial(sphere, scene, SUN_WORLD_POS, def.visualRadius);

    // Day-cycle self-rotation (respects clock)
    scene.registerBeforeRender(() => {
      if (clock?.paused) return;
      const delta = scene.getEngine().getDeltaTime() / 1000;
      sphere.rotation.y += 0.35 * delta * (clock?.timeScale ?? 1);
    });
  } else {
    const mat = new StandardMaterial(`${def.metadata.id}-mat`, scene);
    mat.diffuseColor  = Color3.FromHexString(def.color);
    mat.specularColor = new Color3(0.1, 0.1, 0.1);
    sphere.material   = mat;
  }

  // ── Saturn-style rings ────────────────────────────────────────────────────
  if (def.hasRings) {
    const ring = CreateTorus(`${def.metadata.id}-ring`, {
      diameter:     def.visualRadius * 4.5,
      thickness:    0.12,
      tessellation: 48,
    }, scene);
    ring.parent     = sphere;
    ring.rotation.x = Math.PI / 2.5;

    const ringMat = new StandardMaterial(`${def.metadata.id}-ring-mat`, scene);
    ringMat.diffuseColor  = new Color3(0.85, 0.78, 0.6);
    ringMat.alpha         = 0.7;
    ringMat.specularColor = new Color3(0, 0, 0);
    ring.material         = ringMat;
    ring.metadata         = { celestialId: def.metadata.id };
  }

  return { pivot, mesh: sphere, earthApi };
}
