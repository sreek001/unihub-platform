const pool = require('./db');

// ─── In-Memory Fallback State ───
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

// ─── Helper: format time for consistent comparisons ───
function fmtTime(t) {
  // Accepts "HH:MM" or "HH:MM:SS" — always returns "HH:MM:SS"
  return t.length === 5 ? `${t}:00` : t;
}

/**
 * GET /api/booking/venues
 * Returns all campus venues.
 */
async function getVenues(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, location, capacity, image_url FROM venues ORDER BY id'
    );
    if (rows && rows.length > 0) {
      return res.json({ success: true, venues: rows });
    }
  } catch (err) {
    console.warn('[Booking] Using fallback venues (DB offline)');
  }
  return res.json({ success: true, venues: defaultVenues });
}

/**
 * GET /api/booking/venues/:venueId/slots?date=YYYY-MM-DD
 * Returns all bookings (APPROVED + PENDING) for a venue on a
 * specific date so the frontend can render an availability grid.
 */
async function getSlots(req, res) {
  const { venueId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Query parameter "date" is required (YYYY-MM-DD).' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, event_name, event_date, start_time, end_time,
              status, user_name, user_role, user_id
         FROM bookings
        WHERE venue_id = $1
          AND event_date = $2
          AND status IN ('APPROVED', 'PENDING')
        ORDER BY start_time`,
      [venueId, date]
    );
    if (rows) {
      return res.json({ success: true, slots: rows });
    }
  } catch (err) {
    console.warn('[Booking] Using fallback slots (DB offline)');
  }

  const slots = inMemoryBookings.filter(
    b => Number(b.venue_id) === Number(venueId) &&
         b.event_date === date &&
         ['APPROVED', 'PENDING'].includes(b.status)
  );
  return res.json({ success: true, slots });
}

/**
 * POST /api/booking/
 * Creates a new booking request.
 */
async function createBooking(req, res) {
  const { venue_id, event_name, event_date, start_time, end_time } = req.body;
  const user = req.user || { id: 1, role: 'STUDENT', name: 'Student User' };
  const { id: userId, role: userRole, name: userName } = user;

  // ── Input validation ──
  if (!venue_id || !event_name || !event_date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: 'All fields required: venue_id, event_name, event_date, start_time, end_time.',
    });
  }

  const sTime = fmtTime(start_time);
  const eTime = fmtTime(end_time);

  if (sTime >= eTime) {
    return res.status(400).json({
      success: false,
      message: 'start_time must be before end_time.',
    });
  }

  let client = null;
  try {
    client = await pool.connect();
  } catch (cErr) {
    client = null;
  }

  if (client) {
    try {
      await client.query('BEGIN');

      const { rows: conflicts } = await client.query(
        `SELECT id, start_time, end_time, event_name
           FROM bookings
          WHERE venue_id   = $1
            AND event_date = $2
            AND status     = 'APPROVED'
            AND start_time < $4::time
            AND end_time   > $3::time
          FOR UPDATE`,
        [venue_id, event_date, sTime, eTime]
      );

      if (conflicts.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          message: 'Time slot conflict — an approved booking already occupies this window.',
          conflicts: conflicts.map((c) => ({
            id: c.id,
            time: `${c.start_time} – ${c.end_time}`,
            event: c.event_name,
          })),
        });
      }

      const { rows } = await client.query(
        `INSERT INTO bookings
                (venue_id, user_id, user_name, user_role, event_name, event_date, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8::time, 'PENDING')
         RETURNING *`,
        [venue_id, userId, userName, userRole, event_name, event_date, sTime, eTime]
      );

      await client.query('COMMIT');
      return res.status(201).json({ success: true, booking: rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      console.warn('[Booking DB createBooking failed, switching to in-memory]:', err.message);
    } finally {
      client.release();
    }
  }

  // In-memory fallback
  const conflicts = inMemoryBookings.filter(
    b => Number(b.venue_id) === Number(venue_id) &&
         b.event_date === event_date &&
         b.status === 'APPROVED' &&
         fmtTime(b.start_time) < eTime &&
         fmtTime(b.end_time) > sTime
  );

  if (conflicts.length > 0) {
    return res.status(409).json({
      success: false,
      message: 'Time slot conflict — an approved booking already occupies this window.',
      conflicts: conflicts.map((c) => ({
        id: c.id,
        time: `${c.start_time} – ${c.end_time}`,
        event: c.event_name,
      })),
    });
  }

  const v = defaultVenues.find(ven => ven.id === Number(venue_id));
  const newBooking = {
    id: nextBookingId++,
    venue_id: Number(venue_id),
    venue_name: v ? v.name : 'Campus Venue',
    user_id: userId,
    user_name: userName,
    user_role: userRole,
    event_name,
    event_date,
    start_time: sTime,
    end_time: eTime,
    status: 'PENDING',
    created_at: new Date().toISOString()
  };
  inMemoryBookings.push(newBooking);

  return res.status(201).json({ success: true, booking: newBooking });
}

/**
 * PATCH /api/booking/:bookingId
 * Updates a booking's status to APPROVED or REJECTED.
 */
async function updateBookingStatus(req, res) {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be "APPROVED" or "REJECTED".',
    });
  }

  let client = null;
  try {
    client = await pool.connect();
  } catch (cErr) {
    client = null;
  }

  if (client) {
    try {
      await client.query('BEGIN');
      const { rows: bookingRows } = await client.query(
        'SELECT * FROM bookings WHERE id = $1 FOR UPDATE',
        [bookingId]
      );

      if (bookingRows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      const booking = bookingRows[0];
      if (booking.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Booking is already ${booking.status}. Only PENDING bookings can be updated.`,
        });
      }

      if (status === 'APPROVED') {
        const { rows: conflicts } = await client.query(
          `SELECT id, start_time, end_time, event_name
             FROM bookings
            WHERE venue_id   = $1
              AND event_date = $2
              AND status     = 'APPROVED'
              AND id        != $3
              AND start_time < $5::time
              AND end_time   > $4::time
            FOR UPDATE`,
          [booking.venue_id, booking.event_date, bookingId, booking.start_time, booking.end_time]
        );

        if (conflicts.length > 0) {
          await client.query('ROLLBACK');
          return res.status(409).json({
            success: false,
            message: 'Cannot approve — another booking already occupies this time window.',
            conflicts: conflicts.map((c) => ({
              id: c.id,
              time: `${c.start_time} – ${c.end_time}`,
              event: c.event_name,
            })),
          });
        }
      }

      const { rows: updated } = await client.query(
        `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *`,
        [status, bookingId]
      );
      await client.query('COMMIT');
      return res.json({ success: true, booking: updated[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      console.warn('[Booking DB updateBookingStatus failed, switching to in-memory]:', err.message);
    } finally {
      client.release();
    }
  }

  // In-memory fallback
  const booking = inMemoryBookings.find(b => b.id === Number(bookingId));
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  booking.status = status;
  return res.json({ success: true, booking });
}

