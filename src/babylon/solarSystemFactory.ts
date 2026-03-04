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
  const planetMeshes = new Map<string, Mesh>();

  for (const def of CELESTIAL_DEFINITIONS) {
    if (def.metadata.type === CelestialType.Star) {
      const { mesh } = createSun(def, centerX, scene);
      pickableMeshes.push(mesh);
    } else if (def.metadata.type === CelestialType.Moon && def.orbitsPlanetId) {
      // Moon: pivot parented to its planet mesh so it orbits the planet
      const parentMesh = planetMeshes.get(def.orbitsPlanetId);
      if (parentMesh) {
        const { pivot, mesh } = createPlanet(def, 0, scene);
        pivot.parent = parentMesh;
        pivot.position.set(0, 0, 0);
        pickableMeshes.push(mesh);
        orbitPivots.push({ pivot, speed: def.orbitSpeed });
      }
    } else {
      const { pivot, mesh } = createPlanet(def, centerX, scene);
      pickableMeshes.push(mesh);
      planetMeshes.set(def.metadata.id, mesh);
      orbitPivots.push({ pivot, speed: def.orbitSpeed });

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
