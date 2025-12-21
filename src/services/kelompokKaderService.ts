import apiClient from './apiClient.js';

export interface KelompokKaderMember {
  id: number;
  nama: string;
  jenis: string | null;
  no_hp?: string | null;
  status?: string;
  pivot?: {
    role: 'ketua' | 'wakil' | 'anggota';
    tanggal_bergabung: string | null;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface KelompokKaderPermission {
  data_type: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface KelompokKader {
  id: number;
  tenant_id: number;
  nama: string;
  kode: string | null;
  deskripsi: string | null;
  ketua_id: number | null;
  jorong: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ketua?: KelompokKaderMember | null;
  members?: KelompokKaderMember[];
  permissions?: KelompokKaderPermission[];
}

export interface KelompokKaderConfig {
  data_type_options: Record<string, string>;
  jorong_options: Record<number, string>;
  kader_options: Array<{ id: number; nama: string; jenis: string | null }>;
}

export interface KelompokKaderStatistics {
  total: number;
  aktif: number;
  nonaktif: number;
  total_members: number;
  by_jorong: Record<string, number>;
}

export interface CreateKelompokKaderData {
  nama: string;
  kode?: string;
  deskripsi?: string;
  ketua_id?: number;
  jorong?: string;
  is_active?: boolean;
  members?: number[];
  permissions?: Record<string, {
    can_view?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
  }>;
}

export interface UpdateKelompokKaderData {
  nama?: string;
  kode?: string;
  deskripsi?: string;
  ketua_id?: number;
  jorong?: string;
  is_active?: boolean;
  members?: number[];
  permissions?: Record<string, {
    can_view?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
  }>;
}

export interface KelompokKaderListParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: string;
  jorong?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const kelompokKaderService = {
  // Get list of kelompok kaders with pagination
  getAll: async (params: KelompokKaderListParams = {}) => {
    const defaultParams: KelompokKaderListParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/kelompok-kaders', defaultParams);
  },

  // Get kelompok kader config options
  getConfig: async () => {
    return apiClient.get('/kelompok-kaders/config');
  },

  // Get kelompok kader statistics
  getStatistics: async () => {
    return apiClient.get('/kelompok-kaders/statistics');
  },

  // Get single kelompok kader by ID
  getById: async (id: number) => {
    return apiClient.get(`/kelompok-kaders/${id}`);
  },

  // Create new kelompok kader
  create: async (data: CreateKelompokKaderData) => {
    return apiClient.post('/kelompok-kaders', data);
  },

  // Update kelompok kader
  update: async (id: number, data: UpdateKelompokKaderData) => {
    return apiClient.put(`/kelompok-kaders/${id}`, data);
  },

  // Delete kelompok kader
  delete: async (id: number) => {
    return apiClient.delete(`/kelompok-kaders/${id}`);
  },

  // Add member to kelompok
  addMember: async (kelompokId: number, kaderId: number, role?: string) => {
    return apiClient.post(`/kelompok-kaders/${kelompokId}/members`, { 
      kader_id: kaderId, 
      role: role || 'anggota' 
    });
  },

  // Remove member from kelompok
  removeMember: async (kelompokId: number, kaderId: number) => {
    return apiClient.delete(`/kelompok-kaders/${kelompokId}/members/${kaderId}`);
  },

  // Update kelompok permissions
  updatePermissions: async (id: number, permissions: Record<string, any>) => {
    return apiClient.put(`/kelompok-kaders/${id}/permissions`, { permissions });
  },

  // Get available kaders (not in any kelompok)
  getAvailableKaders: async () => {
    return apiClient.get('/kelompok-kaders/available-kaders');
  },
};

export default kelompokKaderService;
