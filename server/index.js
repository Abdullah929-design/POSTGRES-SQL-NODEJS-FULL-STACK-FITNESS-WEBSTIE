const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add your deployed frontend URL here after deployment
  // 'https://your-frontend.netlify.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // For now, allow all origins - tighten after deployment
    }
  },
  credentials: true,
}));
// Increase the JSON body limit so base64-encoded meal photos (used by the
// /meals/scan endpoint) can be uploaded. A 5MB photo becomes ~6.7MB as base64;
// 15mb leaves comfortable headroom while still guarding against abuse.
app.use(express.json({ limit: '15mb' }));

// Surface body-parsing failures (e.g. payload too large) as clean JSON
// instead of Express's default HTML error page.
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The uploaded image is too large. Please use a smaller photo.' });
  }
  if (err) {
    console.error('Request parsing error:', err.message);
    return res.status(400).json({ error: 'Invalid request body' });
  }
  next();
});

// Health check
app.get('/', (req, res) => {
  res.send('Fitness Tracker API 🚀');
});

// ============================================================
// Authentication routes (public)
// ============================================================
app.use('/auth', authRoutes);

// ============================================================
// Food Database Endpoints (public - shared reference data)
// ============================================================
app.get('/foods', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM food_items';
    let params = [];

    if (search) {
      query += ' WHERE name ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY name LIMIT 50';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ============================================================
// User Meals Endpoints (protected) — see server/routes/meals.js
// ============================================================
const mealRoutes = require('./routes/meals');
app.use('/meals', mealRoutes);

// ============================================================
// Nutrition Reports (protected)
// ============================================================
app.get('/reports/daily', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query;
    const reportDate = date || new Date().toISOString().split('T')[0];

    // Get daily totals
    const totalsRes = await pool.query(
      `SELECT
        SUM(calories) as total_calories,
        SUM(carbs) as total_carbs,
        SUM(protein) as total_protein,
        SUM(fat) as total_fat
       FROM user_meals
       WHERE user_id = $1 AND date = $2`,
      [userId, reportDate]
    );

    // Get goals
    const goalsRes = await pool.query('SELECT * FROM user_goals WHERE user_id = $1', [userId]);
    const goals = goalsRes.rows[0] || {};

    // Get meal breakdown
    const breakdownRes = await pool.query(
      `SELECT
        meal_type,
        SUM(calories) as calories,
        SUM(carbs) as carbs,
        SUM(protein) as protein,
        SUM(fat) as fat
       FROM user_meals
       WHERE user_id = $1 AND date = $2
       GROUP BY meal_type`,
      [userId, reportDate]
    );

    res.json({
      totals: totalsRes.rows[0] || {
        total_calories: 0,
        total_carbs: 0,
        total_protein: 0,
        total_fat: 0,
      },
      goals,
      breakdown: breakdownRes.rows,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ============================================================
// User Goals Endpoints (protected)
// ============================================================
app.get('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT * FROM user_goals WHERE user_id = $1', [userId]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { daily_calories, daily_carbs, daily_protein, daily_fat } = req.body;

    const result = await pool.query(
      `INSERT INTO user_goals
       (user_id, daily_calories, daily_carbs, daily_protein, daily_fat)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         daily_calories = EXCLUDED.daily_calories,
         daily_carbs = EXCLUDED.daily_carbs,
         daily_protein = EXCLUDED.daily_protein,
         daily_fat = EXCLUDED.daily_fat,
         updated_at = NOW()
       RETURNING *`,
      [userId, daily_calories, daily_carbs, daily_protein, daily_fat]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
