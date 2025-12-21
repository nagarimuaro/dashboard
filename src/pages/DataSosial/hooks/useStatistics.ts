import { useMemo } from "react";
import { STATUS_COLORS, tahunList } from "@/constants/socialData";
import type { DataSosial, PaginationMeta, StatisticsData } from "../types";
import { balitaStatusOptions, balitaStatusColors } from "../constants";

interface UseStatisticsParams {
  filteredData: DataSosial[];
  configStatusOptions: string[];
  jorongList: string[];
  pagination: PaginationMeta;
  type: string;
  apiSummary: any;
}

export function useStatistics({
  filteredData,
  configStatusOptions,
  jorongList,
  pagination,
  type,
  apiSummary,
}: UseStatisticsParams): StatisticsData {
  return useMemo(() => {
    const isBalitaType = type === 'stunting';
    const isKbType = type === 'kb';
    
    const statusOptions = isBalitaType ? balitaStatusOptions : configStatusOptions;
    
    // Use API summary for KB if available
    if (isKbType && apiSummary) {
      const sudahKb = apiSummary.sudah_kb || 0;
      const belumKb = apiSummary.belum_kb || 0;
      const total = apiSummary.total_wus || (sudahKb + belumKb);
      
      const statusDistribution = [
        { name: 'Sudah KB', value: sudahKb, color: '#22c55e' },
        { name: 'Belum KB', value: belumKb, color: '#ef4444' },
      ];
      
      const jorongDistribution = apiSummary.by_jorong ? 
        Object.entries(apiSummary.by_jorong).map(([name, value]) => ({ name, value: value as number })) :
        jorongList.map(j => ({ name: j, value: 0 }));
      
      const statusByJorong = jorongList.map(jorong => {
        const jorongData: Record<string, any> = { jorong };
        jorongData['Sudah KB'] = apiSummary.by_jorong_kb?.[jorong] || 0;
        jorongData['Belum KB'] = (apiSummary.by_jorong?.[jorong] || 0) - (apiSummary.by_jorong_kb?.[jorong] || 0);
        return jorongData;
      });
      
      return {
        statusDistribution,
        jorongDistribution,
        yearTrend: [],
        statusByJorong,
        total,
        criticalCount: belumKb,
        criticalPercentage: total > 0 ? ((belumKb / total) * 100).toFixed(1) : "0",
        criticalStatus: 'Belum KB',
        warningCount: 0,
        warningStatus: null,
        statusOptions: ['Sudah KB', 'Belum KB'],
        isBalitaType: false,
        sudahKbCount: sudahKb,
      };
    }
    
    // Status distribution
    const statusCounts: Record<string, number> = {};
    statusOptions.forEach(s => { statusCounts[s] = 0; });
    
    filteredData.forEach(item => {
      const itemStatus = isBalitaType ? (item.status_stunting || 'Belum Diukur') : item.status;
      if (statusCounts[itemStatus as string] !== undefined) {
        statusCounts[itemStatus as string]++;
      } else if (isBalitaType) {
        statusCounts['Belum Diukur']++;
      }
    });
    
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: isBalitaType ? (balitaStatusColors[name] || "#6b7280") : (STATUS_COLORS[name] || "#6b7280")
    }));

    // Jorong distribution
    const jorongCounts: Record<string, number> = {};
    jorongList.forEach(j => { jorongCounts[j] = 0; });
    filteredData.forEach(item => {
      const itemJorong = item.jorong as string;
      if (itemJorong && jorongCounts[itemJorong] !== undefined) {
        jorongCounts[itemJorong]++;
      }
    });
    const jorongDistribution = Object.entries(jorongCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Year trend
    const yearTrend = isBalitaType ? [] : (() => {
      const yearCounts: Record<number, number> = {};
      tahunList.forEach(t => { yearCounts[t] = 0; });
      filteredData.forEach(item => {
        if (yearCounts[item.tahun_data] !== undefined) {
          yearCounts[item.tahun_data]++;
        }
      });
      return Object.entries(yearCounts)
        .map(([year, count]) => ({ tahun: parseInt(year), jumlah: count }))
        .sort((a, b) => a.tahun - b.tahun);
    })();

    // Status by jorong
    const statusByJorong = jorongList.map(jorong => {
      const jorongData: Record<string, any> = { jorong };
      statusOptions.forEach(status => {
        jorongData[status] = filteredData.filter(d => {
          const itemStatus = isBalitaType ? (d.status_stunting || 'Belum Diukur') : d.status;
          return d.jorong === jorong && itemStatus === status;
        }).length;
      });
      return jorongData;
    });

    const total = pagination.total || filteredData.length;
    const criticalStatus = isBalitaType ? 'Stunting Berat' : configStatusOptions[0];
    const criticalCount = statusCounts[criticalStatus] || 0;
    const criticalPercentage = total > 0 ? ((criticalCount / total) * 100).toFixed(1) : "0";
    const warningStatus = isBalitaType ? 'Stunting Ringan' : null;
    const warningCount = warningStatus ? (statusCounts[warningStatus] || 0) : 0;

    return {
      statusDistribution,
      jorongDistribution,
      yearTrend,
      statusByJorong,
      total,
      criticalCount,
      criticalPercentage,
      criticalStatus,
      warningCount,
      warningStatus,
      statusOptions,
      isBalitaType
    };
  }, [filteredData, configStatusOptions, jorongList, pagination.total, type, apiSummary]);
}
