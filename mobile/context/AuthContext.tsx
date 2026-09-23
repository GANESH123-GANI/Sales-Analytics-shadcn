import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/config';
import { appStorage } from '../utils/storage';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'sales_analytics_auth_token';
const USER_KEY = 'sales_analytics_auth_user';

// Built-in Enterprise Demo Users (Allows instant login even if backend connection is offline)
const DEMO_USERS: Record<string, { pass: string; user: User }> = {
  'admin@enterprise.com': {
    pass: 'admin123',
    user: { id: 1, name: 'Ganesh Paidi', email: 'admin@enterprise.com', role: 'Admin' },
  },
  'manager@enterprise.com': {
    pass: 'manager123',
    user: { id: 2, name: 'Aditya Rao', email: 'manager@enterprise.com', role: 'Sales Manager' },
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rehydrate auth state on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await appStorage.getItem(TOKEN_KEY);
        const storedUserJson = await appStorage.getItem(USER_KEY);

        if (storedToken && storedUserJson) {
          const parsedUser = JSON.parse(storedUserJson);
          setToken(storedToken);
          setUser(parsedUser);
        }
      } catch (err) {
        console.warn('[Auth] Failed to restore session from storage', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      // 1. Attempt REST API login to backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (response.ok && data.success) {
        const authToken = data.token;
        const authUser = data.user;

        setToken(authToken);
        setUser(authUser);

        await appStorage.setItem(TOKEN_KEY, authToken);
        await appStorage.setItem(USER_KEY, JSON.stringify(authUser));

        return { success: true };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.warn('[Auth] Network request failed, checking demo credentials fallback:', err.message);

      // 2. Demo Fallback: If backend is offline or static SPA, authenticate valid demo accounts
      const demoAccount = DEMO_USERS[cleanEmail];
      if (demoAccount && demoAccount.pass === cleanPassword) {
        const mockToken = `demo_token_${Date.now()}`;
        setToken(mockToken);
        setUser(demoAccount.user);

        await appStorage.setItem(TOKEN_KEY, mockToken);
        await appStorage.setItem(USER_KEY, JSON.stringify(demoAccount.user));

        return { success: true };
      }

      return {
        success: false,
        message: 'Unable to connect to server. Please check your credentials.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setToken(null);
    await appStorage.removeItem(TOKEN_KEY);
    await appStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
