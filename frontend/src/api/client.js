/**
 * API Client for Launcher Backend
 * Handles authentication and API calls to the FastAPI backend
 */

// Use environment variable for API base URL, fallback for development
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.baseURL = API_BASE_URL;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  // Simple password-only login (no signup required)
  async loginSimple(passwordData) {
    const response = await this.request('/api/auth/simple-login', {
      method: 'POST',
      body: JSON.stringify({ password: passwordData.password }),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
    }
    
    return response;
  }

  logout() {
    this.setToken(null);
  }

  async getCurrentUser() {
    return await this.request('/api/auth/me');
  }

  // Launcher methods
  async getLauncherInfo() {
    return await this.request('/api/launcher-info');
  }

  async getLauncherApps() {
    return await this.request('/api/launcher-apps');
  }

  async createLauncherApp(appData) {
    return await this.request('/api/launcher-apps', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
  }

  async updateLauncherApp(appId, appData) {
    return await this.request(`/api/launcher-apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(appData),
    });
  }

  async deleteLauncherApp(appId) {
    return await this.request(`/api/launcher-apps/${appId}`, {
      method: 'DELETE',
    });
  }

  async updateUserPreferences(preferences) {
    return await this.request('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/api/health');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create and export a single instance
const apiClient = new ApiClient();
export default apiClient;