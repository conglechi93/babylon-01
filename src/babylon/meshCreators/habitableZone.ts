/**
 * Habitable Zone visual ring.
 *
 * An annulus (ribbon) lying flat in the XZ orbital plane,
 * created at L=1 reference scale.  When stellar mass changes,
 * call setLuminosity() to rescale the ring.
 *
 * Scale law: both HZ boundaries ∝ √L  →  uniform XZ scale = √L.
 */
import { MeshBuilder, StandardMaterial, Color3, Mesh, Vector3 } from '@babylonjs/core';
import type { Scene } from '@babylonjs/core';

/** Visual units per 1 AU (Earth orbit radius = 8.5 visual at 1 AU) */
export const AU_TO_VISUAL = 8.5;

// Reference HZ at L=1 (our Sun)
const HZ_INNER_AU = 0.95;
const HZ_OUTER_AU = 1.37;

const SEGMENTS = 128;

export interface HabitableZoneApi {
  setLuminosity: (luminosity: number) => void;
}

export function createHabitableZone(
  centerX: number,
  scene: Scene,
): HabitableZoneApi {
  const innerR = HZ_INNER_AU * AU_TO_VISUAL;
  const outerR = HZ_OUTER_AU * AU_TO_VISUAL;

  // Build annulus centered at local origin (ring will be positioned via .position)
  const outerPath: Vector3[] = [];
  const innerPath: Vector3[] = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    const angle = (i / SEGMENTS) * Math.PI * 2;
    const cos   = Math.cos(angle);
    const sin   = Math.sin(angle);
    outerPath.push(new Vector3(cos * outerR, 0, sin * outerR));
    innerPath.push(new Vector3(cos * innerR, 0, sin * innerR));
  }

  const ring = MeshBuilder.CreateRibbon('hz-ring', {
    pathArray:       [outerPath, innerPath],
    closePath:       true,
    closeArray:      false,
    sideOrientation: Mesh.DOUBLESIDE,
  }, scene);

  // Place ring flat in the orbital plane
  ring.position.set(centerX, 0.01, 0);
  ring.isPickable = false;

  const mat = new StandardMaterial('hz-mat', scene);
  mat.diffuseColor    = new Color3(0.15, 0.75, 0.25);
  mat.emissiveColor   = new Color3(0.08, 0.45, 0.12);
  mat.alpha           = 0.22;
  mat.backFaceCulling = false;
  mat.disableLighting = true;
  ring.material = mat;

  return {
    setLuminosity(luminosity: number) {
      const sqrtL = Math.sqrt(Math.max(luminosity, 0.0001));
      ring.scaling.set(sqrtL, 1, sqrtL);
    },
  };
}
