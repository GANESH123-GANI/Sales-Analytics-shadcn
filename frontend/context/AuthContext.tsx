import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../constants/config';
import { appStorage } from '../utils/storage';
import { AccountSuspendedModal } from '../components/AccountSuspendedModal';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | string;
  status?: string;
  totalSales?: number;
  totalRevenue?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; isSuspended?: boolean; suspendedReason?: string; message?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  showSuspendedNotice: (reason?: string, email?: string) => void;
}

export const TOKEN_KEY = 'sales_analytics_auth_token';
export const USER_KEY = 'sales_analytics_auth_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  login: async () => ({ success: false }),
  adminLogin: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
  showSuspendedNotice: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [suspendedNotice, setSuspendedNotice] = useState<{ visible: boolean; reason: string; email?: string }>({
    visible: false,
    reason: '',
  });

  // Restore authenticated session from persistent storage
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

  // Listen for account suspension / deletion events triggered by API interceptor
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleSuspendedEvent = (e: any) => {
        const reason = e.detail?.reason || 'Your account has been deactivated or removed by an administrator.';
        const userEmail = user?.email;
        appStorage.removeItem(TOKEN_KEY);
        appStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setSuspendedNotice({
          visible: true,
          reason,
          email: userEmail,
        });
      };
      window.addEventListener('account-suspended', handleSuspendedEvent);
      return () => window.removeEventListener('account-suspended', handleSuspendedEvent);
    }
  }, [user]);

  // Fetch updated profile
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      // Check if user was deactivated or removed by admin
      if (
        response.status === 403 ||
        data.accountStatus === 'inactive' ||
        data.accountStatus === 'deleted'
      ) {
        const reason =
          data.message ||
          'Your account has been deactivated or removed by the system administrator. Please contact your administrator.';
        const userEmail = user?.email;
        await appStorage.removeItem(TOKEN_KEY);
        await appStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setSuspendedNotice({
          visible: true,
          reason,
          email: userEmail,
        });
        return;
      }

      if (response.ok && data.success && data.data) {
        setUser(data.data);
        await appStorage.setItem(USER_KEY, JSON.stringify(data.data));
      }
    } catch (e) {
      // Ignore background refresh errors
    }
  }, [token, user]);

  /**
   * Real database authentication against backend /api/auth/login
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; isSuspended?: boolean; suspendedReason?: string; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        const authToken = data.token;
        const authUser = data.user;

        setToken(authToken);
        setUser(authUser);

        await appStorage.setItem(TOKEN_KEY, authToken);
        await appStorage.setItem(USER_KEY, JSON.stringify(authUser));

        return { success: true };
      } else {
        const isSuspended =
          response.status === 403 ||
          data.accountStatus === 'inactive' ||
          data.accountStatus === 'deleted' ||
          (data.message && data.message.toLowerCase().includes('deactivated')) ||
          (data.message && data.message.toLowerCase().includes('suspended'));

        if (isSuspended) {
          const reason =
            data.message ||
            'Your account has been deactivated by an administrator. Please contact your system administrator to restore access.';
          setSuspendedNotice({
            visible: true,
            reason,
            email: cleanEmail,
          });
        }

        return {
          success: false,
          isSuspended: !!isSuspended,
          suspendedReason: data.message,
          message: data.message || 'Invalid email or password.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Unable to connect to authentication server. Please ensure the backend is running.',
      };
    }
  };

  /**
   * Dedicated administrator authentication against backend /api/auth/admin-login
   * Strictly enforces role === 'admin'
   */
  const adminLogin = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        const authToken = data.token;
        const authUser = data.user;

        setToken(authToken);
        setUser(authUser);

        await appStorage.setItem(TOKEN_KEY, authToken);
        await appStorage.setItem(USER_KEY, JSON.stringify(authUser));

        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Administrator authentication failed. Please verify your credentials.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Unable to connect to administrator authentication service.',
      };
    }
  };

  /**
   * Real user registration against backend /api/auth/register
   */
  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.token) {
        const authToken = data.token;
        const authUser = data.user;

        setToken(authToken);
        setUser(authUser);

        await appStorage.setItem(TOKEN_KEY, authToken);
        await appStorage.setItem(USER_KEY, JSON.stringify(authUser));

        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed. Please check your details.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Network error during registration. Please verify your connection.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    setUser(null);
    setToken(null);
    await appStorage.removeItem(TOKEN_KEY);
    await appStorage.removeItem(USER_KEY);
  };

  const showSuspendedNotice = (reason?: string, email?: string) => {
    setSuspendedNotice({
      visible: true,
      reason:
        reason ||
        'Your account has been deactivated or removed by an administrator. Please contact your system administrator.',
      email,
    });
  };

  const isAdmin = (user?.role || '').toLowerCase() === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin,
        isLoading,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        showSuspendedNotice,
      }}
    >
      {children}
      <AccountSuspendedModal
        visible={suspendedNotice.visible}
        reason={suspendedNotice.reason}
        userEmail={suspendedNotice.email}
        onClose={() => setSuspendedNotice({ visible: false, reason: '' })}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
