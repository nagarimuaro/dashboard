// Type declarations for JavaScript service modules

declare module '../services/authService.js' {
  interface LoginCredentials {
    email: string;
    password: string;
    tenant_slug?: string;
  }

  interface AuthResponse {
    status: string;
    token?: string;
    user?: any;
    tenant?: any;
    message?: string;
  }

  export const authService: {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<AuthResponse>;
    checkAuth: () => Promise<AuthResponse>;
  };
}

declare module '../services/dashboardService.js' {
  interface DashboardResponse {
    success: boolean;
    data?: any;
    message?: string;
  }

  export const dashboardService: {
    getStats: () => Promise<DashboardResponse>;
    getDashboardStats: () => Promise<DashboardResponse>;
    getChartData: (chartType: string, params?: any) => Promise<DashboardResponse>;
    getRecentActivities: (limit?: number) => Promise<DashboardResponse>;
    getPopulationStats: () => Promise<DashboardResponse>;
    getServiceStats: (period?: string) => Promise<DashboardResponse>;
    getDemographicCharts: () => Promise<DashboardResponse>;
    getAgeDistribution: () => Promise<DashboardResponse>;
    getEducationDistribution: () => Promise<DashboardResponse>;
    getProfessionDistribution: () => Promise<DashboardResponse>;
    getServiceTrend: (months?: number) => Promise<DashboardResponse>;
    getPopulationTrend: (years?: number) => Promise<DashboardResponse>;
    getTopServices: (limit?: number) => Promise<DashboardResponse>;
    getPendingApprovals: () => Promise<DashboardResponse>;
    getFinancialOverview: (year?: number) => Promise<DashboardResponse>;
    getTerritorialStats: () => Promise<DashboardResponse>;
    getSocialProgramStats: () => Promise<DashboardResponse>;
    getNotificationCount: () => Promise<DashboardResponse>;
    getSystemHealth: () => Promise<DashboardResponse>;
    getUserActivitySummary: (period?: string) => Promise<DashboardResponse>;
    getMockStats: () => DashboardResponse;
  };
}

declare module '../services/apiClient.js' {
  interface ApiClient {
    baseURL: string;
    timeout: number;
    retryCount: number;
    defaultHeaders: Record<string, string>;
    
    getTenant(): string;
    setTenant(tenantSlug: string): void;
    setAuthToken(token: string): void;
    buildUrl(endpoint: string): string;
    
    get: (url: string, config?: any) => Promise<any>;
    post: (url: string, data?: any, config?: any) => Promise<any>;
    put: (url: string, data?: any, config?: any) => Promise<any>;
    delete: (url: string, config?: any) => Promise<any>;
    patch: (url: string, data?: any, config?: any) => Promise<any>;
  }
  
  const apiClient: ApiClient;
  export default apiClient;
}

declare module '../services/wargaService.js' {
  interface Warga {
    id: number;
    nama: string;
    nik: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;
    rt: string;
    rw: string;
    agama: string;
    status_perkawinan: string;
    pekerjaan: string;
    kewarganegaraan: string;
    golongan_darah?: string;
    pendidikan?: string;
    nama_ayah?: string;
    nama_ibu?: string;
  }

  interface WargaResponse {
    success: boolean;
    data?: Warga | Warga[];
    message?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  export const wargaService: {
    getAll: (filters?: any) => Promise<WargaResponse>;
    getById: (id: number | string) => Promise<WargaResponse>;
    create: (data: Partial<Warga>) => Promise<WargaResponse>;
    update: (id: number | string, data: Partial<Warga>) => Promise<WargaResponse>;
    delete: (id: number | string) => Promise<WargaResponse>;
    search: (query: string) => Promise<WargaResponse>;
  };
}