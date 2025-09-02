/**
 * Simple Password-Only Login Form
 * No signup required - just master password access
 * CURRENTLY DISABLED - Use when you want password-only auth
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SimplePasswordForm() {
  const [password, setPassword] = useState('');
  const { loginSimple, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await loginSimple({ password });
    } catch (err) {
      console.error('Authentication failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Enter Password</h2>
          <p className="text-gray-400">Access your launcher</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg
                       placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-colors duration-200"
              placeholder="Enter master password"
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed
                     text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 text-lg"
          >
            {loading ? 'Checking...' : 'Access Launcher'}
          </button>
        </form>

        <div className="text-center text-gray-500 text-sm">
          Contact admin if you don't have the password
        </div>
      </div>
    </div>
  );
}