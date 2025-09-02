/**
 * Login Form Component
 * Simple authentication form for the launcher interface
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState('');
  
  const { login, register, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isRegisterMode) {
        await register({ email, password, full_name: fullName });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isRegisterMode ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-gray-400">
            {isRegisterMode ? 'Join the launcher platform' : 'Access your launcher'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegisterMode && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-200 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required={isRegisterMode}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white 
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed
                     text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
            >
              {isRegisterMode 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}