import apiClient from './apiClient.js';
import API_CONFIG from '../config/api.js';

export const authService = {
  // Login with tenant resolution
  login: async (credentials) => {
    try {
      // Set tenant header before login (Laravel middleware expects X-Tenant-Domain)
      if (credentials.tenant_slug) {
        apiClient.setTenant(credentials.tenant_slug);
      }
      
      // Prepare login data (Laravel expects email and password in request body)
      const loginData = {
        email: credentials.email,
        password: credentials.password
      };
      
      console.log('Attempting login with:', { 
        email: loginData.email, 
        tenant_slug: credentials.tenant_slug 
      });
      
      // Add timeout protection for login
      const loginPromise = apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, loginData);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login request timeout')), 10000)
      );
      
      const response = await Promise.race([loginPromise, timeoutPromise]);
      
      console.log('Login response received:', response);
      
      // Handle Laravel API response structure
      let token, user, tenant;
      
      if (response && response.data && response.data.token) {
        // Nested structure: {success: true, data: {token, user, tenant}}
        token = response.data.token;
        user = response.data.user;
        tenant = response.data.tenant;
      } else if (response && response.token) {
        // Flat structure: {status: 'success', token, user}
        token = response.token;
        user = response.user;
        tenant = response.tenant;
      }
      
      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        apiClient.setAuthToken(token);
        
        // Set tenant if provided
        if (tenant) {
          localStorage.setItem('current_tenant', JSON.stringify(tenant));
          apiClient.setTenant(tenant.slug || credentials.tenant_slug);
        }
        
        console.log('Login successful for user:', user.name || user.nama);
        return { token, user, tenant };
      } else {
        throw new Error(response?.message || 'Login failed - invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle Laravel validation errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Laravel validation errors
          const messages = Object.values(errorData.errors).flat();
          throw new Error(messages.join(', '));
        }
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      
      // Provide more specific error message
      if (error.message && error.message.includes('JSON')) {
        throw new Error('Login failed: Invalid server response');
      }
      
      throw error;
    }
  },

  // Logout and revoke token
  logout: async () => {
    try {
      // Make sure we have auth token before logout request
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setAuthToken(token);
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage regardless
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('current_tenant');
      apiClient.clearAuth();
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      // Make sure we have auth token
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setAuthToken(token);
      }
      
      // Add timeout protection for getCurrentUser
      const userPromise = apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Get user request timeout')), 5000)
      );
      
      const response = await Promise.race([userPromise, timeoutPromise]);
      return response;
    } catch (error) {
      console.error('Get current user error:', error.message);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get stored user data
  getStoredUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Get stored tenant
  getStoredTenant: () => {
    const tenantData = localStorage.getItem('current_tenant');
    return tenantData ? JSON.parse(tenantData) : null;
  },

  // Initialize auth from storage
  initializeAuth: () => {
    const token = localStorage.getItem('auth_token');
    const tenant = authService.getStoredTenant();
    
    if (token) {
      apiClient.setAuthToken(token);
    }
    
    if (tenant) {
      apiClient.setTenant(tenant.slug);
    }
    
    return { token, tenant };
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword
    });
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  // Reset password
  resetPassword: async (token, email, password) => {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      email,
      password,
      password_confirmation: password
    });
  }
};