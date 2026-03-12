import { MeshBuilder, Color3, Vector3 } from '@babylonjs/core';
import type { Scene, Mesh, TransformNode } from '@babylonjs/core';
import { CelestialType } from '../../types/celestial';
import { CELESTIAL_DEFINITIONS, SOLAR_SYSTEM_OFFSET_X } from '../../data/celestialDefinitions';
import { createSun } from './sun';
import { createPlanet } from './planet';
import { setupOrbitalMotion } from '../animations/orbit';
import type { SimClock } from '../animations/orbit';
import { createHabitableZone, AU_TO_VISUAL } from './habitableZone';
import type { EarthMaterialApi } from '../materials/earthMaterial';
import type { PlanetState } from '../../simulation/physics';
import { triggerExplosion } from '../effects/explosion';

export interface SolarSystemApi {
  setEarthOrbitAU:          (au: number)        => void;
  setHabitableZoneScale:    (sqrtL: number)      => void;
  setEarthTemperatureState: (state: PlanetState) => void;
  setTimeScale:             (scale: number)      => void;
  setPaused:                (paused: boolean)    => void;
  setSunMass:               (massSolar: number)  => void;
  getEarthMesh:             ()                   => Mesh | null;
}

export interface SolarSystemResult {
  pickableMeshes: Mesh[];
  api:            SolarSystemApi;
}

const EARTH_VISUAL_RADIUS    = 0.5;
const EARTH_BASE_ORBIT_SPEED = 1.0;

// ── Orbit trail (faint circle ring in the orbital plane) ─────────────────────
function addOrbitTrail(
  orbitRadius: number,
  centerX: number,
  scene: Scene,
  alpha = 0.22,
): void {
  const segments = 128;
  const pts: Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new Vector3(Math.cos(a) * orbitRadius, 0, Math.sin(a) * orbitRadius));
  }

  const line = MeshBuilder.CreateLines(`orbit-trail-${orbitRadius}`, { points: pts }, scene);
  line.position.x = centerX;
  line.color      = new Color3(0.22, 0.22, 0.40);
  line.alpha      = alpha;
  line.isPickable = false;
}

export function createSolarSystem(
  scene: Scene,
  onCollision?: (pos: Vector3) => void,
): SolarSystemResult {
  const centerX = SOLAR_SYSTEM_OFFSET_X;

  const clock: SimClock = { timeScale: 1, paused: false };

  const pickableMeshes: Mesh[] = [];
  const orbitPivots: { pivot: TransformNode; speed: number }[] = [];
  const planetMeshes = new Map<string, Mesh>();

  // Collidable targets: all non-Earth planets + Sun
  const collidables: { id: string; mesh: Mesh; baseRadius: number }[] = [];
  const destroyed   = new Set<string>();

  let earthMeshRef:  Mesh | null = null;
  let earthPivotRef: { pivot: TransformNode; speed: number } | null = null;
  let earthApiRef:   EarthMaterialApi | null = null;
  let sunApiRef:     ReturnType<typeof createSun>['sunApi'] | null = null;

  for (const def of CELESTIAL_DEFINITIONS) {
    if (def.metadata.type === CelestialType.Star) {
      const { mesh, sunApi } = createSun(def, centerX, scene);
      pickableMeshes.push(mesh);
      sunApiRef = sunApi;
      // Sun is collidable (Earth can fall into it)
      collidables.push({ id: def.metadata.id, mesh, baseRadius: def.visualRadius });

    } else if (def.metadata.type === CelestialType.Moon && def.orbitsPlanetId) {
      const parentMesh = planetMeshes.get(def.orbitsPlanetId);
      if (parentMesh) {
        const { pivot, mesh } = createPlanet(def, 0, scene, clock);
        pivot.parent = parentMesh;
        pivot.position.set(0, 0, 0);
        pickableMeshes.push(mesh);
        orbitPivots.push({ pivot, speed: def.orbitSpeed });
        // Moons are not tracked as collision targets (too small, too close)
      }

    } else {
      addOrbitTrail(
        def.orbitRadius,
        centerX,
        scene,
        def.metadata.id === 'earth' ? 0.38 : 0.18,
      );

      const { pivot, mesh, earthApi } = createPlanet(def, centerX, scene, clock);
      pickableMeshes.push(mesh);
      planetMeshes.set(def.metadata.id, mesh);

      const entry = { pivot, speed: def.orbitSpeed };
      orbitPivots.push(entry);

      if (def.metadata.id === 'earth') {
        earthMeshRef  = mesh;
        earthPivotRef = entry;
        earthApiRef   = earthApi ?? null;
      } else {
        // All other planets are collidable with Earth
        collidables.push({ id: def.metadata.id, mesh, baseRadius: def.visualRadius });
      }

      if (def.hasRings) {
        for (const child of mesh.getChildMeshes()) {
          pickableMeshes.push(child as Mesh);
        }
      }
    }
  }

  setupOrbitalMotion(scene, orbitPivots, clock);

  // ── Per-frame collision detection ─────────────────────────────────────────
  scene.registerBeforeRender(() => {
    if (!earthMeshRef || !earthMeshRef.isEnabled()) return;

    const earthPos = earthMeshRef.getAbsolutePosition();

    for (const target of collidables) {
      if (destroyed.has(target.id)) continue;
      if (!target.mesh.isEnabled())  continue;

      const otherPos = target.mesh.getAbsolutePosition();
      const dist     = Vector3.Distance(earthPos, otherPos);

      // Effective radius accounts for Sun scaling with mass
      const effectiveRadius = target.baseRadius * target.mesh.scaling.x;
      const threshold       = EARTH_VISUAL_RADIUS + effectiveRadius;

      if (dist < threshold) {
        destroyed.add(target.id);

        const midpoint = earthPos.add(otherPos).scale(0.5);

        if (target.id === 'sun') {
          // Earth falls into the Sun — Earth is destroyed, Sun stays
          destroyed.add('earth');
          triggerExplosion(midpoint, scene, earthMeshRef ?? undefined, onCollision);
        } else {
          // Earth collides with another planet — the planet is destroyed
          triggerExplosion(midpoint, scene, target.mesh, onCollision);
        }
      }
    }
  });

  const hzApi = createHabitableZone(centerX, scene);

  const api: SolarSystemApi = {
    setEarthOrbitAU(au: number) {
      if (!earthMeshRef) return;
      earthMeshRef.position.x = au * AU_TO_VISUAL;
      if (earthPivotRef) {
        earthPivotRef.speed = EARTH_BASE_ORBIT_SPEED / Math.pow(au, 1.5);
      }
    },

    setHabitableZoneScale(sqrtL: number) {
      hzApi.setLuminosity(sqrtL * sqrtL);
    },

    setEarthTemperatureState(state: PlanetState) {
      earthApiRef?.setTemperatureState(state);
    },

    setTimeScale(scale: number) {
      clock.timeScale = scale;
    },

    setPaused(paused: boolean) {
      clock.paused = paused;
    },

    setSunMass(massSolar: number) {
      sunApiRef?.setMass(massSolar);
    },

    getEarthMesh() {
      return earthMeshRef;
    },
  };

  return { pickableMeshes, api };
}
