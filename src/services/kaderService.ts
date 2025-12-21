import apiClient from './apiClient.js';

export interface KaderPermission {
  data_type: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export interface Kader {
  id: number;
  user_id: number;
  nama: string;
  jenis: string | null;
  wilayah: string | null;
  no_hp: string | null;
  alamat: string | null;
  status: 'Aktif' | 'Tidak Aktif';
  tanggal_mulai: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  permissions?: KaderPermission[];
  permissions_config?: Record<string, KaderPermission>;
}

export interface KaderConfig {
  jenis_options: string[];
  status_options: Record<string, string>;
  data_type_options: Record<string, string>;
  jorong_options: Record<number, string>;
}

export interface KaderStatistics {
  total: number;
  aktif: number;
  nonaktif: number;
  by_jenis: Record<string, number>;
}

export interface CreateKaderData {
  nama: string;
  email: string;
  password: string;
  jenis?: string;
  wilayah?: string;
  no_hp?: string;
  alamat?: string;
  status?: 'Aktif' | 'Tidak Aktif';
  tanggal_mulai?: string;
  permissions?: Record<string, {
    can_view?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
  }>;
}

export interface UpdateKaderData {
  nama?: string;
  email?: string;
  password?: string;
  jenis?: string;
  wilayah?: string;
  no_hp?: string;
  alamat?: string;
  status?: 'Aktif' | 'Tidak Aktif';
  tanggal_mulai?: string;
  permissions?: Record<string, {
    can_view?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
  }>;
}

export interface KaderListParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  jenis?: string;
  wilayah?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const kaderService = {
  // Get list of kaders with pagination
  getAll: async (params: KaderListParams = {}) => {
    const defaultParams: KaderListParams = {
      page: 1,
      per_page: 15,
      ...params
    };
    return apiClient.get('/kaders', defaultParams);
  },

  // Get kader config options
  getConfig: async () => {
    return apiClient.get('/kaders/config');
  },

  // Get kader statistics
  getStatistics: async () => {
    return apiClient.get('/kaders/statistics');
  },

  // Get single kader by ID
  getById: async (id: number) => {
    return apiClient.get(`/kaders/${id}`);
  },

  // Create new kader
  create: async (data: CreateKaderData) => {
    return apiClient.post('/kaders', data);
  },

  // Update kader
  update: async (id: number, data: UpdateKaderData) => {
    return apiClient.put(`/kaders/${id}`, data);
  },

  // Delete kader
  delete: async (id: number) => {
    return apiClient.delete(`/kaders/${id}`);
  },

  // Get kader permissions
  getPermissions: async (id: number) => {
    return apiClient.get(`/kaders/${id}/permissions`);
  },

  // Update kader permissions
  updatePermissions: async (id: number, permissions: Record<string, any>) => {
    return apiClient.put(`/kaders/${id}/permissions`, { permissions });
  },

  // Get current user's kader permissions
  getMyPermissions: async () => {
    return apiClient.get('/kaders/my-permissions');
  },

  // Get field restrictions for kader
  getFieldRestrictions: async (dataType?: string) => {
    const url = dataType 
      ? `/kaders/field-restrictions/${dataType}`
      : '/kaders/field-restrictions';
    return apiClient.get(url);
  },

  // Change kader password
  changePassword: async (id: number, password: string) => {
    return apiClient.put(`/kaders/${id}`, { password });
  },
};

export default kaderService;
