import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session from httpOnly cookie via /api/auth/me
  useEffect(() => {
    apiRequest('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await apiRequest('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
