import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { SimulationContext } from './SimulationContext';
import {
  calcLuminosity,
  calcEffectiveTemp,
  calcHabitableZone,
  calcOrbitalPeriod,
  getPlanetState,
  getSpectralClass,
} from './physics';

const EARTH_ALBEDO = 0.30; // ~30 % reflected (Bond albedo)

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [sunMassSolar, setSunMassRaw]    = useState(1.0);
  const [earthOrbitAU, setEarthOrbitRaw] = useState(1.0);
  const [timeScale,    setTimeScaleRaw]  = useState(1.0);
  const [paused,       setPausedRaw]     = useState(false);

  const setSunMass = useCallback((mass: number) => {
    setSunMassRaw(Math.max(0.1, Math.min(mass, 10)));
  }, []);

  const setEarthOrbit = useCallback((au: number) => {
    setEarthOrbitRaw(Math.max(0.3, Math.min(au, 3)));
  }, []);

  const setTimeScale = useCallback((scale: number) => {
    setTimeScaleRaw(Math.max(0.1, Math.min(scale, 100)));
  }, []);

  const setPaused = useCallback((p: boolean) => {
    setPausedRaw(p);
  }, []);

  const value = useMemo(() => {
    const luminosity          = calcLuminosity(sunMassSolar);
    const earthTempK          = calcEffectiveTemp(luminosity, earthOrbitAU, EARTH_ALBEDO);
    const habitableZone       = calcHabitableZone(luminosity);
    const planetState         = getPlanetState(earthTempK);
    const orbitalPeriodDays   = calcOrbitalPeriod(earthOrbitAU, sunMassSolar) * 365.25;
    const spectralClass       = getSpectralClass(sunMassSolar);

    return {
      sunMassSolar,
      earthOrbitAU,
      timeScale,
      paused,
      luminosity,
      earthTempK,
      habitableZone,
      planetState,
      orbitalPeriodDays,
      spectralClass,
      setSunMass,
      setEarthOrbit,
      setTimeScale,
      setPaused,
    };
  }, [sunMassSolar, earthOrbitAU, timeScale, paused, setSunMass, setEarthOrbit, setTimeScale, setPaused]);

  return <SimulationContext value={value}>{children}</SimulationContext>;
}
