import apiClient from './apiClient.js';

// ==================== INTERFACES ====================

export interface KaderTugas {
  id: number;
  tenant_id: number;
  kelompok_id: number;
  data_type: string;
  jorongs: string[] | null;
  target_data: number | null;
  periode_mulai: string | null;
  periode_selesai: string | null;
  status: 'Aktif' | 'Selesai' | 'Dibatalkan';
  catatan: string | null;
  created_at: string;
  updated_at: string;
  kelompok?: {
    id: number;
    nama: string;
    kode: string | null;
  };
}

export interface TugasProgress {
  tugas_id: number;
  data_type: string;
  data_type_label: string;
  jorongs: string[];
  target: number;
  current: number;
  percentage: number;
  remaining: number;
  status: string;
}

export interface KaderPerformance {
  id: number;
  kader_id: number;
  tahun: number;
  bulan: number;
  stats_by_type: Record<string, { created: number; updated: number; target: number }>;
  total_created: number;
  total_updated: number;
  total_target: number;
  score: number;
  rank_in_kelompok: number | null;
  catatan: string | null;
  kader?: {
    id: number;
    nama: string;
    jenis: string | null;
  };
}

export interface LeaderboardEntry {
  rank: number;
  kader_id: number;
  kader_nama: string;
  score: number;
  grade: string;
  total_created: number;
  total_updated: number;
}

export interface PerformanceStatistics {
  periode: string;
  total_kader: number;
  average_score: number;
  total_data_created: number;
  total_data_updated: number;
  grade_distribution: Record<string, number>;
}

export interface TugasConfig {
  data_types: Record<string, string>;
  status_options: string[];
}

export interface TugasStatistics {
  total: number;
  aktif: number;
  selesai: number;
  by_data_type: Record<string, number>;
  by_kelompok: Record<string, number>;
}

export interface CreateTugasData {
  kelompok_id: number;
  data_type: string;
  jorongs?: string[];
  target_data?: number;
  periode_mulai?: string;
  periode_selesai?: string;
  catatan?: string;
}

export interface UpdateTugasData {
  jorongs?: string[];
  target_data?: number;
  periode_mulai?: string;
  periode_selesai?: string;
  status?: 'Aktif' | 'Selesai' | 'Dibatalkan';
  catatan?: string;
}

export interface BulkAssignData {
  assignments: Array<{
    kelompok_id: number;
    data_type: string;
    jorongs?: string[];
    target_data?: number;
  }>;
  periode_mulai?: string;
  periode_selesai?: string;
}

// ==================== TUGAS SERVICE ====================

export const kaderTugasService = {
  // Get list of tugas
  getList: async (params?: {
    kelompok_id?: number;
    data_type?: string;
    status?: string;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/kader-tugas', params);
    return response;
  },

  // Get config
  getConfig: async (): Promise<{ success: boolean; data: TugasConfig }> => {
    const response = await apiClient.get('/kader-tugas/config');
    return response;
  },

  // Get statistics
  getStatistics: async (): Promise<{ success: boolean; data: TugasStatistics }> => {
    const response = await apiClient.get('/kader-tugas/statistics');
    return response;
  },

  // Create tugas
  create: async (data: CreateTugasData): Promise<{ success: boolean; message: string; data: KaderTugas }> => {
    const response = await apiClient.post('/kader-tugas', data);
    return response;
  },

  // Get single tugas
  getById: async (id: number): Promise<{ success: boolean; data: { tugas: KaderTugas; progress: TugasProgress } }> => {
    const response = await apiClient.get(`/kader-tugas/${id}`);
    return response;
  },

  // Update tugas
  update: async (id: number, data: UpdateTugasData): Promise<{ success: boolean; message: string; data: KaderTugas }> => {
    const response = await apiClient.put(`/kader-tugas/${id}`, data);
    return response;
  },

  // Delete tugas
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/kader-tugas/${id}`);
    return response;
  },

  // Bulk assign
  bulkAssign: async (data: BulkAssignData): Promise<{ success: boolean; message: string; data: { created: KaderTugas[]; skipped: any[] } }> => {
    const response = await apiClient.post('/kader-tugas/bulk-assign', data);
    return response;
  },

  // Get tugas for kelompok with progress
  getKelompokTugas: async (kelompokId: number): Promise<{ success: boolean; data: { kelompok: any; tugas_progress: TugasProgress[] } }> => {
    const response = await apiClient.get(`/kelompok-kaders/${kelompokId}/tugas`);
    return response;
  },
};

// ==================== PERFORMANCE SERVICE ====================

export const kaderPerformanceService = {
  // Get list of performances
  getList: async (params?: {
    tahun?: number;
    bulan?: number;
    kader_id?: number;
    min_score?: number;
    page?: number;
    per_page?: number;
  }) => {
    const response = await apiClient.get('/kader-performance', params);
    return response;
  },

  // Get global leaderboard
  getLeaderboard: async (params?: {
    tahun?: number;
    bulan?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: { periode: string; leaderboard: LeaderboardEntry[] } }> => {
    const response = await apiClient.get('/kader-performance/leaderboard', params);
    return response;
  },

  // Get kelompok leaderboard
  getKelompokLeaderboard: async (kelompokId: number, params?: {
    tahun?: number;
    bulan?: number;
  }): Promise<{ success: boolean; data: { kelompok: any; periode: string; leaderboard: LeaderboardEntry[] } }> => {
    const response = await apiClient.get(`/kader-performance/kelompok/${kelompokId}`, params);
    return response;
  },

  // Get kader performance
  getKaderPerformance: async (kaderId: number, params?: {
    tahun?: number;
  }) => {
    const response = await apiClient.get(`/kader-performance/kader/${kaderId}`, params);
    return response;
  },

  // Get my performance (for logged-in kader)
  getMyPerformance: async () => {
    const response = await apiClient.get('/kader-performance/my-performance');
    return response;
  },

  // Get statistics
  getStatistics: async (params?: {
    tahun?: number;
    bulan?: number;
  }): Promise<{ success: boolean; data: PerformanceStatistics }> => {
    const response = await apiClient.get('/kader-performance/statistics', params);
    return response;
  },

  // Recalculate performances
  recalculate: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/kader-performance/recalculate');
    return response;
  },
};

export default { kaderTugasService, kaderPerformanceService };
