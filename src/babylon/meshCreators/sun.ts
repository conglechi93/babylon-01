import {
  CreateSphere,
  StandardMaterial,
  Color3,
  PointLight,
  Vector3,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { CelestialDefinition } from '../../types/celestial';
import { applySunMaterial } from '../materials/sunMaterial';
import { calcSunRadius, getSpectralClass, SPECTRAL_COLOR } from '../../simulation/physics';

export interface SunApi {
  /** Scale the sun mesh and update colour for a new stellar mass (in M☉). */
  setMass: (massSolar: number) => void;
}

export function createSun(
  def: CelestialDefinition,
  centerX: number,
  scene: Scene,
): { mesh: Mesh; light: PointLight; sunApi: SunApi } {
  const sphere = CreateSphere(def.metadata.id, {
    diameter: def.visualRadius * 2,
    segments: 32,
  }, scene);

  // Sun sits at the orbital plane (y = 0), same level as all planets
  sphere.position.set(centerX, 0, 0);

  const tempMat = new StandardMaterial(`${def.metadata.id}-temp`, scene);
  tempMat.emissiveColor = Color3.FromHexString(def.color);
  sphere.material = tempMat;

  sphere.metadata = { celestialId: def.metadata.id };

  // Animated surface texture + glow + corona halo
  const sunMatApi = applySunMaterial(sphere, scene, def.visualRadius);

  // Point light at the sun's world position
  const light = new PointLight(
    `${def.metadata.id}-light`,
    new Vector3(centerX, 0, 0),
    scene,
  );
  light.intensity = 2.2;
  light.range     = 200;
  light.diffuse   = Color3.FromHexString('#FFF8EC');

  const sunApi: SunApi = {
    setMass(massSolar: number) {
      // Rescale mesh (visual radius ∝ R_star ∝ M^0.8)
      const radiusScale = calcSunRadius(massSolar);
      sphere.scaling.setAll(radiusScale);

      // Update point light intensity (L ∝ M^3.5 → capped to avoid blow-out)
      const lum = Math.pow(Math.max(massSolar, 0.01), 3.5);
      light.intensity = Math.min(1.0 + lum * 0.5, 8);

      // Tint surface + corona to spectral class colour
      const spectral = getSpectralClass(massSolar);
      const hexColor = SPECTRAL_COLOR[spectral];
      sunMatApi.setSpectralColor(hexColor);
    },
  };

  return { mesh: sphere, light, sunApi };
}
