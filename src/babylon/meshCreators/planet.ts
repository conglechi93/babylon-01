import {
  CreateSphere,
  CreateTorus,
  StandardMaterial,
  Color3,
  TransformNode,
} from '@babylonjs/core';
import type { Scene, Mesh } from '@babylonjs/core';
import type { CelestialDefinition } from '../../types/celestial';

export interface PlanetResult {
  pivot: TransformNode;
  mesh: Mesh;
}

export function createPlanet(
  def: CelestialDefinition,
  centerX: number,
  scene: Scene,
): PlanetResult {
  // Pivot at sun center — rotating the pivot orbits the planet
  const pivot = new TransformNode(`${def.metadata.id}-pivot`, scene);
  pivot.position.set(centerX, 0, 0);

  const sphere = CreateSphere(
    def.metadata.id,
    { diameter: def.visualRadius * 2, segments: 24 },
    scene,
  );
  // Lift planets with rings high enough so the ring doesn't clip the ground
  const yOffset = def.hasRings ? def.visualRadius * 3.5 : def.visualRadius;
  sphere.position.set(def.orbitRadius, yOffset, 0);
  sphere.parent = pivot;

  const mat = new StandardMaterial(`${def.metadata.id}-mat`, scene);
  mat.diffuseColor = Color3.FromHexString(def.color);
  mat.specularColor = new Color3(0.2, 0.2, 0.2);
  sphere.material = mat;

  sphere.metadata = { celestialId: def.metadata.id };

  // Saturn rings
  if (def.hasRings) {
    const ring = CreateTorus(
      `${def.metadata.id}-ring`,
      { diameter: def.visualRadius * 4.5, thickness: 0.12, tessellation: 48 },
      scene,
    );
    ring.parent = sphere;
    ring.rotation.x = Math.PI / 2.5;

    const ringMat = new StandardMaterial(`${def.metadata.id}-ring-mat`, scene);
    ringMat.diffuseColor = new Color3(0.85, 0.78, 0.6);
    ringMat.alpha = 0.7;
    ringMat.specularColor = new Color3(0, 0, 0);
    ring.material = ringMat;

    // Same celestialId so clicking the ring selects Saturn
    ring.metadata = { celestialId: def.metadata.id };
  }

  return { pivot, mesh: sphere };
}
