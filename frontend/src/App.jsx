import React from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { InfiniteGridBackground } from '@/components/ui/infinite-grid-background';
import {
  GraduationCap,
  Inbox,
  CalendarDays,
  Utensils,
  Printer,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import './App.css';

// ── Auth layer ────────────────────────────────────────────────────────────────
import { AuthProvider, useAuth, getDefaultRouteForRole } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';

// ── Feature pages ─────────────────────────────────────────────────────────────
import LostFound from './pages/LostFound/LostFound.jsx';
import CanteenDashboard from './pages/Canteen/dashboard.jsx';
import AdminDashboard from './pages/Canteen/AdminDashboard.jsx';
import BookingDashboard from './pages/Booking/BookingDashboard.jsx';
import PrintDashboard from './pages/Print/PrintDashboard.jsx';
import VenueAdminDashboard from './pages/Venue/VenueAdminDashboard.jsx';
import VenueAuthorizerPage from './pages/Venue/VenueAuthorizerPage.jsx';

import { UserProvider } from './pages/academics/UserContext.jsx';
import AcademicsLayout from './pages/academics/AcademicsLayout.jsx';
import Marketplace from './pages/academics/Marketplace.jsx';
import Vault from './pages/academics/Vault.jsx';
import Inventory from './pages/academics/Inventory.jsx';
import Settings from './pages/academics/Settings.jsx';

// ── Cinematic components ──────────────────────────────────────────────────────
import HeroGeometric from './components/HeroGeometric.jsx';
import DisplayCards from './components/DisplayCards.jsx';
import StackedCircularFooter from './components/StackedCircularFooter.jsx';

// ── Role badge colour map ─────────────────────────────────────────────────────
const ROLE_STYLE = {
  student: { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', label: 'Student' },
  faculty: { color: '#14b8a6', bg: 'rgba(20,184,166,0.12)', label: 'Faculty' },
  canteen_admin: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Canteen Admin' },
  xerox_admin: { color: '#0891b2', bg: 'rgba(8,145,178,0.12)', label: 'Print Admin' },
  venue_admin: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', label: 'Venue Admin' },
};

// ── Primary navigation items with per-role visibility ───────────────────────
// allowedRoles: null = visible to everyone in AppLayout
// allowedRoles: ['student','faculty'] = restricted
const NAV_ITEMS = [
  { to: '/academics/marketplace', label: 'Academics', icon: GraduationCap, color: '#1d4ed8', allowedRoles: ['student', 'faculty'] },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays, color: '#14b8a6', allowedRoles: ['student', 'faculty'] },
  { to: '/lost-found', label: 'Lost & Found', icon: Inbox, color: '#2563eb', allowedRoles: ['student', 'faculty'] },
  { to: '/canteen', label: 'Canteen', icon: Utensils, color: '#d97706', allowedRoles: ['student', 'faculty'] },
  { to: '/print', label: 'Print', icon: Printer, color: '#0891b2', allowedRoles: ['student', 'faculty'] },
];

// ── User chip in navbar ───────────────────────────────────────────────────────
function NavUserChip() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  if (!user) {
    return (
      <Link
        to="/login"
        id="nav-login-link"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '7px 14px',
          borderRadius: 10,
          background: 'linear-gradient(135deg,#4f46e5,#0d9488)',
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          textDecoration: 'none',
          boxShadow: '0 0 16px rgba(99,102,241,0.25)',
        }}
      >
        Sign In
      </Link>
    );
  }

  const meta = ROLE_STYLE[user.role] || ROLE_STYLE.student;
  const initials = (user?.name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="nav-user-chip"
        data-magnetic
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px 6px 6px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(15,76,129,0.12)',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: `linear-gradient(135deg, ${meta.color}80, ${meta.color}40)`,
            border: `1px solid ${meta.color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            color: meta.color,
          }}
        >
          {initials}
        </div>
        {/* Name + role badge */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
            {user?.name?.split(' ')[0] || ''}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: meta.color,
              background: meta.bg,
              padding: '1px 6px',
              borderRadius: 4,
              display: 'inline-block',
              lineHeight: 1.6,
            }}
          >
            {meta.label}
          </div>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: '#94a3b8',
            marginLeft: 2,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Click-away overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 50,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(15,76,129,0.1)',
              borderRadius: 14,
              padding: 8,
              minWidth: 180,
              boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(15,76,129,0.07)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{user.email}</div>
            </div>
            <button
              id="nav-logout-btn"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 12px',
                marginTop: 4,
                borderRadius: 9,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#ef4444',
                fontWeight: 600,
                fontSize: 13,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main app shell with persistent nav + footer ───────────────────────────────
function AppLayout() {
  const { user } = useAuth();

  // ── Role guard: admin-only roles don't belong in the general app shell ───────
  // If canteen_admin, xerox_admin or venue_admin land here (e.g. manual URL entry),
  // immediately eject them to their isolated admin workspace.
  if (user && (user.role === 'canteen_admin' || user.role === 'xerox_admin' || user.role === 'venue_admin')) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  // Visible nav links depend on role
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
  );

  return (
    <InfiniteGridBackground>
      <div
        className="min-h-screen flex flex-col font-sans relative z-10"
        style={{ background: 'transparent', color: '#0f172a' }}
      >
        {/* Sticky glassmorphic navbar */}
        <nav
          className="sticky top-0 z-50 px-6 py-4"
          style={{
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.60)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
          }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">

            {/* Logo */}
            <Link
              to="/"
              data-magnetic
              className="flex items-center gap-3 text-xl font-black"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#1d4ed8,#14b8a6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GraduationCap style={{ color: '#fff', width: 18, height: 18 }} />
              </div>
              <span
                style={{
                  backgroundImage: 'linear-gradient(90deg,#1d4ed8,#0f766e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                UniHub
              </span>
            </Link>

            {/* Nav links — filtered by role */}
            <div className="flex items-center gap-1">
              {visibleNavItems.map(({ to, label, icon: Icon, color }) => (
                <Link
                  key={to}
                  to={to}
                  data-magnetic
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon style={{ width: 15, height: 15, color }} />
                  <span style={{ color: '#475569', fontWeight: 600, fontSize: 14 }}>{label}</span>
                </Link>
              ))}
            </div>

            {/* Auth chip */}
            <NavUserChip />
          </div>
        </nav>

        <main className="flex-grow">
          <Outlet />
        </main>

        <footer
          className="text-center py-5"
          style={{ borderTop: '1px solid rgba(15,76,129,.06)', color: '#94a3b8', fontSize: 13 }}
        >
          © {new Date().getFullYear()} UniHub Campus Platform
        </footer>
      </div>
    </InfiniteGridBackground>
  );
}

// ── Public home page ──────────────────────────────────────────────────────────
function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'transparent' }}>
      <HeroGeometric
        badge="UniHub Platform"
        title1="One Platform."
        title2="Every Campus Need."
        description="Academics, bookings, food, printing, and lost items — all in one beautifully unified campus experience."
        ctaLabel="Explore Services"
        ctaHref="#features"
      />
      <DisplayCards />
      <StackedCircularFooter />
    </div>
  );
}

// ── Root App — full routing configuration ─────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public standalone route: Login (no AppLayout shell) ── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Full-screen admin routes (bypass AppLayout shell) ──── */}

            {/* Canteen admin — queue control panel */}
            <Route
              path="/canteen/admin"
              element={
                <ProtectedRoute allowedRoles={['canteen_admin']}>
                  <InfiniteGridBackground>
                    <AdminDashboard />
                  </InfiniteGridBackground>
                </ProtectedRoute>
              }
            />

            {/* Xerox / print admin — operator metrics */}
            <Route
              path="/print/admin"
              element={
                <ProtectedRoute allowedRoles={['xerox_admin']}>
                  <InfiniteGridBackground>
                    <PrintDashboard adminMode={true} />
                  </InfiniteGridBackground>
                </ProtectedRoute>
              }
            />

            {/* Venue admin — spatial allocation control board */}
            <Route
              path="/venue/admin"
              element={
                <ProtectedRoute allowedRoles={['venue_admin']}>
                  <InfiniteGridBackground>
                    <VenueAdminDashboard />
                  </InfiniteGridBackground>
                </ProtectedRoute>
              }
            />

            {/* Venue authorizer — booking approval queue */}
            <Route
              path="/venue/admin/authorizer"
              element={
                <ProtectedRoute allowedRoles={['venue_admin']}>
                  <InfiniteGridBackground>
                    <VenueAuthorizerPage />
                  </InfiniteGridBackground>
                </ProtectedRoute>
              }
            />

            {/* ── Main app shell routes (wrapped in AppLayout) ──────── */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Public home — accessible to all authenticated users */}
              <Route path="/" element={<Home />} />

              {/* Bookings — faculty + students */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['faculty', 'student']}>
                    <BookingDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Venue Booking Admin — faculty only (intercept target from BookingDashboard) */}
              <Route
                path="/dashboard/booking-admin"
                element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <BookingDashboard adminView={true} />
                  </ProtectedRoute>
                }
              />

              {/* Print — student-facing submission portal */}
              <Route
                path="/print"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty']}>
                    <PrintDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Lost & Found */}
              <Route
                path="/lost-found"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty']}>
                    <LostFound />
                  </ProtectedRoute>
                }
              />

              {/* Canteen — student-facing ordering view */}
              <Route
                path="/canteen"
                element={
                  <ProtectedRoute allowedRoles={['student', 'faculty']}>
                    <CanteenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Academics — nested sub-routes */}
              <Route path="/academics" element={<AcademicsLayout />}>
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="vault" element={<Vault />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

          </Routes>
        </BrowserRouter>
      </UserProvider>
    </AuthProvider>
  );
}
