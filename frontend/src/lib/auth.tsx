'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, getApiError, type AuthUser, TOKEN_STORAGE_KEY } from './api';
import { useToast } from './toast';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast } = useToast();

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      const timer = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(timer);
    }
    api.get<{ data: { user: AuthUser } }>('/auth/me')
      .then(({ data }) => setUser(data.data.user))
      .catch((error: unknown) => {
        if (typeof error === 'object' && error !== null && 'response' in error) {
          const response = error.response;
          if (typeof response === 'object' && response !== null && 'status' in response && response.status === 401) {
            clearSession();
            return;
          }
        }
        console.error('Session verification failed:', error);
        showToast(getApiError(error, 'Could not verify your account. Check the API connection.'), 'error');
      })
      .finally(() => setLoading(false));
  }, [clearSession, showToast]);

  useEffect(() => {
    window.addEventListener('claim-appeal:unauthorized', clearSession);
    return () => window.removeEventListener('claim-appeal:unauthorized', clearSession);
  }, [clearSession]);

  const saveSession = useCallback((token: string, nextUser: AuthUser) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(nextUser);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{ data: { token: string; user: AuthUser } }>('/auth/login', {
      email,
      password,
    });
    saveSession(data.data.token, data.data.user);
  }, [saveSession]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ data: { token: string; user: AuthUser } }>('/auth/register', {
      name,
      email,
      password,
    });
    saveSession(data.data.token, data.data.user);
  }, [saveSession]);

  const logout = useCallback(() => {
    clearSession();
    router.replace('/login');
  }, [clearSession, router]);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
