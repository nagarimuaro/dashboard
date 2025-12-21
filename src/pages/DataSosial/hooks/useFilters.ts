import { useState, useEffect, useMemo } from "react";

interface UseFiltersParams {
  type: string;
  setCurrentPage: (page: number) => void;
  setData: (data: any[]) => void;
}

export function useFilters({ type, setCurrentPage, setData }: UseFiltersParams) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterJorongs, setFilterJorongs] = useState<string[]>([]);
  const [filterRTs, setFilterRTs] = useState<string[]>([]);
  const [filterRWs, setFilterRWs] = useState<string[]>([]);
  const [filterYears, setFilterYears] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset filters when type changes
  useEffect(() => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterStatuses([]);
    setFilterJorongs([]);
    setFilterRTs([]);
    setFilterRWs([]);
    setFilterYears([]);
    setCurrentPage(1);
    setData([]);
  }, [type, setCurrentPage, setData]);

  // Toggle checkbox filter
  const toggleFilter = (
    value: string | number,
    currentFilters: (string | number)[],
    setFilters: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (currentFilters.includes(value)) {
      setFilters(currentFilters.filter((f) => f !== value));
    } else {
      setFilters([...currentFilters, value]);
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setDebouncedSearch("");
    setFilterStatuses([]);
    setFilterJorongs([]);
    setFilterRTs([]);
    setFilterRWs([]);
    setFilterYears([]);
    setCurrentPage(1);
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return (
      filterStatuses.length +
      filterJorongs.length +
      filterRTs.length +
      filterRWs.length +
      filterYears.length +
      (searchQuery ? 1 : 0)
    );
  }, [filterStatuses, filterJorongs, filterRTs, filterRWs, filterYears, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearch,
    filterStatuses,
    setFilterStatuses,
    filterJorongs,
    setFilterJorongs,
    filterRTs,
    setFilterRTs,
    filterRWs,
    setFilterRWs,
    filterYears,
    setFilterYears,
    isFilterOpen,
    setIsFilterOpen,
    toggleFilter,
    clearAllFilters,
    activeFilterCount,
  };
}
