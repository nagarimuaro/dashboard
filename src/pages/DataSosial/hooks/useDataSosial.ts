import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import socialDataService from "@/services/socialDataService";
import type { DataSosial, PaginationMeta } from "../types";
import type { SocialDataConfigResponse } from "@/types/socialData";
import { defaultJorongList } from "@/constants/socialData";

interface UseDataSosialParams {
  type: string;
  currentPage: number;
  itemsPerPage: number;
  debouncedSearch: string;
  filterStatuses: string[];
  filterJorongs: string[];
  filterYears: number[];
}

export function useDataSosial({
  type,
  currentPage,
  itemsPerPage,
  debouncedSearch,
  filterStatuses,
  filterJorongs,
  filterYears,
}: UseDataSosialParams) {
  const [data, setData] = useState<DataSosial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jorongList, setJorongList] = useState<string[]>(defaultJorongList);
  const [apiConfig, setApiConfig] = useState<any>(null);
  const [apiSummary, setApiSummary] = useState<any>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Load config from API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await socialDataService.getConfig() as SocialDataConfigResponse;
        if (response) {
          setApiConfig(response.types);
          if (response.jorongs && response.jorongs.length > 0) {
            setJorongList(response.jorongs);
          }
        }
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    loadConfig();
  }, []);

  // Load data from API
  const loadData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad || data.length === 0) {
      setLoading(true);
    } else {
      setIsSearching(true);
    }
    setError(null);
    
    try {
      const params: any = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      
      // Handle KB type differently
      if (type === "kb") {
        if (filterStatuses.length === 1) {
          const statusMap: Record<string, string> = {
            "Sudah KB": "sudah",
            "Belum KB": "belum"
          };
          params.status_kb = statusMap[filterStatuses[0]] || filterStatuses[0].toLowerCase().replace(' kb', '');
        }
      } else {
        if (filterStatuses.length === 1) params.status = filterStatuses[0];
      }
      
      if (filterJorongs.length === 1) params.jorong = filterJorongs[0];
      if (filterYears.length === 1) params.tahun = filterYears[0];

      const response = await socialDataService.getByType(type, params) as any;
      
      if (response) {
        let paginatedData = response;
        
        if (response.success && response.data && typeof response.data === 'object') {
          paginatedData = response.data;
          if (response.summary) {
            setApiSummary(response.summary);
          }
        }
        
        if (paginatedData.data && Array.isArray(paginatedData.data)) {
          setData(paginatedData.data);
          if (paginatedData.current_page) {
            setPagination({
              current_page: paginatedData.current_page,
              last_page: paginatedData.last_page,
              per_page: paginatedData.per_page,
              total: paginatedData.total,
            });
          }
        } else if (Array.isArray(paginatedData)) {
          setData(paginatedData);
        } else if (Array.isArray(response)) {
          setData(response);
        } else {
          console.warn('Unexpected response structure:', response);
          setData([]);
        }
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Gagal memuat data');
      toast.error('Gagal memuat data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [type, currentPage, itemsPerPage, debouncedSearch, filterStatuses, filterJorongs, filterYears, data.length]);

  // Load data when dependencies change
  useEffect(() => {
    loadData(data.length === 0);
  }, [loadData]);

  return {
    data,
    setData,
    loading,
    isSearching,
    error,
    jorongList,
    apiConfig,
    apiSummary,
    pagination,
    loadData,
  };
}
