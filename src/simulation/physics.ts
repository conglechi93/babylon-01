// ─────────────────────────────────────────────────────────────────────────────
// Universe Sandbox – Physics engine (pure functions, no Babylon dependency)
// ─────────────────────────────────────────────────────────────────────────────

export type PlanetState = 'frozen' | 'habitable' | 'hot';

/**
 * Stellar luminosity relative to the Sun (L☉ = 1).
 * Main-sequence mass–luminosity approximation: L ∝ M^3.5
 */
export function calcLuminosity(massSolar: number): number {
  return Math.pow(Math.max(massSolar, 0.01), 3.5);
}

/**
 * Planetary equilibrium temperature in Kelvin.
 * T = 278.5 × (L × (1 − albedo))^0.25 / √d_AU
 * This is the blackbody temperature; real Earth ~288 K due to greenhouse effect.
 */
export function calcEffectiveTemp(
  luminosity: number,
  distanceAU: number,
  albedo: number,
): number {
  if (distanceAU <= 0) return Infinity;
  return (
    278.5 *
    Math.pow(Math.max(luminosity * (1 - albedo), 0.001), 0.25) /
    Math.sqrt(distanceAU)
  );
}

/**
 * Conservative habitable zone boundaries in AU (liquid water on surface).
 * inner ≈ 0.95 × √L,  outer ≈ 1.37 × √L
 */
export function calcHabitableZone(luminosity: number): { inner: number; outer: number } {
  const sqrtL = Math.sqrt(Math.max(luminosity, 0.0001));
  return { inner: 0.95 * sqrtL, outer: 1.37 * sqrtL };
}

/**
 * Orbital period in years via Kepler's 3rd law: T² = a³ / M
 */
export function calcOrbitalPeriod(distanceAU: number, massSolar: number): number {
  return Math.sqrt(Math.pow(distanceAU, 3) / Math.max(massSolar, 0.01));
}

/** Classify climate state from equilibrium temperature */
export function getPlanetState(tempK: number): PlanetState {
  if (tempK < 230) return 'frozen';
  if (tempK > 330) return 'hot';
  return 'habitable';
}

export const STATE_EMOJI: Record<PlanetState, string> = {
  frozen:   '❄️',
  habitable:'🌍',
  hot:      '🔥',
};

export const STATE_LABEL: Record<PlanetState, string> = {
  frozen:   'Đóng băng',
  habitable:'Có thể sống được',
  hot:      'Quá nóng',
};

export const STATE_COLOR: Record<PlanetState, string> = {
  frozen:   '#7ecfff',
  habitable:'#4caf50',
  hot:      '#ff7043',
};

// ─────────────────────────────────────────────────────────────────────────────
// Spectral classification
// ─────────────────────────────────────────────────────────────────────────────

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

/** Harvard spectral class from solar mass (simplified main-sequence) */
export function getSpectralClass(massSolar: number): SpectralClass {
  if (massSolar >= 16)   return 'O';
  if (massSolar >= 2.1)  return 'B';
  if (massSolar >= 1.4)  return 'A';
  if (massSolar >= 1.04) return 'F';
  if (massSolar >= 0.8)  return 'G';
  if (massSolar >= 0.45) return 'K';
  return 'M';
}

/** Main-sequence radius approximation: R ∝ M^0.8 */
export function calcSunRadius(massSolar: number): number {
  return Math.pow(Math.max(massSolar, 0.01), 0.8);
}

/** Blackbody colour associated with spectral class */
export const SPECTRAL_COLOR: Record<SpectralClass, string> = {
  O: '#9bb0ff',
  B: '#aabfff',
  A: '#dde8ff',
  F: '#f8f7ff',
  G: '#ffe4b8',
  K: '#ffbe7a',
  M: '#ff8c5a',
};

export const SPECTRAL_LABEL: Record<SpectralClass, string> = {
  O: 'O — Xanh lam',
  B: 'B — Xanh lam trắng',
  A: 'A — Trắng',
  F: 'F — Vàng trắng',
  G: 'G — Vàng ☀️',
  K: 'K — Cam',
  M: 'M — Đỏ',
};
