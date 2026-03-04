export const CelestialType = {
  Star: 'Star',
  Planet: 'Planet',
} as const;

export type CelestialType = (typeof CelestialType)[keyof typeof CelestialType];

export interface CelestialMetadata {
  id: string;
  name: string;
  type: CelestialType;
  description: string;
  diameterKm: number;
  distanceAU: number;
  orbitalPeriodYears: number;
  moons: number;
}

export interface CelestialDefinition {
  metadata: CelestialMetadata;
  visualRadius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  hasRings?: boolean;
}
