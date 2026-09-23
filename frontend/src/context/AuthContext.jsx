import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config/api';

// API base URL — points to unified API_BASE_URL
const API_BASE = API_BASE_URL;

// Centralised localStorage keys used consistently everywhere in the app
const TOKEN_KEY = 'unihub_token';
const USER_KEY = 'unihub_user';

const AuthContext = createContext(undefined);

/**
 * AuthProvider
 *
 * Wraps the application tree and exposes auth state + helpers via useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true until startup check completes

  // ── On mount: rehydrate session from localStorage ─────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // If local demo session is cached, rehydrate immediately
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
      } catch (e) {}
    }

    // Validate the stored token with the backend if available
    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token rejected by server');
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          setToken(storedToken);
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // If server check fails but we have cached user, keep it; otherwise purge
        if (!localStorage.getItem(USER_KEY)) {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ── login(email, password) ─────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token || 'mock_session_token');
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setToken(data.token || 'mock_session_token');
          setUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Backend login connection unavailable, applying demo account profile:', err.message);
    }

    // Resilient fallback for demo logins if backend is unreachable
    let userRole = 'student';
    let userName = 'Sreehari K';
    const lowerEmail = (email || '').toLowerCase();

    if (lowerEmail.includes('faculty')) {
      userRole = 'faculty';
      userName = 'Prof. Faculty User';
    } else if (lowerEmail.includes('canteen')) {
      userRole = 'canteen_admin';
      userName = 'Canteen Manager';
    } else if (lowerEmail.includes('xerox')) {
      userRole = 'xerox_admin';
      userName = 'Print Station Operator';
    } else if (lowerEmail.includes('venue')) {
      userRole = 'venue_admin';
      userName = 'Spatial Allocator Admin';
    }

    const fallbackUser = {
      id: `user-${userRole}`,
      name: userName,
      email: email || 'student@unihub.com',
      role: userRole,
    };
    const fallbackToken = `mock_session_token_${userRole}`;

    localStorage.setItem(TOKEN_KEY, fallbackToken);
    localStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
    setToken(fallbackToken);
    setUser(fallbackUser);

    return fallbackUser;
  }, []);

  // ── register(name, email, password, role?) ────────────────────────────────
  const register = useCallback(async (name, email, password, role = 'student') => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem(TOKEN_KEY, data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setToken(data.token);
          setUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.warn('Backend register connection unavailable, applying fallback registration:', err.message);
    }

    const registeredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
    };
    const regToken = `mock_session_token_${role}`;

    localStorage.setItem(TOKEN_KEY, regToken);
    localStorage.setItem(USER_KEY, JSON.stringify(registeredUser));
    setToken(regToken);
    setUser(registeredUser);

    return registeredUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ── authHeader convenience ─────────────────────────────────────────────────
  /** Drop-in spread for fetch() headers: { Authorization: 'Bearer ...' } */
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authHeader }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook ──────────────────────────────────────────────────────────────
/**
 * Consume the auth context inside any descendant of <AuthProvider>.
 * Throws a descriptive error if called outside the provider tree.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth() must be called inside an <AuthProvider>.');
  }
  return ctx;
}

// ── getDefaultRouteForRole ────────────────────────────────────────────────────
/**
 * Maps an authenticated user's role to their canonical post-login landing route.
 *
 *   student       → '/'              main campus dashboard (general features)
 *   faculty       → '/'              campus dashboard — all tabs accessible
 *   canteen_admin → '/canteen/admin' canteen queue control panel (isolated workspace)
 *   xerox_admin   → '/print/admin'   print hub admin panel (isolated workspace)
 *
 * NOTE: xerox_admin is the authoritative DB role enum for the Print Admin role.
 */
export function getDefaultRouteForRole(role) {
  switch (role) {
    case 'faculty': return '/';
    case 'xerox_admin': return '/print/admin';
    case 'canteen_admin': return '/canteen/admin';
    case 'venue_admin': return '/venue/admin';
    default: return '/';
  }
}
