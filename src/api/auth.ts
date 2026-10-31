const AUTH_BASE_URL = '';
const TOKEN_KEY = 'lad_token';

export interface User {
  username: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

export function getDashboardUrl(token?: string | null): string {
  const t = token ?? getStoredToken();
  if (!t) return 'https://logveyra.vercel.app/';
  return `https://logveyra.vercel.app/?token=${encodeURIComponent(t)}`;
}

export async function checkSession(): Promise<User | null> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      setStoredToken(null);
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<{ ok: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error?.message || 'Login failed' };
    }

    if (data.token) {
      setStoredToken(data.token);
    }

    return { ok: true, token: data.token };
  } catch {
    return { ok: false, error: 'Network error connecting to auth server' };
  }
}

export async function logout(): Promise<void> {
  try {
    setStoredToken(null);
    await fetch(`${AUTH_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Ignore network error on logout
  }
}

export async function pingDashboard(): Promise<boolean> {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/api/dashboard/ping`, {
      method: 'GET',
      credentials: 'include',
    });
    return res.ok;
  } catch {
    return false;
  }
}
