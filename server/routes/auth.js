const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// Default nutrition goals seeded for every new user
const DEFAULT_GOALS = {
  daily_calories: 2000,
  daily_carbs: 250,
  daily_protein: 150,
  daily_fat: 65,
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/**
 * POST /auth/signup
 * Body: { email, password }
 * Creates the user, seeds default goals, returns { token, user }.
 */
router.post('/signup', async (req, res) => {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error('DB connection error:', err.message);
    return res.status(500).json({ error: 'Database unavailable' });
  }
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    // --- validation ---
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // --- uniqueness check ---
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // --- create user + default goals atomically ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await client.query('BEGIN');

    const insertUser = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    const user = insertUser.rows[0];

    await client.query(
      `INSERT INTO user_goals (user_id, daily_calories, daily_carbs, daily_protein, daily_fat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        user.id,
        DEFAULT_GOALS.daily_calories,
        DEFAULT_GOALS.daily_carbs,
        DEFAULT_GOALS.daily_protein,
        DEFAULT_GOALS.daily_fat,
      ]
    );

    await client.query('COMMIT');

    const token = signToken(user);
    return res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    // Unique violation fallback (race condition)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: 'Server error during signup' });
  } finally {
    client.release();
  }
});

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns { token, user }.
 */
router.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, password FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Use a generic message so we don't reveal whether the email exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * GET /auth/me
 * Returns the authenticated user's profile.
 * Used by the frontend to validate a stored token on app load.
 */
const { authenticateToken } = require('../middleware/auth');
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
