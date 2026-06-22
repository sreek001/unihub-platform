import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Users,
  Sparkles,
  X,
  Check,
  XCircle,
  CalendarDays,
  LayoutGrid,
  Loader2,
  Building2,
} from 'lucide-react';
import './BookingDashboard.css';

// ─── API Base ───
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/booking';

// ─── Demo token for development (remove in production) ───
// Simulates a logged-in user when no real auth context exists yet.
const DEMO_MODE = true;
const DEMO_USER = { id: 1, name: 'Arjun K.', role: 'ADMIN' };
const DEMO_TOKEN = '';  // Set a real JWT here or wire to your AuthContext

// ─── Helper: build auth headers ───
function authHeaders() {
  if (DEMO_MODE) return {};
  return { Authorization: `Bearer ${DEMO_TOKEN}` };
}

// ─── Helper: format date to YYYY-MM-DD ───
function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// ─── Helper: format time "HH:MM:SS" → "HH:MM AM/PM" ───
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

// ─── Generate hourly time slots for a day (8 AM → 8 PM) ───
function generateTimeGrid() {
  const slots = [];
  for (let h = 8; h < 20; h++) {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push({ start, end });
  }
  return slots;
}

// ─── Framer Motion Variants ───
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { scale: 0.92, y: 24, opacity: 0 },
  visible: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
  exit: {
    scale: 0.92,
    y: 24,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ─── Skeleton Loader Component ───
function SlotSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 64, width: '100%' }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════
export default function BookingDashboard() {
  // ── State ──
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [slots, setSlots] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'my' | 'admin'
  const [error, setError] = useState(null);

  // ── Form state ──
  const [form, setForm] = useState({
    event_name: '',
    start_time: '09:00',
    end_time: '10:00',
  });

  const user = DEMO_MODE ? DEMO_USER : null;
  const isAdmin = user && (user.role === 'FACULTY' || user.role === 'ADMIN');

  // ── Fetch venues on mount ──
  useEffect(() => {
    fetchVenues();
  }, []);

  // ── Fetch slots when venue or date changes ──
  useEffect(() => {
    if (selectedVenue) fetchSlots();
  }, [selectedVenue, selectedDate]);

  // ── Fetchers ──
  async function fetchVenues() {
    setLoadingVenues(true);
    try {
      const res = await fetch(`${API}/venues`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setVenues(data.venues);
        if (data.venues.length > 0) setSelectedVenue(data.venues[0]);
      }
    } catch {
      // Fallback: use hardcoded venues for demo/offline mode
      const fallback = [
        { id: 1, name: 'Main Seminar Hall', location: 'Block A — Ground Floor', capacity: 250 },
        { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor', capacity: 120 },
        { id: 3, name: 'Advanced IoT Lab', location: 'Block C — 3rd Floor', capacity: 40 },
        { id: 4, name: 'Open Auditorium', location: 'Central Campus Grounds', capacity: 500 },
        { id: 5, name: 'Mini Conference Room', location: 'Admin Block — Room 104', capacity: 20 },
      ];
      setVenues(fallback);
      setSelectedVenue(fallback[0]);
    } finally {
      setLoadingVenues(false);
    }
  }

  async function fetchSlots() {
    if (!selectedVenue) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/venues/${selectedVenue.id}/slots?date=${selectedDate}`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (data.success) setSlots(data.slots);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function fetchMyBookings() {
    try {
      const res = await fetch(`${API}/my-bookings`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setMyBookings(data.bookings);
    } catch {
      setMyBookings([]);
    }
  }

  async function fetchPendingBookings() {
    try {
      const res = await fetch(`${API}/pending`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setPendingBookings(data.bookings);
    } catch {
      setPendingBookings([]);
    }
  }

  // ── Tab switch handler ──
  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'my') fetchMyBookings();
    if (tab === 'admin') fetchPendingBookings();
  }

  // ── Submit booking ──
  async function handleSubmitBooking(e) {
    e.preventDefault();
    if (!selectedVenue || !form.event_name || !form.start_time || !form.end_time) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(API + '/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          venue_id: selectedVenue.id,
          event_name: form.event_name,
          event_date: selectedDate,
          start_time: form.start_time,
          end_time: form.end_time,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setForm({ event_name: '', start_time: '09:00', end_time: '10:00' });
        fetchSlots();
      } else {
        setError(data.message || 'Failed to create booking.');
      }
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Approve / Reject ──
  async function handleStatusUpdate(bookingId, status) {
    try {
      const res = await fetch(`${API}/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchPendingBookings();
        fetchSlots();
      } else {
        setError(data.message);
      }
    } catch {
      setError('Network error during status update.');
    }
  }

  // ── Build time grid with booking overlays ──
  const timeGrid = generateTimeGrid();
  function getSlotStatus(start, end) {
    for (const s of slots) {
      const sStart = s.start_time.slice(0, 5);
      const sEnd = s.end_time.slice(0, 5);
      if (sStart < end && sEnd > start) {
        return s;
      }
    }
    return null;
  }

  // ═══════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="booking-root" style={{ padding: '32px 24px', maxWidth: 1280, margin: '0 auto' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 36,
          paddingBottom: 24,
          borderBottom: '1px solid rgba(55,55,70,0.25)',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            margin: 0,
          }}>
            <motion.div
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
            >
              <Calendar
                style={{
                  width: 36,
                  height: 36,
                  color: '#a855f7',
                  filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.4))',
                }}
              />
            </motion.div>
            Venue Coordinator
          </h1>
          <p style={{ color: 'rgba(161,161,170,0.7)', fontSize: '0.875rem', marginTop: 6, marginBottom: 0 }}>
            Reserve seminar halls and project spaces — zero scheduling conflicts.
          </p>
        </div>

        {/* User badge */}
        {user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(15,15,25,0.6)',
              border: '1px solid rgba(55,55,70,0.3)',
              borderRadius: 12,
              padding: '10px 16px',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff',
            }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e4e4e7' }}>{user.name}</div>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: user.role === 'ADMIN' ? '#a78bfa' : user.role === 'FACULTY' ? '#818cf8' : '#6ee7b7',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>{user.role}</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* ── Tab Navigation ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', gap: 4, marginBottom: 28, position: 'relative' }}
      >
        {[
          { key: 'grid', label: 'Availability Grid', icon: LayoutGrid },
          { key: 'my', label: 'My Bookings', icon: CalendarDays },
          ...(isAdmin ? [{ key: 'admin', label: 'Pending Approvals', icon: ShieldAlert }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'transparent',
                color: isActive ? '#c4b5fd' : 'rgba(161,161,170,0.6)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                position: 'relative',
                fontFamily: 'Inter, sans-serif',
                transition: 'color 0.2s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(139,92,246,0.1)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: 10,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                />
              )}
              <Icon style={{ width: 15, height: 15, position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* ── Tab: Availability Grid ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'grid' && (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="booking-grid"
            style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems: 'start' }}
          >
            {/* ─ Left Panel: Venue Selector ─ */}
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', damping: 20, delay: 0.1 }}
              className="glass-card"
              style={{ padding: 24, position: 'relative', overflow: 'hidden' }}
            >
              <div className="accent-bar" />

              <h3 className="section-title" style={{ marginTop: 8 }}>
                <Building2 style={{ width: 13, height: 13, display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                Select Venue
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loadingVenues ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 52, width: '100%' }} />
                  ))
                ) : (
                  venues.map((venue) => {
                    const isActive = selectedVenue?.id === venue.id;
                    return (
                      <button
                        key={venue.id}
                        onClick={() => setSelectedVenue(venue)}
                        className={`venue-btn ${isActive ? 'active' : ''}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeVenueGlow"
                            className="venue-glow"
                            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                          />
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>
                          <span style={{ display: 'block', fontWeight: 600 }}>{venue.name}</span>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginTop: 3,
                            fontSize: '0.7rem',
                            color: 'rgba(113,113,122,0.7)',
                          }}>
                            <MapPin style={{ width: 10, height: 10 }} />
                            {venue.location}
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Users style={{ width: 10, height: 10 }} />
                              {venue.capacity}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Date Picker */}
              <div style={{ marginTop: 24 }}>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Request Slot Button */}
              <motion.button
                whileHover={{ scale: 1.015, boxShadow: '0 0 24px rgba(139,92,246,0.25)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
                style={{ marginTop: 24 }}
              >
                <Sparkles style={{ width: 16, height: 16 }} />
                Request New Slot
                <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>
            </motion.div>

            {/* ─ Right Panel: Time Slot Grid ─ */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingLeft: 4,
              }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                  {selectedVenue?.name || 'Select a Venue'}
                  <span style={{ color: 'rgba(113,113,122,0.5)', fontWeight: 400, marginLeft: 8, fontSize: '0.85rem' }}>
                    / {selectedDate}
                  </span>
                </h2>
                <span
                  className="live-badge"
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    color: '#a78bfa',
                    background: 'rgba(139,92,246,0.08)',
                    padding: '5px 12px',
                    borderRadius: 9999,
                    border: '1px solid rgba(139,92,246,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Live Grid
                </span>
              </div>

              {loadingSlots ? (
                <SlotSkeleton />
              ) : (
                <motion.div
                  key={`${selectedVenue?.id}-${selectedDate}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {timeGrid.map((tg) => {
                    const booking = getSlotStatus(tg.start, tg.end);
                    const isAvailable = !booking;
                    const status = booking?.status || 'AVAILABLE';

                    return (
                      <motion.div
                        key={tg.start}
                        variants={itemVariants}
                        whileHover={{ x: 5, transition: { duration: 0.15 } }}
                        className="slot-row"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <Clock style={{ width: 17, height: 17, color: 'rgba(113,113,122,0.5)' }} />
                          <div>
                            <p style={{
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#e4e4e7',
                              margin: 0,
                            }}>
                              {fmtTime(tg.start)} — {fmtTime(tg.end)}
                            </p>
                            {booking && (
                              <p style={{
                                fontSize: '0.72rem',
                                color: status === 'APPROVED' ? 'rgba(251,113,133,0.8)' : 'rgba(251,191,36,0.8)',
                                marginTop: 3,
                                marginBottom: 0,
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                              }}>
                                {booking.event_name}
                                <span style={{
                                  color: 'rgba(113,113,122,0.5)',
                                  fontWeight: 400,
                                  marginLeft: 8,
                                }}>
                                  by {booking.user_name}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          {isAvailable && (
                            <span className="status-pill status-available">
                              <CheckCircle style={{ width: 13, height: 13 }} />
                              Available
                            </span>
                          )}
                          {status === 'APPROVED' && (
                            <span className="status-pill status-booked">
                              <ShieldAlert style={{ width: 13, height: 13 }} />
                              Reserved
                            </span>
                          )}
                          {status === 'PENDING' && (
                            <span className="status-pill status-pending">
                              <AlertCircle style={{ width: 13, height: 13 }} />
                              Pending
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Tab: My Bookings ── */}
        {activeTab === 'my' && (
          <motion.div
            key="my-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="glass-card" style={{ padding: 28 }}>
              <div className="accent-bar" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '8px 0 20px' }}>
                Your Booking History
              </h3>

              {myBookings.length === 0 ? (
                <div className="empty-state">
                  <CalendarDays style={{ width: 40, height: 40 }} />
                  <p style={{ fontSize: '0.85rem', marginTop: 8 }}>No bookings yet. Request your first slot!</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {myBookings.map((b) => (
                    <motion.div key={b.id} variants={itemVariants} className="slot-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <Calendar style={{ width: 17, height: 17, color: 'rgba(139,92,246,0.5)' }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', margin: 0 }}>
                            {b.event_name}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(161,161,170,0.6)', margin: '3px 0 0' }}>
                            {b.venue_name} · {b.event_date?.slice(0, 10)} · {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                          </p>
                        </div>
                      </div>
                      <span className={`status-pill ${
                        b.status === 'APPROVED' ? 'status-available' :
                        b.status === 'REJECTED' ? 'status-booked' :
                        'status-pending'
                      }`}>
                        {b.status === 'APPROVED' && <CheckCircle style={{ width: 13, height: 13 }} />}
                        {b.status === 'REJECTED' && <XCircle style={{ width: 13, height: 13 }} />}
                        {b.status === 'PENDING' && <AlertCircle style={{ width: 13, height: 13 }} />}
                        {b.status}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Tab: Admin Approvals ── */}
        {activeTab === 'admin' && isAdmin && (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="glass-card" style={{ padding: 28 }}>
              <div className="accent-bar" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '8px 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert style={{ width: 18, height: 18, color: '#a78bfa' }} />
                Pending Approval Queue
              </h3>

              {pendingBookings.length === 0 ? (
                <div className="empty-state">
                  <Check style={{ width: 40, height: 40 }} />
                  <p style={{ fontSize: '0.85rem', marginTop: 8 }}>All clear — no pending requests.</p>
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {pendingBookings.map((b) => (
                    <motion.div key={b.id} variants={itemVariants} className="slot-row" style={{ flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 200 }}>
                        <AlertCircle style={{ width: 17, height: 17, color: 'rgba(251,191,36,0.6)' }} />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e4e4e7', margin: 0 }}>
                            {b.event_name}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'rgba(161,161,170,0.6)', margin: '3px 0 0' }}>
                            {b.venue_name} · {b.event_date?.slice(0, 10)} · {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                          </p>
                          <p style={{ fontSize: '0.68rem', color: 'rgba(139,92,246,0.5)', margin: '2px 0 0' }}>
                            Requested by {b.user_name} ({b.user_role})
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button
                          className="btn-approve"
                          onClick={() => handleStatusUpdate(b.id, 'APPROVED')}
                        >
                          <Check style={{ width: 12, height: 12, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleStatusUpdate(b.id, 'REJECTED')}
                        >
                          <X style={{ width: 12, height: 12, display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Booking Request Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="modal-backdrop"
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '8px 0 4px' }}>
                Request a Slot
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'rgba(161,161,170,0.6)', marginBottom: 24, marginTop: 0 }}>
                Your submission will be routed to a faculty coordinator for approval.
              </p>

              <form onSubmit={handleSubmitBooking}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Venue (read-only) */}
                  <div>
                    <label className="form-label">Venue</label>
                    <div className="form-input" style={{ background: 'rgba(15,15,25,0.5)', color: 'rgba(161,161,170,0.8)', cursor: 'default' }}>
                      {selectedVenue?.name || '—'}
                    </div>
                  </div>

                  {/* Date (read-only) */}
                  <div>
                    <label className="form-label">Date</label>
                    <div className="form-input" style={{ background: 'rgba(15,15,25,0.5)', color: 'rgba(161,161,170,0.8)', cursor: 'default' }}>
                      {selectedDate}
                    </div>
                  </div>

                  {/* Event Name */}
                  <div>
                    <label className="form-label">Event Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Mini Project Evaluation"
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  {/* Time Range */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label">Start Time</label>
                      <input
                        type="time"
                        value={form.start_time}
                        onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">End Time</label>
                      <input
                        type="time"
                        value={form.end_time}
                        onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(244,63,94,0.1)',
                        border: '1px solid rgba(244,63,94,0.2)',
                        color: '#fb7185',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'transparent',
                      color: 'rgba(161,161,170,0.7)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(161,161,170,0.7)'}
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
                    }}
                  >
                    {submitting && <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />}
                    Submit Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}