import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { checkSession, login as apiLogin, logout as apiLogout, getStoredToken, getDashboardUrl, type User } from './api/auth';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  dashboardUrl: string;
  login: (u: string, p: string) => Promise<{ ok: boolean; token?: string; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const u = await checkSession();
      setUser(u);
      setToken(getStoredToken());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (u: string, p: string) => {
    const res = await apiLogin(u, p);
    if (res.ok) {
      if (res.token) {
        setToken(res.token);
      }
      await refresh();
    }
    return res;
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setToken(null);
  };

  const dashboardUrl = getDashboardUrl(token);

  return (
    <AuthContext.Provider value={{ user, token, loading, dashboardUrl, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
