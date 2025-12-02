import { createContext, useContext, useMemo, useState } from "react";

const FiltersCtx = createContext();

export const DEFAULT_FILTERS = {
  // Technology
  softwareType: null,
  expectedInput: null,
  generatedOutput: null,
  modelType: null,
  foundationalModel: null,
  inferenceLocation: null,
  hasApi: null,
  toolLaunchYear: null,
  toolName: null,
  tasks: null,

  // Business
  parentOrg: null,
  orgMaturity: null,
  fundingType: null,
  businessModel: null,
  ipCreationPotential: null,
  yearCompanyFounded: null,
  legalCasePending: null
};

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const activeCount = useMemo(() => {
    return Object.values(filters).filter(v => {
      if (v == null) return false;
      if (Array.isArray(v)) return v.length > 0;
      return true;
    }).length;
  }, [filters]);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <FiltersCtx.Provider value={{ filters, setFilters, clearFilters, activeCount }}>
      {children}
    </FiltersCtx.Provider>
  );
}

export const useFilters = () => useContext(FiltersCtx);
