import API_CONFIG from '../config/api.js';
import { ApiLogger } from '../utils/apiLogger.js';

// Custom error classes
export class ValidationError extends Error {
  constructor(errors) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class ApiClient {
  constructor() {
    this.baseURL = this.getApiBaseUrl(); // Use dynamic URL based on hostname
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryCount = API_CONFIG.RETRY_COUNT;
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      [API_CONFIG.TENANT_HEADER]: this.getTenant()
    };
  }

  // Get API base URL based on hostname - always use subdomain for tenant
  getApiBaseUrl() {
    const hostname = window.location.hostname;
    
    // If on sintanagari.cloud subdomain, use that subdomain's API
    if (hostname.includes('sintanagari.cloud')) {
      const subdomain = hostname.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'sintanagari') {
        return `https://${subdomain}.sintanagari.cloud/api`;
      }
    }
    
    // All other domains use cilandak subdomain
    return 'https://cilandak.sintanagari.cloud/api';
  }

  // Get tenant from subdomain (e.g., muaro from muaro.fynelia.store or muaro.sintanagari.cloud)
  getTenant() {
    const hostname = window.location.hostname;
    
    // Support sintanagari.cloud subdomains
    if (hostname.includes('sintanagari.cloud')) {
      const subdomain = hostname.split('.')[0];
      // Exclude www and main domain
      if (subdomain !== 'www' && subdomain !== 'sintanagari') {
        return subdomain;
      }
    }
    
    // Default tenant for all other domains (sintamuaro.com, fynelia.store, etc.)
    return 'cilandak';
  }

  // Set tenant for multi-tenant requests
  setTenant(tenantSlug) {
    if (tenantSlug) {
      this.defaultHeaders[API_CONFIG.TENANT_HEADER] = tenantSlug;
    } else {
      delete this.defaultHeaders[API_CONFIG.TENANT_HEADER];
    }
  }

  // Set authentication token
  setAuthToken(token) {
    console.log('🔑 setAuthToken called:', token ? `${token.substring(0, 20)}...` : 'null');
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Auth header set:', this.defaultHeaders['Authorization']?.substring(0, 30) + '...');
    } else {
      delete this.defaultHeaders['Authorization'];
      console.log('🔑 Auth header removed');
    }
  }

  // Get current auth token
  getAuthToken() {
    return this.defaultHeaders['Authorization'];
  }

  // Build full URL with query parameters
  buildUrl(endpoint, params = {}) {
    let url;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
      url = `${this.baseURL}/${cleanEndpoint}`;
    }
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }
    
    return url;
  }

  // Handle API responses
  async handleResponse(response, method, url, startTime) {
    const duration = Date.now() - startTime;
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Network error occurred'
      }));
      
      ApiLogger.error(method, url, new Error(error.message));
      
      // Handle specific error codes
      switch (response.status) {
        case 401:
          // Clear auth - let React Router handle redirect via ProtectedRoute
          this.clearAuth();
          // Don't force redirect here, let ProtectedRoute handle it
          throw new AuthenticationError('Session expired. Please login again.');
        
        case 403:
          throw new AuthorizationError('Access denied. You don\'t have permission for this action.');
        
        case 422:
          throw new ValidationError(error.errors || {});
        
        case 429:
          throw new NetworkError('Too many requests. Please try again later.');
        
        case 500:
          throw new NetworkError('Server error. Please try again later.');
        
        default:
          throw new Error(error.message || `HTTP ${response.status}: Request failed`);
      }
    }
    
    const data = await response.json();
    ApiLogger.log(method, url, null, data, duration);
    return data;
  }

  // Retry mechanism - reduced delay for faster fallback
  async withRetry(fn, retries = this.retryCount) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(300); // Reduced wait time for faster fallback
        return this.withRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  // Check if error should be retried
  shouldRetry(error) {
    return error instanceof NetworkError || 
           (error.name === 'TypeError' && error.message.includes('Failed to fetch'));
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear authentication
  clearAuth() {
    delete this.defaultHeaders['Authorization'];
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  // Main request method
  async request(endpoint, options = {}) {
    const startTime = Date.now();
    const url = this.buildUrl(endpoint);
    const method = options.method || 'GET';
    
    // Use custom timeout if provided, otherwise use default
    const timeout = options.timeout || this.timeout;
    
    // IMPORTANT: Always get fresh token from localStorage to handle multiple instances
    const storedToken = localStorage.getItem('auth_token');
    
    // Build headers - merge defaultHeaders, then add auth, then options.headers
    const finalHeaders = {
      ...this.defaultHeaders,
      ...options.headers  // options.headers first
    };
    
    // Always set Authorization from localStorage if available (this takes priority)
    if (storedToken) {
      finalHeaders['Authorization'] = `Bearer ${storedToken}`;
    }
    
    // Build config WITHOUT spreading options at the end (to prevent header override)
    const config = {
      method,
      headers: finalHeaders,
      credentials: 'include', // Include cookies for cross-origin requests
      body: options.body,
    };
    
    // Debug: Log auth header
    if (method === 'PUT' || method === 'POST') {
      console.log('🔐 Request Auth:', {
        url,
        method,
        hasAuth: !!config.headers['Authorization'],
        authHeader: config.headers['Authorization']?.substring(0, 30) + '...',
        storedToken: storedToken ? storedToken.substring(0, 20) + '...' : 'null',
        bodyIsFormData: config.body instanceof FormData
      });
    }
    
    // Remove Content-Type for FormData (let browser set it with boundary)
    // IMPORTANT: Check FormData FIRST before any other body processing
    if (config.body instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📤 Sending FormData, removed Content-Type header');
    } else if (config.body && typeof config.body === 'object' && !(config.body instanceof Blob)) {
      // Only stringify if it's a plain object (not FormData, Blob, etc.)
      try {
        config.body = JSON.stringify(config.body);
      } catch (error) {
        console.error('Error stringifying request body:', error);
        config.body = '{}';
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
      const response = await this.withRetry(async () => {
        return fetch(url, config);
      });
      
      clearTimeout(timeoutId);
      return await this.handleResponse(response, method, url, startTime);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout');
      }
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new NetworkError('Network connection failed. Please check your internet connection.');
      }
      
      throw error;
    }
  }

  // Convenience methods
  async get(endpoint, params = {}) {
    // Support both { params: {...} } format and direct params format
    const actualParams = params.params || params;
    
    // Build query string
    const queryString = Object.keys(actualParams)
      .filter(key => actualParams[key] !== undefined && actualParams[key] !== null)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(actualParams[key])}`)
      .join('&');
    
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(fullEndpoint);
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT', 
      body: data,
      ...options
    });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
      ...options
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Download file as blob
  async downloadBlob(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params);
    
    // Get fresh token from localStorage
    const storedToken = localStorage.getItem('auth_token');
    
    const headers = { ...this.defaultHeaders };
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    // Remove Content-Type for blob requests
    delete headers['Content-Type'];
    
    const config = {
      method: 'GET',
      headers,
      credentials: 'include'
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Download failed: ${response.status}`);
    }
    
    return response.blob();
  }

  // Download file as blob with progress tracking
  downloadBlobWithProgress(endpoint, params = {}, onProgress = null) {
    return new Promise((resolve, reject) => {
      const url = this.buildUrl(endpoint, params);
      const storedToken = localStorage.getItem('auth_token');
      
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      
      // Progress event for download
      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        } else if (onProgress) {
          // If content-length is not available, show indeterminate progress
          onProgress(-1);
        }
      });
      
      // Load event (success)
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) onProgress(100);
          resolve(xhr.response);
        } else if (xhr.status === 401) {
          reject(new Error('Session expired. Please login again.'));
        } else {
          reject(new Error(`Download failed: ${xhr.status}`));
        }
      });
      
      // Error event
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during download'));
      });
      
      // Timeout event
      xhr.addEventListener('timeout', () => {
        reject(new Error('Download timeout'));
      });
      
      xhr.open('GET', url);
      
      // Set headers
      if (storedToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${storedToken}`);
      }
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader(API_CONFIG.TENANT_HEADER, this.getTenant());
      
      xhr.send();
    });
  }

  // Public endpoints (no authentication required)
  async getPublic(endpoint, params = {}, tenantSlug = null) {
    // Temporarily store current auth header
    const currentAuth = this.defaultHeaders['Authorization'];
    const currentTenant = this.defaultHeaders[API_CONFIG.TENANT_HEADER];
    
    // Remove auth header for public requests
    delete this.defaultHeaders['Authorization'];
    
    // Set tenant if provided
    if (tenantSlug) {
      this.defaultHeaders[API_CONFIG.TENANT_HEADER] = tenantSlug;
    }
    
    try {
      const result = await this.get(endpoint, params);
      return result;
    } finally {
      // Restore previous headers
      if (currentAuth) {
        this.defaultHeaders['Authorization'] = currentAuth;
      }
      if (currentTenant) {
        this.defaultHeaders[API_CONFIG.TENANT_HEADER] = currentTenant;
      } else if (tenantSlug) {
        delete this.defaultHeaders[API_CONFIG.TENANT_HEADER];
      }
    }
  }

  async postPublic(endpoint, data = {}, tenantSlug = null) {
    // Temporarily store current auth header
    const currentAuth = this.defaultHeaders['Authorization'];
    const currentTenant = this.defaultHeaders[API_CONFIG.TENANT_HEADER];
    
    // Remove auth header for public requests
    delete this.defaultHeaders['Authorization'];
    
    // Set tenant if provided
    if (tenantSlug) {
      this.defaultHeaders[API_CONFIG.TENANT_HEADER] = tenantSlug;
    }
    
    try {
      const result = await this.post(endpoint, data);
      return result;
    } finally {
      // Restore previous headers
      if (currentAuth) {
        this.defaultHeaders['Authorization'] = currentAuth;
      }
      if (currentTenant) {
        this.defaultHeaders[API_CONFIG.TENANT_HEADER] = currentTenant;
      } else if (tenantSlug) {
        delete this.defaultHeaders[API_CONFIG.TENANT_HEADER];
      }
    }
  }

  // FormData post method for file uploads
  async postFormData(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData
    });
  }

  // File upload with progress
  async upload(endpoint, files, onProgress = null) {
    const formData = new FormData();
    
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files[]', file));
    } else {
      formData.append('file', files);
    }

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new NetworkError('Upload failed due to network error'));
      });

      xhr.open('POST', this.buildUrl(endpoint));
      
      // Set headers (except Content-Type for FormData)
      Object.keys(this.defaultHeaders).forEach(key => {
        if (key !== 'Content-Type') {
          xhr.setRequestHeader(key, this.defaultHeaders[key]);
        }
      });

      xhr.send(formData);
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;