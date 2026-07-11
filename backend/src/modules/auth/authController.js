const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../../db');

const JWT_SECRET = process.env.JWT_SECRET || 'unihub_jwt_secret_change_me_in_prod';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign a JWT for a given user row.
 */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
async function register(req, res) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
  }

  // Only allow students to self-register; admin roles must be seeded.
  const allowedSelfRegisterRoles = ['student', 'faculty'];
  const userRole = allowedSelfRegisterRoles.includes(role) ? role : 'student';

  try {
    // Check for duplicate email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, userRole]
    );

    const newUser = result.rows[0];
    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const result = await query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
async function me(req, res) {
  // req.user is already decoded by verifyToken middleware
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('[Auth] Me error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login, me };
