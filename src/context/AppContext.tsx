import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/authService.js';
import { dashboardService } from '../services/dashboardService.js';
import apiClient from '../services/apiClient.js';

interface User {
  id: number;
  nama: string;
  email: string;
  role: 'admin_global' | 'admin_nagari' | 'staff_nagari' | 'warga';
  nagari: string;
  foto?: string;
  permissions?: string[]; // User permissions list
  permissions_list?: string[]; // Alternative key from API
}

interface Tenant {
  id: number;
  nama: string;
  slug: string;
  logo?: string;
}

interface DashboardStats {
  totalWarga: number;
  totalKeluarga: number;
  totalSurat: number;
  totalPengaduan: number;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  tenant: Tenant | null;
  dashboardStats: DashboardStats | null;
  notifications: Notification[];
  loading: boolean;
  initialized: boolean;
  unreadCount: number;

  // Auth methods
  login: (credentials: { email: string; password: string; tenant_slug?: string }) => Promise<any>;
  logout: () => Promise<void>;
  
  // Data methods
  refreshDashboard: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => Promise<void>;
  
  // Permission helper
  hasPermission: (permissionKey: string) => boolean;
  getUserPermissions: () => string[];
  
  // State setters
  setUser: (user: User | null) => void;
  setTenant: (tenant: Tenant | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    // Return a safe default context instead of throwing
    // This handles edge cases during hot reload or initial render
    console.warn('useApp called outside of AppProvider - returning safe defaults');
    return {
      user: null,
      tenant: null,
      dashboardStats: null,
      notifications: [],
      loading: true,
      initialized: false,
      unreadCount: 0,
      login: async () => { throw new Error('AppProvider not initialized'); },
      logout: async () => { throw new Error('AppProvider not initialized'); },
      refreshDashboard: async () => {},
      refreshNotifications: async () => {},
      markNotificationAsRead: async () => {},
      hasPermission: () => false,
      getUserPermissions: () => [],
      setUser: () => {},
      setTenant: () => {},
    };
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize app on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        
        // Initialize auth from storage - USE CORRECT KEYS
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        const tenantData = localStorage.getItem('current_tenant');

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            const parsedTenant = tenantData ? JSON.parse(tenantData) : null;
            
            setUser(parsedUser);
            setTenant(parsedTenant);
            
            // Set auth token for API requests
            apiClient.setAuthToken(token);
            
          } catch (parseError) {
            console.warn('Error parsing stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('current_tenant');
          }
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Auth methods
  const login = useCallback(async (credentials: { email: string; password: string; tenant_slug?: string }) => {
    try {
      setLoading(true);
      
      const response = await authService.login(credentials);
      
      // Handle response - authService returns {token, user, tenant} directly
      if (response && response.token && response.user) {
        const userData = response.user;
        const token = response.token;
        const tenantData = response.tenant || null;
        
        // Store in state
        setUser(userData);
        setTenant(tenantData);
        
        // Store in localStorage - USE CORRECT KEYS
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (tenantData) {
          localStorage.setItem('current_tenant', JSON.stringify(tenantData));
        }
        
        // Set auth header
        apiClient.setAuthToken(token);
        
        // Notify AuthContext that login happened
        window.dispatchEvent(new Event('auth-changed'));
        
        return { success: true, data: response };
      } else {
        throw new Error('Login failed - invalid response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API if needed
      await authService.logout();
    } catch (error) {
      console.warn('Logout API error (continuing with local logout):', error);
    } finally {
      // Clear state
      setUser(null);
      setTenant(null);
      setDashboardStats(null);
      setNotifications([]);
      
      // Clear storage - USE CORRECT KEYS
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('current_tenant');
      
      // Clear auth header
      apiClient.setAuthToken('');
      
      // Notify AuthContext that logout happened
      window.dispatchEvent(new Event('auth-changed'));
    }
  }, []);

  // Data methods
  const refreshDashboard = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await dashboardService.getStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      // Use getRecentActivities as notifications for now
      const response = await dashboardService.getRecentActivities(10);
      if (response.success) {
        // Transform activities to notification format
        const mockNotifications = (response.data || []).map((activity: any, index: number) => ({
          id: index + 1,
          title: activity.title || 'Notification',
          message: activity.description || activity.message || 'New activity',
          type: activity.type || 'info' as 'info' | 'warning' | 'error' | 'success',
          read: false,
          created_at: activity.created_at || new Date().toISOString()
        }));
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      // Set mock notifications as fallback
      setNotifications([
        {
          id: 1,
          title: 'Sistem Update',
          message: 'Sistem telah diperbarui ke versi terbaru',
          type: 'info',
          read: false,
          created_at: new Date().toISOString()
        }
      ]);
    }
  }, [user]);

  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      // For now, just update local state since we don't have backend endpoint
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Permission helper functions
  const getUserPermissions = useCallback((): string[] => {
    if (!user) return [];
    return user.permissions_list || user.permissions || [];
  }, [user]);

  const hasPermission = useCallback((permissionKey: string): boolean => {
    if (!user) return false;
    
    // Admin global has all permissions
    if (user.role === 'admin_global') return true;
    
    const permissions = getUserPermissions();
    
    // If no permissions set, fall back to role-based defaults
    if (permissions.length === 0) {
      const roleDefaults: Record<string, string[]> = {
        'admin_nagari': ['dashboard', 'data_warga', 'data_keluarga', 'surat', 'kelola_permohonan', 'template', 'cms', 'keuangan', 'gis', 'data_sosial', 'kader', 'pengaduan', 'arsip', 'user_management', 'settings'],
        'staff_nagari': ['dashboard', 'data_warga', 'data_keluarga', 'surat', 'kelola_permohonan'],
        'warga': ['dashboard', 'surat', 'pengaduan']
      };
      return roleDefaults[user.role]?.includes(permissionKey) || false;
    }
    
    return permissions.includes(permissionKey);
  }, [user, getUserPermissions]);

  // Load dashboard data when user is authenticated
  useEffect(() => {
    if (user && initialized) {
      refreshDashboard();
      refreshNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialized]); // Only re-run when user or initialized changes

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: AppContextType = {
    user,
    tenant,
    dashboardStats,
    notifications,
    loading,
    initialized,
    unreadCount,
    login,
    logout,
    refreshDashboard,
    refreshNotifications,
    markNotificationAsRead,
    hasPermission,
    getUserPermissions,
    setUser,
    setTenant,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};