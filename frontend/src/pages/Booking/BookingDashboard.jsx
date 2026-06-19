import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Users,
  Sparkles,
  CalendarDays,
  LayoutGrid,
  Loader2,
  Building2,
  Lock,
  AlertTriangle
} from 'lucide-react';
import './BookingDashboard.css';

// ─── API Endpoint Connection ───
const API = 'http://localhost:5000/api/booking';

function getLocalTodayString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}

function fmtTime(t) {
  // 🎯 THE ABSOLUTE SHIELD: Protect against missing or completely malformed database records
  if (!t || typeof t !== 'string' || !t.includes(':')) return '';

  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  if (isNaN(hour)) return '';

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function generateTimeGrid() {
  const slots = [];
  for (let h = 8; h < 20; h++) {
    slots.push({ start: `${String(h).padStart(2, '0')}:00`, end: `${String(h + 1).padStart(2, '0')}:00` });
  }
  return slots;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.97, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 160, damping: 20 } },
};

export default function BookingDashboard() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalTodayString());
  const [slots, setSlots] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('grid');
  const [error, setError] = useState(null);

  // Form State
  const [form, setForm] = useState({ venue_id: '', event_name: '', event_date: '', start_time: '09:00', end_time: '10:00' });

  useEffect(() => { fetchVenues(); }, []);
  useEffect(() => { if (selectedVenue) fetchSlots(); }, [selectedVenue, selectedDate]);

  async function fetchVenues() {
    setLoadingVenues(true);
    try {
      const res = await fetch(`${API}/venues`);
      const data = await res.json();
      if (data.success && data.venues && data.venues.length > 0) {
        setVenues(data.venues);
        setSelectedVenue(data.venues[0]);
      } else { throw new Error(); }
    } catch {
      const fallback = [
        { id: 1, name: 'Main Seminar Hall', location: 'Block A — Ground Floor', capacity: 250 },
        { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor', capacity: 120 },
        { id: 3, name: 'Advanced IoT Lab', location: 'Block C — 3rd Floor', capacity: 40 },
        { id: 4, name: 'Open Auditorium', location: 'Central Campus Grounds', capacity: 500 },
        { id: 5, name: 'Mini Conference Room', location: 'Admin Block — Room 104', capacity: 20 },
      ];
      setVenues(fallback);
      setSelectedVenue(fallback[0]);
    } finally { setLoadingVenues(false); }
  }

  async function fetchSlots() {
    if (!selectedVenue) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`${API}/venues/${selectedVenue.id}/slots?date=${selectedDate}`);
      const data = await res.json();
      if (data.success && data.slots) {
        setSlots(data.slots);
      } else {
        setSlots([]);
      }
    } catch { setSlots([]); }
    finally { setLoadingSlots(false); }
  }

  async function fetchMyBookings() {
    try {
      const res = await fetch(`${API}/my-bookings`);
      const data = await res.json();
      if (data.success && data.bookings) setMyBookings(data.bookings);
    } catch { setMyBookings([]); }
  }

  async function fetchPendingBookings() {
    try {
      const res = await fetch(`${API}/pending`);
      const data = await res.json();
      if (data.success && data.bookings) setPendingBookings(data.bookings);
    } catch { setPendingBookings([]); }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === 'my') fetchMyBookings();
    if (tab === 'admin') fetchPendingBookings();
  }

  async function handleSubmitBooking(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venue_id: parseInt(form.venue_id, 10),
          event_name: form.event_name,
          event_date: form.event_date,
          start_time: form.start_time,
          end_time: form.end_time,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchSlots();
      } else {
        setError(data.message || 'Slot collision or validation check failed.');
      }
    } catch {
      setError('Connection configuration fault or missing server endpoint definition.');
    } finally {
      setSubmitting(false);
    }
  }

  function openRequestModal(start = '09:00', end = '10:00') {
    setError(null);
    setForm({
      venue_id: selectedVenue?.id || '1',
      event_name: '',
      event_date: selectedDate,
      start_time: start,
      end_time: end
    });
    setIsModalOpen(true);
  }

  return (
    <div className="booking-root">

      {/* Header */}
      <div className="header-container">
        <div>
          <h1 className="main-title">
            <Calendar className="title-icon" /> Venue Coordinator
          </h1>
          <p className="sub-title">Reserve seminar halls and project spaces — zero scheduling conflicts.</p>
        </div>
        <div className="profile-badge">
          <div className="profile-avatar">A</div>
          <div>
            <div className="profile-name">Arjun K.</div>
            <div className="profile-role">ADMIN</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        {[
          { id: 'grid', label: 'Availability Grid', icon: LayoutGrid },
          { id: 'my', label: 'My Bookings', icon: CalendarDays },
          { id: 'admin', label: 'Pending Approvals', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}>
              <Icon className="tab-icon-svg" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content views */}
      <AnimatePresence mode="wait">
        {activeTab === 'grid' && (
          <div className="booking-grid-layout">

            {/* Sidebar Controls */}
            <div className="sidebar-card">
              <h3 className="sidebar-heading"><Building2 className="inline-icon" /> Select Venue</h3>
              <div className="venue-list">
                {loadingVenues ? <div className="loader-text">Loading campus facilities...</div> : (
                  (venues || []).map((v) => (
                    <button key={v?.id} onClick={() => setSelectedVenue(v)} className={`venue-item-btn ${selectedVenue?.id === v?.id ? 'active' : ''}`}>
                      <div className="venue-item-title">{v?.name || 'Unnamed Space'}</div>
                      <div className="venue-item-meta">
                        <span><MapPin className="w-3 h-3" /> {v?.location || 'Unknown Block'}</span>
                        <span><Users className="w-3 h-3" /> {v?.capacity || 0}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="input-group">
                <label className="field-label">Target Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-picker-input" />
              </div>

              <button onClick={() => openRequestModal()} className="action-btn-primary">
                <Sparkles className="w-4 h-4" /> Custom Request Slot
              </button>
            </div>

            {/* Matrix Board */}
            <div className="matrix-board">
              <div className="matrix-header">
                <h2>{selectedVenue?.name || 'Select a Venue'} <span className="date-stamp">/ {selectedDate}</span></h2>
                <div className="live-badge-glow">Live Matrix</div>
              </div>

              {loadingSlots ? <div className="loader-text">Mapping spatial allocations...</div> : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="time-cards-grid">
                  {generateTimeGrid().map((tg) => {
                    const match = (slots || []).find(s => {
                      if (!s?.start_time || !s?.end_time) return false;
                      return s.start_time.slice(0, 5) < tg.end && s.end_time.slice(0, 5) > tg.start;
                    });
                    const isAvailable = !match;

                    return (
                      <motion.div
                        key={tg.start}
                        variants={itemVariants}
                        onClick={() => isAvailable && openRequestModal(tg.start, tg.end)}
                        className={`matrix-tile ${isAvailable ? 'available' : `occupied ${(match?.status || 'approved').toLowerCase()}`}`}
                      >
                        <div className="tile-top">
                          <Clock className="w-4 h-4 text-purple-400/50" />
                          <span className={`status-tag ${isAvailable ? 'tag-open' : 'tag-locked'}`}>
                            {isAvailable ? 'Open' : (match?.status || 'APPROVED')}
                          </span>
                        </div>
                        <div className="tile-time">{fmtTime(tg.start)}</div>
                        <div className="tile-end-time">to {fmtTime(tg.end)}</div>

                        {!isAvailable ? (
                          <div className="tile-event-desc">
                            <Lock className="w-2.5 h-2.5 inline mr-1" />
                            {match?.event_name || 'Reserved'}
                            {match?.user_name && (
                              <span style={{ color: 'rgba(113, 113, 122, 0.5)', marginLeft: '4px' }}>
                                by {match.user_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="tile-action-prompt">Click to secure <ArrowRight className="w-3 h-3 ml-auto" /></div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>

          </div>
        )}

        {/* Tab My Bookings */}
        {activeTab === 'my' && (
          <div className="history-card">
            <h3 className="section-title">Your Allocation Logs</h3>
            {(!myBookings || myBookings.length === 0) ? <p className="empty-msg">No current history discovered.</p> : (
              myBookings.map(b => (
                <div key={b?.id || Math.random()} className="history-row">
                  <div><strong>{b?.event_name || 'Event'}</strong> - {b?.venue_name || 'Venue'}</div>
                  <div className="status-pill">{b?.status || 'PENDING'}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Admin Management */}
        {activeTab === 'admin' && (
          <div className="history-card">
            <h3 className="section-title text-purple-400">Administrative Actions</h3>
            {(!pendingBookings || pendingBookings.length === 0) ? <p className="empty-msg">Approval queue is currently clear.</p> : (
              pendingBookings.map(b => (
                <div key={b?.id || Math.random()} className="history-row">
                  <div>
                    <strong>{b?.event_name || 'Event Request'}</strong>
                    <span style={{ color: '#71717a', fontSize: '12px' }}>
                      {b?.user_name ? ` by ${b.user_name}` : ''} {b?.user_role ? `(${b.user_role})` : ''}
                    </span>
                    <div style={{ color: '#4b4b63', fontSize: '11px', marginTop: '2px' }}>
                      {b?.venue_name || 'Unknown Venue'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="small-approve-btn">Approve</button>
                    <button className="small-reject-btn">Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Modal View Request Formulation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay-bg" onClick={() => setIsModalOpen(false)}>
            <div className="modal-box-window" onClick={(e) => e.stopPropagation()}>
              <h3>Request a Slot Allocation</h3>
              <p className="modal-subtext">Your request passes directly to administrative review pipelines.</p>

              <form onSubmit={handleSubmitBooking}>
                <div className="form-fields-container">

                  {/* Venue selection list */}
                  <div>
                    <label className="field-label">Venue Target</label>
                    <select value={form.venue_id} onChange={(e) => setForm({ ...form, venue_id: e.target.value })} className="modal-select-field">
                      {(venues || []).map(v => <option key={v?.id} value={v?.id}>{v?.name || 'Facility'}</option>)}
                    </select>
                  </div>

                  {/* Selected Date input element */}
                  <div>
                    <label className="field-label">Selected Date</label>
                    <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="modal-input-field" required />
                  </div>

                  <div>
                    <label className="field-label">Event/Campaign Name</label>
                    <input type="text" placeholder="e.g., Association Meeting" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} className="modal-input-field" required />
                  </div>

                  <div className="grid-half-split">
                    <div>
                      <label className="field-label">Start Time</label>
                      <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="modal-input-field" required />
                    </div>
                    <div>
                      <label className="field-label">End Time</label>
                      <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="modal-input-field" required />
                    </div>
                  </div>

                  {error && (
                    <div className="error-alert-box">
                      <AlertTriangle className="w-4 h-4 text-rose-400" /> {error}
                    </div>
                  )}
                </div>

                <div className="modal-actions-footer">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-text-btn">Cancel</button>
                  <button type="submit" disabled={submitting} className="submit-action-btn">
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}