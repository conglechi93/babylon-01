import { CelestialType } from '../types/celestial';
import type { CelestialDefinition } from '../types/celestial';

export const SOLAR_SYSTEM_OFFSET_X = 30;

export const CELESTIAL_DEFINITIONS: CelestialDefinition[] = [
  {
    metadata: {
      id: 'sun',
      name: 'Sun',
      type: CelestialType.Star,
      description:
        'The star at the center of our Solar System. A nearly perfect ball of hot plasma that provides energy for life on Earth.',
      diameterKm: 1_392_700,
      distanceAU: 0,
      orbitalPeriodYears: 0,
      moons: 0,
    },
    visualRadius: 2.5,
    orbitRadius: 0,
    orbitSpeed: 0,
    color: '#FDB813',
  },
  {
    metadata: {
      id: 'mercury',
      name: 'Mercury',
      type: CelestialType.Planet,
      description:
        'The smallest planet and closest to the Sun. Its surface is heavily cratered, resembling the Moon.',
      diameterKm: 4_879,
      distanceAU: 0.39,
      orbitalPeriodYears: 0.24,
      moons: 0,
    },
    visualRadius: 0.25,
    orbitRadius: 4.5,
    orbitSpeed: 1.6,
    color: '#B0B0B0',
  },
  {
    metadata: {
      id: 'venus',
      name: 'Venus',
      type: CelestialType.Planet,
      description:
        'The hottest planet due to its thick CO₂ atmosphere. It rotates in the opposite direction to most planets.',
      diameterKm: 12_104,
      distanceAU: 0.72,
      orbitalPeriodYears: 0.62,
      moons: 0,
    },
    visualRadius: 0.45,
    orbitRadius: 6.5,
    orbitSpeed: 1.2,
    color: '#E8CDA0',
  },
  {
    metadata: {
      id: 'earth',
      name: 'Earth',
      type: CelestialType.Planet,
      description:
        'Our home world. The only known planet to harbor life, with liquid water covering about 71% of its surface.',
      diameterKm: 12_756,
      distanceAU: 1.0,
      orbitalPeriodYears: 1.0,
      moons: 1,
    },
    visualRadius: 0.5,
    orbitRadius: 8.5,
    orbitSpeed: 1.0,
    color: '#4A90D9',
  },
  {
    metadata: {
      id: 'moon',
      name: 'Moon',
      type: CelestialType.Moon,
      description:
        "Earth's only natural satellite. Its gravitational pull causes ocean tides and stabilizes Earth's axial tilt.",
      diameterKm: 3_474,
      distanceAU: 0.00257,
      orbitalPeriodYears: 0.0748,
      moons: 0,
    },
    visualRadius: 0.15,
    orbitRadius: 1.0,
    orbitSpeed: 3.5,
    color: '#AAAAAA',
    orbitsPlanetId: 'earth',
  },
  {
    metadata: {
      id: 'mars',
      name: 'Mars',
      type: CelestialType.Planet,
      description:
        'The Red Planet. Home to the largest volcano (Olympus Mons) and canyon (Valles Marineris) in the Solar System.',
      diameterKm: 6_792,
      distanceAU: 1.52,
      orbitalPeriodYears: 1.88,
      moons: 2,
    },
    visualRadius: 0.35,
    orbitRadius: 10.5,
    orbitSpeed: 0.8,
    color: '#C1440E',
  },
  {
    metadata: {
      id: 'jupiter',
      name: 'Jupiter',
      type: CelestialType.Planet,
      description:
        'The largest planet in our Solar System. Its Great Red Spot is a storm larger than Earth that has raged for centuries.',
      diameterKm: 142_984,
      distanceAU: 5.2,
      orbitalPeriodYears: 11.86,
      moons: 95,
    },
    visualRadius: 1.2,
    orbitRadius: 14,
    orbitSpeed: 0.45,
    color: '#C88B3A',
  },
  {
    metadata: {
      id: 'saturn',
      name: 'Saturn',
      type: CelestialType.Planet,
      description:
        'Famous for its spectacular ring system made of ice and rock. It is the least dense planet — it could float in water.',
      diameterKm: 120_536,
      distanceAU: 9.54,
      orbitalPeriodYears: 29.46,
      moons: 146,
    },
    visualRadius: 1.0,
    orbitRadius: 18,
    orbitSpeed: 0.3,
    color: '#E8D191',
    hasRings: true,
  },
  {
    metadata: {
      id: 'uranus',
      name: 'Uranus',
      type: CelestialType.Planet,
      description:
        'An ice giant that rotates on its side. It has a faint ring system and a blue-green color from methane in its atmosphere.',
      diameterKm: 51_118,
      distanceAU: 19.2,
      orbitalPeriodYears: 84.01,
      moons: 28,
    },
    visualRadius: 0.7,
    orbitRadius: 22,
    orbitSpeed: 0.2,
    color: '#73C2D0',
  },
  {
    metadata: {
      id: 'neptune',
      name: 'Neptune',
      type: CelestialType.Planet,
      description:
        'The most distant planet. It has the strongest winds in the Solar System, reaching speeds of 2,100 km/h.',
      diameterKm: 49_528,
      distanceAU: 30.06,
      orbitalPeriodYears: 164.8,
      moons: 16,
    },
    visualRadius: 0.65,
    orbitRadius: 25.5,
    orbitSpeed: 0.15,
    color: '#3F54BA',
  },
];
