import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// API base URL — overridable via VITE_API_URL in .env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Centralised localStorage key used consistently everywhere in the app
const TOKEN_KEY = 'unihub_token';

const AuthContext = createContext(undefined);

/**
 * AuthProvider
 *
 * Wraps the application tree and exposes auth state + helpers via useAuth().
 *
 * Context shape:
 *   user        — { id, name, email, role } | null
 *   token       — raw JWT string | null  (initialised from localStorage TOKEN_KEY)
 *   loading     — true while the startup token-validation call is in-flight
 *   login()     — POST /api/auth/login, returns user object, throws on failure
 *   register()  — POST /api/auth/register, returns user object, throws on failure
 *   logout()    — purges state + localStorage token (automatic session logout)
 *   authHeader  — { Authorization: 'Bearer ...' } | {} convenience spread object
 */
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true until startup check completes

  // ── On mount: rehydrate session from localStorage ─────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    // Validate the stored token with the backend before trusting it
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
            id:    data.user.id,
            name:  data.user.name,
            email: data.user.email,
            role:  data.user.role,
          });
        } else {
          // Server responded but token is stale / revoked
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .catch(() => {
        // Network error or 401/403 — execute automatic session logout
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ── login(email, password) ─────────────────────────────────────────────────
  /**
   * POSTs credentials to /api/auth/login.
   * On success: persists JWT + populates state.
   * On failure: throws Error with the server message.
   * Returns: user payload { id, name, email, role }
   */
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    // Return user so the caller can drive role-based navigation immediately
    return data.user;
  }, []);

  // ── register(name, email, password, role?) ────────────────────────────────
  /**
   * Admin roles (canteen_admin, xerox_admin) must be seeded server-side.
   * This endpoint allows 'student' | 'faculty' self-registration only.
   * Returns: user payload { id, name, email, role }
   */
  const register = useCallback(async (name, email, password, role = 'student') => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Registration failed. Please try again.');
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);

    return data.user;
  }, []);

  // ── logout() ──────────────────────────────────────────────────────────────
  /**
   * Purges JWT from localStorage and resets all auth state.
   * The caller is responsible for navigating to /login afterward.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
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
    case 'faculty':       return '/';
    case 'canteen_admin': return '/canteen/admin';
    case 'xerox_admin':   return '/print/admin';
    case 'student':
    default:              return '/';
  }
}
