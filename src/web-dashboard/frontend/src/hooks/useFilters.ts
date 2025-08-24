import { useState, useCallback } from 'react';
import type { FilterState } from '../types/map';

interface UseFiltersResult {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  updateDateRange: (start: Date | null, end: Date | null) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const initialFilters: FilterState = {
  status: '',
  type: '',
  priority: null,
  dateRange: {
    start: null,
    end: null,
  },
};

export const useFilters = (): UseFiltersResult => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K, 
    value: FilterState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateDateRange = useCallback((start: Date | null, end: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const hasActiveFilters = Boolean(
    filters.status ||
    filters.type ||
    filters.priority !== null ||
    filters.dateRange.start ||
    filters.dateRange.end
  );

  return {
    filters,
    updateFilter,
    updateDateRange,
    resetFilters,
    hasActiveFilters,
  };
};
