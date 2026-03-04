import type { MeshMetadata } from './mesh';
import type { CelestialMetadata } from './celestial';

export type SelectionId =
  | { kind: 'mesh'; id: string }
  | { kind: 'celestial'; id: string }
  | null;

export type SelectedEntity =
  | { kind: 'mesh'; data: MeshMetadata }
  | { kind: 'celestial'; data: CelestialMetadata }
  | null;
