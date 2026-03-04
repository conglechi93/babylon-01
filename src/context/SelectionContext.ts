import { createContext } from 'react';
import type { SelectionId, SelectedEntity } from '../types/selection';

export interface SelectionState {
  selectionId: SelectionId;
  selectedEntity: SelectedEntity;
  setSelectionId: (id: SelectionId) => void;
}

export const SelectionContext = createContext<SelectionState | null>(null);
