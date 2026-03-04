import { useContext } from 'react';
import { SelectionContext } from './selectionContextCore';
import type { SelectionState } from './selectionContextCore';

export function useSelection(): SelectionState {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
