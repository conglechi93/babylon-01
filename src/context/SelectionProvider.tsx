import { useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SelectionId, SelectedEntity } from '../types/selection';
import { MESH_DEFINITIONS } from '../data/meshDefinitions';
import { CELESTIAL_DEFINITIONS } from '../data/celestialDefinitions';
import { SelectionContext } from './SelectionContext';

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectionId, setSelectionIdRaw] = useState<SelectionId>(null);

  const setSelectionId = useCallback((id: SelectionId) => {
    setSelectionIdRaw(id);
  }, []);

  const selectedEntity: SelectedEntity = useMemo(() => {
    if (!selectionId) return null;
    if (selectionId.kind === 'mesh') {
      const def = MESH_DEFINITIONS.find((d) => d.id === selectionId.id);
      return def ? { kind: 'mesh', data: def } : null;
    }
    const def = CELESTIAL_DEFINITIONS.find((d) => d.metadata.id === selectionId.id);
    return def ? { kind: 'celestial', data: def.metadata } : null;
  }, [selectionId]);

  const value = useMemo(
    () => ({ selectionId, selectedEntity, setSelectionId }),
    [selectionId, selectedEntity, setSelectionId],
  );

  return <SelectionContext value={value}>{children}</SelectionContext>;
}
