import {
  CreateSphere,
  StandardMaterial,
  Color3,
  PointLight,
  Vector3,
  GlowLayer,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { CelestialDefinition } from '../../types/celestial';

export function createSun(
  def: CelestialDefinition,
  centerX: number,
  scene: Scene,
): { mesh: Mesh; light: PointLight } {
  const sphere = CreateSphere(def.metadata.id, { diameter: def.visualRadius * 2, segments: 32 }, scene);
  sphere.position.set(centerX, def.visualRadius, 0);

  const mat = new StandardMaterial(`${def.metadata.id}-mat`, scene);
  mat.emissiveColor = Color3.FromHexString(def.color);
  mat.diffuseColor = Color3.FromHexString(def.color);
  mat.specularColor = new Color3(0, 0, 0);
  sphere.material = mat;

  sphere.metadata = { celestialId: def.metadata.id };

  // Point light emanating from the sun
  const light = new PointLight(`${def.metadata.id}-light`, new Vector3(centerX, def.visualRadius, 0), scene);
  light.intensity = 1.5;
  light.range = 50;
  light.diffuse = Color3.FromHexString('#FFF5E0');

  // Glow effect for the sun only
  const glowLayer = new GlowLayer('sunGlow', scene, { mainTextureSamples: 4 });
  glowLayer.intensity = 0.8;
  glowLayer.addIncludedOnlyMesh(sphere);

  return { mesh: sphere, light };
}
