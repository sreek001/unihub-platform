import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  CalendarDays,
  Loader2,
  Building2,
  Zap,
} from 'lucide-react';
import API_BASE_URL from '../../config/api';
import './BookingDashboard.css';

// ─── API Base ───
const API = `${API_BASE_URL}/api/booking`;

// ─── Demo user for development ───
const DEMO_USER = { id: 1, name: 'SreeK.', role: 'Admin' };

// ─── Fallback venues when backend is offline ───
const FALLBACK_VENUES = [
  { id: 1, name: 'Main Seminar Hall', location: 'Block A — Ground Floor', capacity: 250, type: 'Seminar Hall', status: 'Open' },
  { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor', capacity: 120, type: 'Seminar Hall', status: 'Open' },
  { id: 3, name: 'Advanced IoT Lab', location: 'Block C — 3rd Floor', capacity: 40, type: 'Lab', status: 'Open' },
  { id: 4, name: 'Open Auditorium', location: 'Central Campus Grounds', capacity: 500, type: 'Seminar Hall', status: 'Open' },
  { id: 5, name: 'Mini Conference Room', location: 'Admin Block — Room 104', capacity: 20, type: 'Project Space', status: 'Open' },
  { id: 6, name: 'Robotics Research Lab', location: 'Block D — 1st Floor', capacity: 30, type: 'Lab', status: 'Open' },
  { id: 7, name: 'Innovation Hub', location: 'Library Building — 4th', capacity: 60, type: 'Project Space', status: 'Maintenance' },
];

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

const TIME_SLOTS = [
  { label: '08:00 to 09:00', display: '08:00 AM – 09:00 AM' },
  { label: '09:00 to 10:00', display: '09:00 AM – 10:00 AM' },
  { label: '10:00 to 11:00', display: '10:00 AM – 11:00 AM' },
  { label: '11:00 to 12:00', display: '11:00 AM – 12:00 PM' },
  { label: '12:00 to 13:00', display: '12:00 PM – 01:00 PM' },
  { label: '13:00 to 14:00', display: '01:00 PM – 02:00 PM' },
  { label: '14:00 to 15:00', display: '02:00 PM – 03:00 PM' },
  { label: '15:00 to 16:00', display: '03:00 PM – 04:00 PM' },
  { label: '16:00 to 17:00', display: '04:00 PM – 05:00 PM' },
];

function getTypeBadgeClass(type) {
  if (!type) return 'seminar-hall';
  const t = type.toLowerCase();
  if (t.includes('lab')) return 'lab';
  if (t.includes('project')) return 'project-space';
  return 'seminar-hall';
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { scale: 0.94, y: 16, opacity: 0 },
  visible: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 220, damping: 24 },
  },
  exit: {
    scale: 0.94,
    y: 16,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

export default function BookingDashboard({ adminView = false }) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const user = authUser || DEMO_USER;
  const isFacultyAdmin = user.role === 'faculty' || adminView;

  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [availabilityMap, setAvailabilityMap] = useState({});
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    event_name: '',
    time_slot: TIME_SLOTS[0].label,
    user_name: user.name,
    user_role: user.role,
  });

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    if (selectedVenue) fetchAvailability();
  }, [selectedVenue, selectedDate]);

  async function fetchVenues() {
    setLoadingVenues(true);
    try {
      const res = await fetch(`${API}/venues`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setVenues(data);
        setSelectedVenue(data[0]);
      } else {
        setVenues(FALLBACK_VENUES);
        setSelectedVenue(FALLBACK_VENUES[0]);
      }
    } catch {
      setVenues(FALLBACK_VENUES);
      setSelectedVenue(FALLBACK_VENUES[0]);
    } finally {
      setLoadingVenues(false);
    }
  }

  async function fetchAvailability() {
    if (!selectedVenue) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/availability?venueId=${selectedVenue.id}&date=${selectedDate}`
      );
      const data = await res.json();
      if (data && typeof data === 'object' && !data.error) {
        setAvailabilityMap(data);
      } else {
        setAvailabilityMap({});
      }
    } catch {
      setAvailabilityMap({});
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleClickToSecure(slotLabel) {
    setForm({
      ...form,
      time_slot: slotLabel,
      event_name: '',
    });
    setIsModalOpen(true);
    setError(null);
  }

  async function handleSubmitBooking(e) {
    e.preventDefault();
    if (!selectedVenue || !form.event_name || !form.time_slot) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: selectedVenue.id,
          date: selectedDate,
          time_slot: form.time_slot,
          event_name: form.event_name,
          user_name: form.user_name,
          user_role: form.user_role,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError(data.error || 'This venue slot is already secured.');
      } else if (data.success) {
        setIsModalOpen(false);
        setForm({ ...form, event_name: '', time_slot: TIME_SLOTS[0].label });
        showToast('Slot secured successfully!');
        fetchAvailability();
      } else {
        setError(data.error || 'Failed to create booking.');
      }
    } catch {
      setError('Network error — could not reach the server.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-root">
      {/* ── Faculty Admin Banner (if faculty) ── */}
      {isFacultyAdmin && (
        <div id="faculty-admin-banner" className="faculty-banner">
          <div className="faculty-banner-icon">
            <CalendarDays style={{ width: 16, height: 16, color: '#fff' }} />
          </div>
          <div>
            <div className="faculty-banner-title">Faculty Venue Booking Admin</div>
            <div className="faculty-banner-sub">
              You have priority access to all campus venue slots. Reservations submitted here are flagged with Faculty priority.
            </div>
          </div>
          <div className="faculty-badge">FACULTY ACCESS</div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast-success"
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <CheckCircle style={{ width: 16, height: 16 }} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <header className="booking-header">
        <div>
          <h1 className="booking-title">
            <CalendarDays className="booking-title-icon" />
            Venue Booking
          </h1>
          <p className="booking-subtitle">
            Reserve seminar halls, labs, and project spaces — zero scheduling conflicts.
          </p>
        </div>

        {/* User Badge */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      </header>

      {/* ── Main Booking Layout ── */}
      <div className="booking-grid">
        {/* ── LEFT PANEL: CAMPUS FACILITIES ── */}
        <aside className="facilities-card">
          <div className="card-header">
            <h2 className="card-title">
              <Building2 style={{ width: 15, height: 15, color: '#1d4ed8' }} />
              Campus Facilities
            </h2>
          </div>

          <div className="venue-list">
            {loadingVenues ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 56, width: '100%' }} />
                ))}
              </>
            ) : (
              venues.map((venue) => {
                const isActive = selectedVenue?.id === venue.id;
                const isMaintenance = venue.status === 'Maintenance';
                return (
                  <button
                    key={venue.id}
                    onClick={() => !isMaintenance && setSelectedVenue(venue)}
                    className={`venue-card-btn ${isActive ? 'active' : ''} ${isMaintenance ? 'disabled' : ''}`}
                    disabled={isMaintenance}
                  >
                    <div className="venue-btn-top">
                      <span className="venue-name">{venue.name}</span>
                      <span className={`venue-type-badge ${getTypeBadgeClass(venue.type)}`}>
                        {venue.type || 'Seminar Hall'}
                      </span>
                    </div>

                    <div className="venue-btn-bottom">
                      <span className="venue-status">
                        <span className={`status-dot ${isMaintenance ? 'maintenance' : 'open'}`} />
                        {venue.status || 'Open'}
                      </span>
                      <span className="venue-divider">•</span>
                      <span className="venue-meta">
                        <MapPin style={{ width: 11, height: 11 }} />
                        {venue.location}
                      </span>
                      <span className="venue-capacity">
                        <Users style={{ width: 11, height: 11 }} />
                        {venue.capacity}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT PANEL: SELECTED VENUE & TIME SLOTS ── */}
        <main className="booking-main-panel">
          {/* Selected Venue Details Header Card */}
          <div className="venue-detail-card">
            <div className="venue-detail-main">
              <div className="venue-detail-info">
                <div className="venue-title-row">
                  <h2 className="venue-detail-name">
                    {selectedVenue?.name || 'Select a Venue'}
                  </h2>
                  {selectedVenue?.type && (
                    <span className={`venue-type-badge ${getTypeBadgeClass(selectedVenue.type)}`}>
                      {selectedVenue.type}
                    </span>
                  )}
                  {selectedVenue?.status && (
                    <span className="venue-status-chip">
                      <span className={`status-dot ${selectedVenue.status === 'Maintenance' ? 'maintenance' : 'open'}`} />
                      {selectedVenue.status}
                    </span>
                  )}
                </div>

                <div className="venue-detail-meta">
                  <span className="meta-item">
                    <MapPin style={{ width: 14, height: 14, color: '#1d4ed8' }} />
                    {selectedVenue?.location || 'Campus Center'}
                  </span>
                  <span className="meta-item">
                    <Users style={{ width: 14, height: 14, color: '#14b8a6' }} />
                    Capacity: {selectedVenue?.capacity || 0} seats
                  </span>
                </div>
              </div>

              {/* Action items: Date selector + Request slot button */}
              <div className="venue-detail-controls">
                <div className="date-picker-group">
                  <label htmlFor="target-date-input" className="date-label">
                    <Calendar style={{ width: 14, height: 14, color: '#1d4ed8' }} />
                    Date
                  </label>
                  <input
                    id="target-date-input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setForm({ ...form, event_name: '', time_slot: TIME_SLOTS[0].label });
                    setIsModalOpen(true);
                    setError(null);
                  }}
                  className="btn-request-slot"
                >
                  <Sparkles style={{ width: 14, height: 14 }} />
                  Request Slot
                </motion.button>
              </div>
            </div>
          </div>

          {/* Time Slots Availability Grid */}
          <div className="slots-section">
            <div className="slots-header">
              <div className="slots-header-title">
                <Clock style={{ width: 16, height: 16, color: '#1d4ed8' }} />
                <h3>Available Time Slots</h3>
              </div>
              <span className="live-badge">
                Live Grid
              </span>
            </div>

            {loadingSlots ? (
              <div className="slots-loading-grid">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />
                ))}
              </div>
            ) : (
              <motion.div
                key={`${selectedVenue?.id}-${selectedDate}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="time-slots-grid"
              >
                {TIME_SLOTS.map((slot) => {
                  const slotStatus = availabilityMap[slot.label] || null;
                  const isAvailable = !slotStatus;
                  const isApproved = slotStatus === 'APPROVED' || slotStatus === 'Open';
                  const isPending = slotStatus === 'PENDING';

                  return (
                    <motion.div
                      key={slot.label}
                      variants={itemVariants}
                      className={`slot-card ${isAvailable ? 'available' : ''} ${isApproved ? 'reserved' : ''} ${isPending ? 'pending' : ''}`}
                      onClick={isAvailable ? () => handleClickToSecure(slot.label) : undefined}
                    >
                      <div className="slot-card-header">
                        <span className="slot-time">{slot.display}</span>
                        {isAvailable && (
                          <span className="slot-status-pill status-open">
                            Available
                          </span>
                        )}
                        {isApproved && (
                          <span className="slot-status-pill status-reserved">
                            Reserved
                          </span>
                        )}
                        {isPending && (
                          <span className="slot-status-pill status-pending">
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="slot-card-action">
                        {isAvailable ? (
                          <button
                            className="btn-book-slot"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickToSecure(slot.label);
                            }}
                          >
                            <Zap style={{ width: 12, height: 12 }} />
                            Book Slot
                          </button>
                        ) : (
                          <span className="slot-taken-label">
                            {isApproved ? 'Occupied' : 'Under Review'}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* ── BOOKING REQUEST MODAL ── */}
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
              <div className="modal-header">
                <h3>Secure Venue Reservation</h3>
                <p>Submit your event details to confirm this time slot.</p>
              </div>

              <form onSubmit={handleSubmitBooking}>
                <div className="form-stack">
                  <div>
                    <label className="form-label">Venue</label>
                    <div className="form-read-only">{selectedVenue?.name || '—'}</div>
                  </div>

                  <div>
                    <label className="form-label">Target Date</label>
                    <div className="form-read-only">{selectedDate}</div>
                  </div>

                  <div>
                    <label className="form-label">Time Slot</label>
                    <select
                      value={form.time_slot}
                      onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
                      className="form-input"
                    >
                      {TIME_SLOTS.map((slot) => {
                        const taken = !!availabilityMap[slot.label];
                        return (
                          <option key={slot.label} value={slot.label} disabled={taken}>
                            {slot.display}{taken ? ' (Reserved)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Event / Activity Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Mini Project Evaluation & Review"
                      value={form.event_name}
                      onChange={(e) => setForm({ ...form, event_name: e.target.value })}
                      className="form-input"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="form-row-2col">
                    <div>
                      <label className="form-label">Requested By</label>
                      <input
                        type="text"
                        value={form.user_name}
                        onChange={(e) => setForm({ ...form, user_name: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Role</label>
                      <div className="form-read-only flex-align">
                        {user.role.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        {isFacultyAdmin && <span className="priority-badge">PRIORITY</span>}
                      </div>
                    </div>
                  </div>

                  {error && <div className="form-error-banner">{error}</div>}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setError(null); }}
                    className="btn-modal-cancel"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-modal-submit"
                  >
                    {submitting && <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />}
                    Confirm Reservation
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