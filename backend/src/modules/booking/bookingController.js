const pool = require('./db');

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
    return res.json({ success: true, venues: rows });
  } catch (err) {
    console.error('[Booking] getVenues error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch venues.' });
  }
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
    return res.json({ success: true, slots: rows });
  } catch (err) {
    console.error('[Booking] getSlots error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch slots.' });
  }
}

/**
 * POST /api/booking/
 * Creates a new booking request.
 */
async function createBooking(req, res) {
  const { venue_id, event_name, event_date, start_time, end_time } = req.body;

  // Guard for authentication bypass safely
  const userId = req.user?.id || 999;
  const userRole = req.user?.role || 'STUDENT';
  const userName = req.user?.name || 'Arjun K.';

  // ── Input validation ──
  if (!venue_id || !event_name || !event_date || !start_time || !end_time) {
    return res.status(400).json({
      success: false,
      message: 'All fields required: venue_id, event_name, event_date, start_time, end_time.',
    });
  }

  if (fmtTime(start_time) >= fmtTime(end_time)) {
    return res.status(400).json({
      success: false,
      message: 'start_time must be before end_time.',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Diagnostic console tracking
    console.log('[DEBUG] Running validation checks for:', {
      venue_id,
      event_date,
      start_time: fmtTime(start_time),
      end_time: fmtTime(end_time)
    });

    // ── Row-level lock: Check for overlapping entries that are NOT REJECTED ──
    const { rows: conflicts } = await client.query(
      `SELECT id, start_time, end_time, event_name
         FROM bookings
        WHERE venue_id   = $1
          AND event_date = $2
          AND status    != 'REJECTED'
          AND start_time < $4::time
          AND end_time   > $3::time
        FOR UPDATE`,
      [venue_id, event_date, fmtTime(start_time), fmtTime(end_time)]
    );

    if (conflicts.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Time slot conflict — a pending or approved allocation occupies this window.',
        conflicts: conflicts.map((c) => ({
          id: c.id,
          time: `${c.start_time} – ${c.end_time}`,
          event: c.event_name,
        })),
      });
    }

    // ── No conflict → insert cleanly ──
    const { rows } = await client.query(
      `INSERT INTO bookings
              (venue_id, user_id, user_name, user_role, event_name, event_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8::time, 'PENDING')
       RETURNING *`,
      [venue_id, userId, userName, userRole, event_name, event_date, fmtTime(start_time), fmtTime(end_time)]
    );

    await client.query('COMMIT');
    return res.status(201).json({ success: true, booking: rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Booking ERROR] createBooking failed:', err.message, err.stack);

    if (err.code === '23P01') {
      return res.status(409).json({
        success: false,
        message: 'Booking conflict detected by database isolation constraint.',
      });
    }

    return res.status(500).json({ success: false, message: `Database error: ${err.message}` });
  } finally {
    client.release();
  }
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

  const client = await pool.connect();

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
    console.error('[Booking] updateBookingStatus error:', err.message);

    if (err.code === '23P01') {
      return res.status(409).json({
        success: false,
        message: 'Approval conflict detected by database constraint.',
      });
    }

    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  } finally {
    client.release();
  }
}

/**
 * GET /api/booking/my-bookings
 * Returns all bookings belonging to the authenticated user.
 */
async function getMyBookings(req, res) {
  const userId = req.user?.id || 999;
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
    return res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error('[Booking] getMyBookings error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch your bookings.' });
  }
}

/**
 * GET /api/booking/pending
 * Returns all PENDING bookings.
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
    return res.json({ success: true, bookings: rows });
  } catch (err) {
    console.error('[Booking] getPendingBookings error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending bookings.' });
  }
}

module.exports = {
  getVenues,
  getSlots,
  createBooking,
  updateBookingStatus,
  getMyBookings,
  getPendingBookings,
};