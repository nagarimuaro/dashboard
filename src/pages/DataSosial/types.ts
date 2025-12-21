import { typeConfig } from "@/constants/socialData";
import type { DataSosialGeneric as DataSosial, PaginationMeta } from "@/types/socialData";

export interface DataSosialPageProps {
  type: keyof typeof typeConfig;
  embedded?: boolean;
  onViewDetail?: (type: string, itemId: number) => void;
}

export interface FilterState {
  searchQuery: string;
  debouncedSearch: string;
  filterStatuses: string[];
  filterJorongs: string[];
  filterRTs: string[];
  filterRWs: string[];
  filterYears: number[];
}

export interface KbFormData {
  warga_id: number;
  jenis_kb: string;
  tanggal_mulai_kb: string;
  jumlah_anak: number;
  posyandu: string;
  keterangan: string;
}

export interface AnalyzeFormData {
  berat_kg: string;
  tinggi_cm: string;
  lingkar_kepala_cm: string;
  posyandu: string;
  tanggal_pengukuran: string;
}

export interface StatisticsData {
  statusDistribution: { name: string; value: number; color: string }[];
  jorongDistribution: { name: string; value: number }[];
  yearTrend: { tahun: number; jumlah: number }[];
  statusByJorong: Record<string, any>[];
  total: number;
  criticalCount: number;
  criticalPercentage: string;
  criticalStatus: string;
  warningCount?: number;
  warningStatus?: string | null;
  statusOptions: string[];
  isBalitaType?: boolean;
  sudahKbCount?: number;
}

export type { DataSosial, PaginationMeta };
