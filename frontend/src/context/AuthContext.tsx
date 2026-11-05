import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/api';
import { VALID_DEMO_ACCOUNTS } from '../data/demoData';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Validates whether a stored user object matches a registered demonstration account.
 * Prevents arbitrary localStorage values from being treated as authenticated users.
 */
function isValidDemoUser(u: unknown): u is User {
  if (!u || typeof u !== 'object') return false;
  const candidate = u as Partial<User>;
  if (!candidate.email || !candidate.role) return false;
  const registered = VALID_DEMO_ACCOUNTS[candidate.email.toLowerCase()];
  return registered !== undefined && registered.role === candidate.role;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        // If this is a demo token, strictly validate against registered demo accounts
        if (savedToken.startsWith('mock-jwt-token-')) {
          if (isValidDemoUser(parsed)) {
            return parsed;
          }
          // Reject invalid or forged demo accounts
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return null;
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Validate or refresh session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        // 1. Demo Mode Session Persistence
        if (storedToken.startsWith('mock-jwt-token-')) {
          try {
            const parsed = storedUser ? JSON.parse(storedUser) : null;
            if (isValidDemoUser(parsed)) {
              // Valid demo account — retain session without hitting live auth endpoint
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch {
            // Malformed JSON — drop down to cleanup
          }
          // Forged or invalid demo session — clear
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
          setLoading(false);
          return;
        }

        // 2. Production JWT Token Verification with live backend
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            throw new Error('Authentication response invalid');
          }
        } catch (err: unknown) {
          console.error('Failed to authenticate stored token with backend:', err);
          // If server explicitly returned 401/403 or token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateCurrentUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    return user.role === roles;
  }, [user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout,
    updateCurrentUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
