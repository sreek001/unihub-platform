import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getDefaultRouteForRole } from '../context/AuthContext';

/**
 * ProtectedRoute
 *
 * Authentication + authorization shield gate component.
 *
 * Props:
 *   children      — the protected JSX element
 *   allowedRoles  — optional string[] of roles that may access this route
 *                   e.g. ['faculty', 'student'] or ['canteen_admin']
 *
 * Guard sequence:
 *   1. loading true   → cinematic full-screen spinner over #09090b (prevents layout flash)
 *   2. no user        → <Navigate replace to="/login" /> with 'from' state
 *   3. role mismatch  → <Navigate replace to="/" />
 *   4. all clear      → render children
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // ── 1. Auth-context loading — render spinner to prevent unauthenticated flash
  if (loading) {
    return (
      <div
        id="auth-loading-screen"
        style={{
          position:       'fixed',
          inset:          0,
          background:     '#09090b',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          zIndex:         9999,
          gap:            20,
        }}
      >
        {/* Layered cinematic spinner */}
        <div style={{ position: 'relative', width: 64, height: 64 }}>
          {/* Outer glow pulse */}
          <div
            style={{
              position:     'absolute',
              inset:        -12,
              borderRadius: '50%',
              background:   'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
              animation:    'authPulse 2s ease-in-out infinite',
            }}
          />
          {/* Spinner ring */}
          <div
            style={{
              position:       'absolute',
              inset:          0,
              borderRadius:   '50%',
              border:         '2px solid rgba(99,102,241,0.12)',
              borderTopColor: '#6366f1',
              animation:      'authSpin 0.75s linear infinite',
              boxShadow:      '0 0 24px rgba(99,102,241,0.3)',
            }}
          />
          {/* Centre dot */}
          <div
            style={{
              position:     'absolute',
              top:          '50%',
              left:         '50%',
              transform:    'translate(-50%, -50%)',
              width:        10,
              height:       10,
              borderRadius: '50%',
              background:   '#6366f1',
              boxShadow:    '0 0 14px rgba(99,102,241,0.9)',
            }}
          />
        </div>

        <p
          style={{
            color:         '#3f3f46',
            fontSize:      13,
            fontFamily:    "'Inter', system-ui, sans-serif",
            fontWeight:    500,
            letterSpacing: '0.04em',
            margin:        0,
          }}
        >
          Verifying session…
        </p>

        <style>{`
          @keyframes authSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes authPulse {
            0%, 100% { opacity: 0.4; transform: scale(1);    }
            50%       { opacity: 1;   transform: scale(1.18); }
          }
        `}</style>
      </div>
    );
  }

  // ── 2. Not authenticated — bounce to /login with return path preserved
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── 3. Role mismatch — bounce to the user's own canonical home (not the student root)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // ── 4. All checks pass — render the protected content
  return children;
}