/**
 * GET /api/booking/my-bookings
 * Returns all bookings belonging to the authenticated user.
 */
async function getMyBookings(req, res) {
  const userId = req.user ? req.user.id : 1;
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.event_name, b.event_date, b.start_time, b.end_time,
              b.status, b.created_at, v.name AS venue_name
         FROM bookings b
         JOIN venues v ON v.id = b.venue_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC`,
      [userId]
    );
    if (rows) {
      return res.json({ success: true, bookings: rows });
    }
  } catch (err) {
    console.warn('[Booking] Using fallback my-bookings (DB offline)');
  }

  const userBookings = inMemoryBookings.filter(b => b.user_id === userId);
  return res.json({ success: true, bookings: userBookings });
}

/**
 * GET /api/booking/pending
 * Returns all PENDING bookings (for FACULTY/ADMIN approval dashboard).
 */
async function getPendingBookings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT b.id, b.event_name, b.event_date, b.start_time, b.end_time,
              b.status, b.user_name, b.user_role, b.created_at,
              v.name AS venue_name
         FROM bookings b
         JOIN venues v ON v.id = b.venue_id
        WHERE b.status = 'PENDING'
        ORDER BY b.created_at ASC`
    );
    if (rows) {
      return res.json({ success: true, bookings: rows });
    }
  } catch (err) {
    console.warn('[Booking] Using fallback pending bookings (DB offline)');
  }

  const pending = inMemoryBookings.filter(b => b.status === 'PENDING');
  return res.json({ success: true, bookings: pending });
}

module.exports = {
  getVenues,
  getSlots,
  createBooking,
  updateBookingStatus,
  getMyBookings,
  getPendingBookings,
};
