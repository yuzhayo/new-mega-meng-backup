/**
 * Authentication Context for React Application
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        } catch (err) {
          console.error('Failed to get current user:', err);
          // Token might be expired, clear it
          apiClient.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.login(credentials);
      const currentUser = await apiClient.getCurrentUser();
      
      setUser(currentUser);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.register(userData);
      const currentUser = await apiClient.getCurrentUser();
      
      setUser(currentUser);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginSimple = async (passwordData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await apiClient.loginSimple(passwordData);
      // For simple auth, we'll create a simple user object
      setUser({
        user_id: 'master_user',
        email: 'master@launcher.com',
        full_name: 'Master User',
        created_at: new Date(),
        is_active: true
      });
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginSimple,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};