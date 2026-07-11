import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, getDefaultRouteForRole } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';

// ── Role badge config ─────────────────────────────────────────────────────────
const ROLE_META = {
  student:       { label: 'Student',       color: '#6366f1', bg: 'rgba(99,102,241,0.12)'  },
  faculty:       { label: 'Faculty',       color: '#14b8a6', bg: 'rgba(20,184,166,0.12)'  },
  canteen_admin: { label: 'Canteen Admin', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  xerox_admin:   { label: 'Print Admin',   color: '#0891b2', bg: 'rgba(8,145,178,0.12)'   },
  venue_admin:   { label: 'Venue Admin',   color: '#7c3aed', bg: 'rgba(124,58,237,0.12)'  },
};

// ── Demo credential quick-fill accounts ──────────────────────────────────────
const DEMO_ACCOUNTS = [
  { role: 'student',       email: 'student@unihub.com', password: 'student123'  },
  { role: 'faculty',       email: 'faculty@unihub.com', password: 'faculty123'  },
  { role: 'canteen_admin', email: 'canteen@unihub.com', password: 'canteen123'  },
  { role: 'xerox_admin',   email: 'xerox@unihub.com',   password: 'xerox123'    },
  { role: 'venue_admin',   email: 'venue@unihub.com',   password: 'venue123'    },
];

// ── Role redirect routing matrix ─────────────────────────────────────────────
// role 'student'       → '/'              (main campus dashboard)
// role 'faculty'       → '/'              (booking utilities)
// role 'canteen_admin' → '/canteen/admin' (queue control panel)
// role 'xerox_admin'   → '/print/admin'   (operator metrics)
// role 'venue_admin'   → '/venue/admin'   (spatial allocation control board)

// ── Shared input styles ───────────────────────────────────────────────────────
const inputBase = {
  width:      '100%',
  padding:    '12px 14px',
  background: 'rgba(9,9,11,0.65)',
  border:     '1px solid rgba(63,63,70,0.65)',
  borderRadius: 10,
  color:      '#fafafa',
  fontSize:    14,
  boxSizing:  'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
  fontFamily: "'Inter', system-ui, sans-serif",
  outline:    'none',
};

const inputFocus = {
  ...inputBase,
  borderColor: 'rgba(99,102,241,0.75)',
  boxShadow:   '0 0 0 3px rgba(99,102,241,0.14), 0 0 14px rgba(99,102,241,0.1)',
  background:  'rgba(15,15,22,0.85)',
};

export default function LoginPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, register, user, loading } = useAuth();

  const [mode,         setMode]         = useState('login'); // 'login' | 'register'
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [name,         setName]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');
  const [successRole,  setSuccessRole]  = useState(null); // flash badge after login

  // If already authenticated, redirect to the role's default route
  useEffect(() => {
    if (!loading && user) {
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    }
  }, [user, loading, navigate]);

  // Pre-fill demo credentials
  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setMode('login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let loggedInUser;

      if (mode === 'login') {
        loggedInUser = await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name.');
          setSubmitting(false);
          return;
        }
        loggedInUser = await register(name, email, password);
      }

      setSuccessRole(loggedInUser.role);

      // Brief success flash then navigate to role-specific dashboard
      setTimeout(() => {
        const from = location.state?.from?.pathname;
        navigate(from || getDefaultRouteForRole(loggedInUser.role), { replace: true });
      }, 900);

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  // Suppress render while AuthProvider validates the stored token
  if (loading) return null;

  return (
    <div
      id="login-page"
      style={{
        minHeight:  '100vh',
        background: '#09090b',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        padding:    '24px 16px',
        position:   'relative',
        overflow:   'hidden',
      }}
    >
      {/* ── Animated mesh accent orbs ── */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Indigo top-left */}
        <div
          style={{
            position:   'absolute',
            top:        '-15%',
            left:       '-10%',
            width:       600,
            height:      600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
            animation:  'meshFloat 14s ease-in-out infinite',
            filter:     'blur(1px)',
          }}
        />
        {/* Teal bottom-right */}
        <div
          style={{
            position:   'absolute',
            bottom:     '-20%',
            right:      '-10%',
            width:       700,
            height:      700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)',
            animation:  'meshFloatB 18s ease-in-out infinite',
            filter:     'blur(1px)',
          }}
        />
        {/* Amber mid-right accent */}
        <div
          style={{
            position:   'absolute',
            top:        '40%',
            right:      '20%',
            width:       400,
            height:      400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)',
            animation:  'meshFloatC 22s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        aria-hidden="true"
        style={{
          position:        'absolute',
          inset:           0,
          pointerEvents:   'none',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Content container ── */}
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* ── Logo lockup ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <a
            href="/"
            style={{
              display:       'inline-flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:            12,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width:      56,
                height:     56,
                borderRadius: 16,
                background: 'linear-gradient(135deg,#4f46e5,#0d9488)',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:  '0 0 40px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2)',
              }}
            >
              <GraduationCap size={28} color="#fff" />
            </div>
            <span
              style={{
                fontSize:   28,
                fontWeight: 900,
                letterSpacing: '-0.5px',
                backgroundImage: 'linear-gradient(90deg,#818cf8,#34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
              }}
            >
              UniHub
            </span>
          </a>
          <p style={{ color: '#52525b', fontSize: 14, marginTop: 8, marginBottom: 0 }}>
            Campus platform — sign in to continue
          </p>
        </div>

        {/* ── Glassmorphism card ── */}
        <div
          style={{
            background:           'rgba(24,24,27,0.75)',
            border:               '1px solid rgba(63,63,70,0.6)',
            borderRadius:         20,
            backdropFilter:       'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            padding:              '36px 32px',
            boxShadow:            '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* ── Mode tabs ── */}
          <div
            style={{
              display:      'flex',
              background:   'rgba(9,9,11,0.6)',
              borderRadius:  12,
              padding:       4,
              marginBottom:  28,
              border:       '1px solid rgba(63,63,70,0.5)',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                id={`tab-${m}`}
                onClick={() => { setMode(m); setError(''); setSuccessRole(null); }}
                style={{
                  flex:         1,
                  padding:      '9px 0',
                  borderRadius:  9,
                  border:       'none',
                  cursor:       'pointer',
                  fontWeight:    600,
                  fontSize:      14,
                  fontFamily:   "'Inter', system-ui, sans-serif",
                  transition:   'all 0.2s',
                  background:   mode === m ? 'rgba(99,102,241,0.18)' : 'transparent',
                  color:        mode === m ? '#818cf8'                : '#71717a',
                  boxShadow:    mode === m ? '0 0 0 1px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* ── Success flash banner ── */}
          {successRole && (
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:           10,
                marginBottom:  20,
                padding:      '12px 16px',
                borderRadius:  12,
                background:   ROLE_META[successRole]?.bg || 'rgba(99,102,241,0.12)',
                border:       `1px solid ${ROLE_META[successRole]?.color || '#6366f1'}40`,
              }}
            >
              <span style={{ fontSize: 18, color: ROLE_META[successRole]?.color }}>✓</span>
              <span style={{ color: ROLE_META[successRole]?.color, fontSize: 14, fontWeight: 600 }}>
                Welcome! Signed in as {ROLE_META[successRole]?.label}. Redirecting…
              </span>
            </div>
          )}

          {/* ── Dismissible error banner ── */}
          {error && (
            <div
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:           10,
                marginBottom:  20,
                padding:      '12px 16px',
                borderRadius:  12,
                background:   'rgba(239,68,68,0.1)',
                border:       '1px solid rgba(239,68,68,0.3)',
              }}
            >
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <span style={{ color: '#f87171', fontSize: 14, flex: 1 }}>{error}</span>
              <button
                id="dismiss-error"
                onClick={() => setError('')}
                style={{
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  padding:     0,
                  color:      '#f87171',
                  display:    'flex',
                  flexShrink:  0,
                }}
                aria-label="Dismiss error"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Full name — register mode only */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="input-name"
                  style={{ display: 'block', color: '#a1a1aa', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
                >
                  Full Name
                </label>
                <input
                  id="input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anannya Sunny"
                  required
                  style={inputBase}
                  onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                  onBlur={(e)  => Object.assign(e.target.style, inputBase)}
                />
              </div>
            )}

            {/* Campus email */}
            <div>
              <label
                htmlFor="input-email"
                style={{ display: 'block', color: '#a1a1aa', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
              >
                Campus Email
              </label>
              <input
                id="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@unihub.com"
                required
                autoComplete="email"
                style={inputBase}
                onFocus={(e) => Object.assign(e.target.style, inputFocus)}
                onBlur={(e)  => Object.assign(e.target.style, inputBase)}
              />
            </div>

            {/* Security password */}
            <div>
              <label
                htmlFor="input-password"
                style={{ display: 'block', color: '#a1a1aa', fontSize: 13, fontWeight: 500, marginBottom: 6 }}
              >
                Security Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Your password' : 'Min. 8 characters'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ ...inputBase, paddingRight: 44 }}
                  onFocus={(e) => Object.assign(e.target.style, { ...inputFocus, paddingRight: '44px' })}
                  onBlur={(e)  => Object.assign(e.target.style, { ...inputBase, paddingRight: '44px' })}
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position:   'absolute',
                    right:       12,
                    top:        '50%',
                    transform:  'translateY(-50%)',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    padding:     0,
                    color:      '#52525b',
                    display:    'flex',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#a1a1aa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#52525b'; }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="btn-submit"
              type="submit"
              disabled={submitting}
              style={{
                marginTop:     4,
                padding:      '13px 0',
                borderRadius:  12,
                border:       'none',
                cursor:        submitting ? 'not-allowed' : 'pointer',
                fontWeight:    700,
                fontSize:      15,
                letterSpacing: '0.01em',
                fontFamily:   "'Inter', system-ui, sans-serif",
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                gap:            8,
                transition:   'all 0.2s',
                background:    submitting
                  ? 'rgba(99,102,241,0.35)'
                  : 'linear-gradient(135deg,#4f46e5,#0d9488)',
                color:        '#fff',
                boxShadow:     submitting ? 'none' : '0 0 28px rgba(99,102,241,0.35)',
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} style={{ animation: 'loginSpin 0.8s linear infinite' }} />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* ── Demo accounts quick-fill panel ── */}
        <div
          style={{
            marginTop:            20,
            background:           'rgba(24,24,27,0.5)',
            border:               '1px solid rgba(63,63,70,0.4)',
            borderRadius:          16,
            backdropFilter:       'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding:              '20px 24px',
          }}
        >
          <p
            style={{
              color:          '#52525b',
              fontSize:        12,
              fontWeight:      600,
              textTransform:  'uppercase',
              letterSpacing:  '0.08em',
              margin:         '0 0 12px',
            }}
          >
            Demo Accounts
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const meta = ROLE_META[acc.role];
              return (
                <button
                  key={acc.role}
                  id={`demo-${acc.role}`}
                  onClick={() => fillDemo(acc)}
                  style={{
                    padding:    '10px 12px',
                    borderRadius: 10,
                    border:     `1px solid ${meta.color}28`,
                    background:  meta.bg,
                    cursor:     'pointer',
                    textAlign:  'left',
                    transition: 'all 0.15s',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${meta.color}55`;
                    e.currentTarget.style.transform   = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow   = `0 4px 16px ${meta.color}18`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${meta.color}28`;
                    e.currentTarget.style.transform   = 'translateY(0)';
                    e.currentTarget.style.boxShadow   = 'none';
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: meta.color, marginBottom: 2 }}>
                    {meta.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#52525b', fontFamily: 'monospace' }}>
                    {acc.email}
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ color: '#3f3f46', fontSize: 11, margin: '12px 0 0', textAlign: 'center' }}>
            Click a card to pre-fill credentials, then Sign In
          </p>
        </div>
      </div>

      {/* ── Injected keyframes ── */}
      <style>{`
        @keyframes meshFloat {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(40px,-30px) scale(1.06); }
          66%       { transform: translate(-20px,20px) scale(0.96); }
        }
        @keyframes meshFloatB {
          0%, 100% { transform: translate(0,0) scale(1); }
          40%       { transform: translate(-30px,25px) scale(1.04); }
          75%       { transform: translate(25px,-18px) scale(0.97); }
        }
        @keyframes meshFloatC {
          0%, 100% { transform: translate(0,0) scale(1); }
          30%       { transform: translate(18px,28px) scale(1.03); }
          70%       { transform: translate(-25px,-20px) scale(0.97); }
        }
        @keyframes loginSpin {
          to { transform: rotate(360deg); }
        }
        #login-page input::placeholder { color: #3f3f46; }
        #login-page input              { outline: none;  }
      `}</style>
    </div>
  );
}
