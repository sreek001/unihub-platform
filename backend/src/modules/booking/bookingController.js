const pool = require('./db');

const defaultVenues = [
  { id: 1, name: 'Main Seminar Hall', location: 'Block A — Ground Floor', capacity: 250, image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=500&q=80' },
  { id: 2, name: 'Department Seminar Hall', location: 'Block B — 2nd Floor', capacity: 120, image_url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=500&q=80' },
  { id: 3, name: 'Advanced IoT Lab', location: 'Block C — 3rd Floor', capacity: 40, image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80' },
  { id: 4, name: 'Open Auditorium', location: 'Central Campus Grounds', capacity: 500, image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80' },
  { id: 5, name: 'Mini Conference Room', location: 'Admin Block — Room 104', capacity: 20, image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80' }
];

let inMemoryBookings = [
  {
    id: 1,
    venue_id: 1,
    venue_name: 'Main Seminar Hall',
    user_id: 1,
    user_name: 'Arjun K.',
    user_role: 'STUDENT',
    event_name: 'Annual Tech Symposium',
    event_date: new Date().toISOString().slice(0, 10),
    start_time: '10:00:00',
    end_time: '12:00:00',
    status: 'APPROVED',
    created_at: new Date().toISOString()
  }
];
let nextBookingId = 2;

// Maps frontend grid strings directly to database TIME columns
const mapSlotToTimes = (slotString) => {
  const maps = {
    "08:00 to 09:00": { start: "08:00:00", end: "09:00:00" },
    "09:00 to 10:00": { start: "09:00:00", end: "10:00:00" },
    "10:00 to 11:00": { start: "10:00:00", end: "11:00:00" },
    "11:00 to 12:00": { start: "11:00:00", end: "12:00:00" },
    "12:00 to 13:00": { start: "12:00:00", end: "13:00:00" },
    "13:00 to 14:00": { start: "13:00:00", end: "14:00:00" },
    "14:00 to 15:00": { start: "14:00:00", end: "15:00:00" },
    "15:00 to 16:00": { start: "15:00:00", end: "16:00:00" },
    "16:00 to 17:00": { start: "16:00:00", end: "17:00:00" }
  };
  return maps[slotString] || { start: "08:00:00", end: "09:00:00" };
};

const fmtTime = (t) => {
  if (!t) return '00:00:00';
  return t.length === 5 ? `${t}:00` : t;
};

// GET /api/booking/venues
exports.getVenues = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM venues ORDER BY id ASC');
    if (result && result.rows && result.rows.length > 0) {
      const responsePayload = Object.assign([...result.rows], { success: true, venues: result.rows });
      return res.json(responsePayload);
    }
  } catch (err) {
    console.warn('[Booking] Falling back to default venues');
  }
  const fallbackPayload = Object.assign([...defaultVenues], { success: true, venues: defaultVenues });
  return res.json(fallbackPayload);
};

// GET /api/booking/availability
exports.getAvailability = async (req, res) => {
  const { venueId, date } = req.query;
  if (!venueId || !date) {
    return res.status(400).json({ error: 'venueId and date parameters are required.' });
  }

  try {
    const bookedSlotsQuery = await pool.query(
      `SELECT start_time, end_time, status FROM bookings 
             WHERE venue_id = $1 AND event_date = $2 AND status != 'REJECTED'`,
      [venueId, date]
    );

    const availabilityMap = {};
    if (bookedSlotsQuery && bookedSlotsQuery.rows) {
      bookedSlotsQuery.rows.forEach(row => {
        const startStr = (row.start_time || '').slice(0, 5);
        const endStr = (row.end_time || '').slice(0, 5);
        availabilityMap[`${startStr} to ${endStr}`] = row.status;
      });
    }
    return res.json(availabilityMap);
  } catch (err) {
    console.warn('[Booking] Using in-memory availability');
  }

  const availabilityMap = {};
  inMemoryBookings
    .filter(b => Number(b.venue_id) === Number(venueId) && b.event_date === date && b.status !== 'REJECTED')
    .forEach(row => {
      const startStr = row.start_time.slice(0, 5);
      const endStr = row.end_time.slice(0, 5);
      availabilityMap[`${startStr} to ${endStr}`] = row.status;
    });
  return res.json(availabilityMap);
};

// POST /api/booking/reserve
exports.reserveSlot = async (req, res) => {
  const { venue_id, date, time_slot, event_name, user_name, user_role } = req.body;
  if (!venue_id || !date || !event_name || !time_slot) {
    return res.status(400).json({ error: 'Missing core booking properties.' });
  }

  const { start, end } = mapSlotToTimes(time_slot);

  try {
    const insertResult = await pool.query(
      `INSERT INTO bookings (venue_id, user_id, user_name, user_role, event_name, event_date, start_time, end_time, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'APPROVED') RETURNING *`,
      [venue_id, 1, user_name || 'Sreehari K.', user_role || 'STUDENT', event_name, date, start, end]
    );
    if (insertResult && insertResult.rows && insertResult.rows[0]) {
      return res.status(201).json({ success: true, booking: insertResult.rows[0] });
    }
  } catch (err) {
    if (err.message && err.message.includes('no_approved_overlap')) {
      return res.status(409).json({ error: 'This venue slot is already secured.' });
    }
  }

  const newBooking = {
    id: nextBookingId++,
    venue_id: Number(venue_id),
    user_id: 1,
    user_name: user_name || 'Student User',
    user_role: user_role || 'STUDENT',
    event_name,
    event_date: date,
    start_time: start,
    end_time: end,
    status: 'APPROVED',
    created_at: new Date().toISOString()
  };
  inMemoryBookings.push(newBooking);
  return res.status(201).json({ success: true, booking: newBooking });
};

// Compatibility handlers
exports.getSlots = exports.getAvailability;
exports.createBooking = exports.reserveSlot;

exports.updateBookingStatus = async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const booking = inMemoryBookings.find(b => b.id === Number(bookingId));
  if (booking) {
    booking.status = status;
    return res.json({ success: true, booking });
  }
  return res.json({ success: true });
};

exports.getMyBookings = async (req, res) => {
  return res.json({ success: true, bookings: inMemoryBookings });
};

exports.getPendingBookings = async (req, res) => {
  const pending = inMemoryBookings.filter(b => b.status === 'PENDING');
  return res.json({ success: true, bookings: pending });
};