import type { Scene, Mesh } from '@babylonjs/core';
import { CelestialType } from '../types/celestial';
import { CELESTIAL_DEFINITIONS, SOLAR_SYSTEM_OFFSET_X } from '../data/celestialDefinitions';
import { createSun } from './meshCreators/sun';
import { createPlanet } from './meshCreators/planet';
import { createSolarGround } from './meshCreators/solarGround';
import { setupOrbitalMotion } from './animations/orbit';
import type { TransformNode } from '@babylonjs/core';

export interface SolarSystemResult {
  pickableMeshes: Mesh[];
}

export function createSolarSystem(scene: Scene): SolarSystemResult {
  const centerX = SOLAR_SYSTEM_OFFSET_X;
  createSolarGround(centerX, scene);

  const pickableMeshes: Mesh[] = [];
  const orbitPivots: { pivot: TransformNode; speed: number }[] = [];

  for (const def of CELESTIAL_DEFINITIONS) {
    if (def.metadata.type === CelestialType.Star) {
      const { mesh } = createSun(def, centerX, scene);
      pickableMeshes.push(mesh);
    } else {
      const { pivot, mesh } = createPlanet(def, centerX, scene);
      pickableMeshes.push(mesh);
      orbitPivots.push({ pivot, speed: def.orbitSpeed });

      // If planet has rings, the ring torus is a child — add it as pickable too
      if (def.hasRings) {
        for (const child of mesh.getChildMeshes()) {
          pickableMeshes.push(child as Mesh);
        }
      }
    }
  }

  setupOrbitalMotion(scene, orbitPivots);

  return { pickableMeshes };
}
