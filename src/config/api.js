// API Configuration for Nagari Terpadu
const isProduction = import.meta.env?.MODE === 'production' || 
                    import.meta.env?.PROD === true ||
                    window.location.hostname !== 'localhost';

// Get tenant-specific API URL
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If already on subdomain of sintanagari.cloud, use that subdomain's API
  if (hostname.includes('sintanagari.cloud')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'sintanagari') {
      return `https://${subdomain}.sintanagari.cloud/api`;
    }
  }
  
  // For fynelia.store or other domains, use cilandak subdomain API
  return 'https://cilandak.sintanagari.cloud/api';
};

const API_CONFIG = {
  BASE_URL: import.meta.env?.VITE_API_BASE_URL || getApiBaseUrl(),
  TENANT_HEADER: 'X-Tenant-Domain',
  TIMEOUT: 30000, // 30 seconds default
  LONG_TIMEOUT: 120000, // 2 minutes for heavy operations (PDF generation, WhatsApp)
  RETRY_COUNT: 1, // Reduced retries to prevent long waits
  UPLOAD_MAX_SIZE: parseInt(import.meta.env?.VITE_MAX_UPLOAD_SIZE) || 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: import.meta.env?.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/login',
      LOGOUT: '/logout',
      REFRESH: '/auth/refresh',
      ME: '/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      CHANGE_PASSWORD: '/auth/change-password'
    },

    // Dashboard
    DASHBOARD: {
      STATS: '/dashboard/stats',
      RECENT_ACTIVITIES: '/dashboard/recent-activities'
    },

    // Warga (Citizens)
    WARGA: {
      LIST: '/wargas',
      CREATE: '/wargas',
      UPDATE: '/wargas/{id}',
      DELETE: '/wargas/{id}',
      SHOW: '/wargas/{id}',
      SEARCH: '/wargas/search',
      IMPORT: '/wargas/import',
      EXPORT: '/wargas/export'
    },

    // Keluarga (Families)
    KELUARGA: {
      LIST: '/keluargas',
      CREATE: '/keluargas',
      UPDATE: '/keluargas/{id}',
      DELETE: '/keluargas/{id}',
      SHOW: '/keluargas/{id}',
      MEMBERS: '/keluargas/{id}/members',
      SEARCH: '/keluargas/search'
    },

    // Pelayanan (Services)
    PELAYANAN: {
      LIST: '/pelayanan',
      CREATE: '/pelayanan',
      UPDATE: '/pelayanan/{id}',
      DELETE: '/pelayanan/{id}',
      SHOW: '/pelayanan/{id}',
      APPROVE: '/pelayanan/{id}/approve',
      REJECT: '/pelayanan/{id}/reject',
      SUBMIT: '/pelayanan/submit',
      TRACK: '/pelayanan/track',
      PUBLIC_SERVICES: '/public/services',
      TEMPLATES: '/pelayanan/templates',
      CATEGORIES: '/pelayanan/categories'
    },

    // Templates
    TEMPLATES: {
      LIST: '/templates',
      CREATE: '/templates',
      UPDATE: '/templates/{id}',
      DELETE: '/templates/{id}',
      SHOW: '/templates/{id}',
      PREVIEW: '/templates/{id}/preview'
    },

    // Users
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      UPDATE: '/users/{id}',
      DELETE: '/users/{id}',
      SHOW: '/users/{id}',
      CHANGE_PASSWORD: '/users/{id}/change-password'
    },

    // Settings
    SETTINGS: {
      GENERAL: '/settings/general',
      NAGARI: '/settings/nagari',
      LETTERHEAD: '/settings/letterhead',
      BACKUP: '/settings/backup',
      RESTORE: '/settings/restore'
    },

    // Files
    FILES: {
      UPLOAD: '/files/upload',
      DOWNLOAD: '/files/{id}/download',
      DELETE: '/files/{id}'
    },

    // Admin Dashboard
    ADMIN: {
      DASHBOARD: '/admin/dashboard',
      STATISTICS: '/admin/statistics',
      RECENT_ACTIVITIES: '/admin/recent-activities',
      SYSTEM_STATUS: '/admin/system-status'
    },

    // CMS Endpoints (Based on Laravel routes)
    CMS: {
      // Public CMS endpoints (no auth required)
      PUBLIC: {
        SITE_SETTINGS: '/cms/public/site-settings',
        PAGES: '/cms/public/pages',
        NEWS: '/cms/public/news',
        SERVICES: '/cms/public/services',
        CATEGORIES: '/cms/public/categories'
      },
      // Admin CMS endpoints (auth required)
      ADMIN: {
        SITE_SETTINGS: '/cms/admin/tenant/{tenantId}/site-settings',
        CATEGORIES: '/cms/admin/tenant/{tenantId}/categories',
        NEWS: '/cms/admin/tenant/{tenantId}/news',
        PAGES: '/cms/admin/tenant/{tenantId}/pages',
        SERVICES: '/cms/admin/tenant/{tenantId}/services'
      }
    }
  }
};

export default API_CONFIG;