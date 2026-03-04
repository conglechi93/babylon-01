import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ServiceMetadata } from '../types/services';
import { SERVICE_DEFINITIONS } from '../data/serviceDefinitions';

interface SelectionState {
  selectedServiceId: string | null;
  selectedService: ServiceMetadata | null;
  setSelectedServiceId: (id: string | null) => void;
}

const SelectionContext = createContext<SelectionState | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedServiceId, setSelectedServiceIdRaw] = useState<string | null>(null);

  const setSelectedServiceId = useCallback((id: string | null) => {
    setSelectedServiceIdRaw(id);
  }, []);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return SERVICE_DEFINITIONS.find((d) => d.metadata.id === selectedServiceId)?.metadata ?? null;
  }, [selectedServiceId]);

  const value = useMemo(
    () => ({ selectedServiceId, selectedService, setSelectedServiceId }),
    [selectedServiceId, selectedService, setSelectedServiceId],
  );

  return <SelectionContext value={value}>{children}</SelectionContext>;
}

export function useSelection(): SelectionState {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}
