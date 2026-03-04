import type { ServiceMetadata } from './services';
import type { CelestialMetadata } from './celestial';

export type SelectionId =
  | { kind: 'service'; id: string }
  | { kind: 'celestial'; id: string }
  | null;

export type SelectedEntity =
  | { kind: 'service'; data: ServiceMetadata }
  | { kind: 'celestial'; data: CelestialMetadata }
  | null;
