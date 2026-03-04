import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SelectionId, SelectedEntity } from '../types/selection';
import { SERVICE_DEFINITIONS } from '../data/serviceDefinitions';
import { CELESTIAL_DEFINITIONS } from '../data/celestialDefinitions';

interface SelectionState {
  selectionId: SelectionId;
  selectedEntity: SelectedEntity;
  setSelectionId: (id: SelectionId) => void;
}

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectionId, setSelectionIdRaw] = useState<SelectionId>(null);

  const setSelectionId = useCallback((id: SelectionId) => {
    setSelectionIdRaw(id);
  }, []);

  const selectedEntity: SelectedEntity = useMemo(() => {
    if (!selectionId) return null;
    if (selectionId.kind === 'service') {
      const def = SERVICE_DEFINITIONS.find((d) => d.metadata.id === selectionId.id);
      return def ? { kind: 'service', data: def.metadata } : null;
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

export function useSelection(): SelectionState {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
