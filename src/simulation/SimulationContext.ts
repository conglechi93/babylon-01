import { createContext, useContext } from 'react';
import type { PlanetState, SpectralClass } from './physics';

export interface SimulationState {
  // ── User-controlled ────────────────────────────────────────────────────────
  sunMassSolar: number;   // 0.1 – 10  (1.0 = our Sun)
  earthOrbitAU: number;   // 0.3 – 3   (1.0 = current Earth)
  timeScale:    number;   // simulation speed multiplier (0.1 – 100)
  paused:       boolean;  // pause all orbital/rotation motion

  // ── Derived (read-only) ────────────────────────────────────────────────────
  luminosity:         number;
  earthTempK:         number;
  habitableZone:      { inner: number; outer: number };
  planetState:        PlanetState;
  orbitalPeriodDays:  number;   // Earth's orbital period at current au + mass
  spectralClass:      SpectralClass;

  // ── Actions ────────────────────────────────────────────────────────────────
  setSunMass:    (mass: number)    => void;
  setEarthOrbit: (au:   number)    => void;
  setTimeScale:  (scale: number)   => void;
  setPaused:     (paused: boolean) => void;
}

export const SimulationContext = createContext<SimulationState | null>(null);

export function useSimulation(): SimulationState {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used inside <SimulationProvider>');
  return ctx;
}
