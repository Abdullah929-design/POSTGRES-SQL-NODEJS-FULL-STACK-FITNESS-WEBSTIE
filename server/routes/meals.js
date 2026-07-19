const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { analyzeFoodImage } = require('../services/gemini');

const router = express.Router();

// ============================================================
// User Meals Endpoints (protected)
// ============================================================
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    const query = `
      SELECT um.*, fi.name as food_name, fi.serving_size
      FROM user_meals um
      LEFT JOIN food_items fi ON um.food_id = fi.id
      WHERE um.user_id = $1 AND um.date = $2
      ORDER BY um.meal_type, um.created_at
    `;
    const result = await pool.query(query, [userId, date || new Date().toISOString().split('T')[0]]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { food_id, custom_name, servings, meal_type, date } = req.body;

    if (!meal_type) {
      return res.status(400).json({ error: 'meal_type is required' });
    }
    if (!food_id && !custom_name) {
      return res.status(400).json({ error: 'Either food_id or custom_name is required' });
    }

    const qty = servings || 1.0;

    // Resolve nutrition values.
    // 1) If a known food item is referenced, compute from food_items (existing behavior).
    // 2) Otherwise, if the caller supplied nutrition for a custom food (e.g. from the
    //    scanner flow), use those values directly. This keeps the stored shape identical
    //    while allowing custom foods to carry real nutrition data.
    let nutrition = {};
    if (food_id) {
      const foodRes = await pool.query('SELECT calories, carbs, protein, fat FROM food_items WHERE id = $1', [food_id]);
      if (foodRes.rows.length === 0) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      const food = foodRes.rows[0];
      nutrition = {
        calories: Math.round(food.calories * qty),
        carbs: parseFloat((food.carbs * qty).toFixed(1)),
        protein: parseFloat((food.protein * qty).toFixed(1)),
        fat: parseFloat((food.fat * qty).toFixed(1)),
      };
    } else if (
      custom_name &&
      (req.body.calories != null || req.body.carbs != null || req.body.protein != null || req.body.fat != null)
    ) {
      // Caller-provided, already-scaled nutrition (per-entry totals).
      nutrition = {
        calories: req.body.calories != null ? Math.round(Number(req.body.calories)) : null,
        carbs: req.body.carbs != null ? parseFloat(Number(req.body.carbs).toFixed(1)) : null,
        protein: req.body.protein != null ? parseFloat(Number(req.body.protein).toFixed(1)) : null,
        fat: req.body.fat != null ? parseFloat(Number(req.body.fat).toFixed(1)) : null,
      };
    }

    const result = await pool.query(
      `INSERT INTO user_meals
       (user_id, food_id, custom_name, servings, meal_type, date, calories, carbs, protein, fat)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        food_id || null,
        custom_name || null,
        qty,
        meal_type,
        date || new Date().toISOString().split('T')[0],
        nutrition.calories ?? null,
        nutrition.carbs ?? null,
        nutrition.protein ?? null,
        nutrition.fat ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { food_id, custom_name, servings, meal_type, date } = req.body;

    // Ensure the meal exists and belongs to this user
    const existingRes = await pool.query(
      'SELECT * FROM user_meals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    const existing = existingRes.rows[0];

    // Resolve final values (fall back to existing where not provided)
    const finalFoodId = food_id !== undefined ? food_id : existing.food_id;
    const finalCustomName = custom_name !== undefined ? custom_name : existing.custom_name;
    const finalServings = servings !== undefined ? servings : existing.servings;
    const finalMealType = meal_type !== undefined ? meal_type : existing.meal_type;
    const finalDate = date !== undefined ? date : existing.date;

    // Recalculate nutrition if a food item is referenced
    let nutrition = {
      calories: existing.calories,
      carbs: existing.carbs,
      protein: existing.protein,
      fat: existing.fat,
    };
    if (finalFoodId) {
      const foodRes = await pool.query(
        'SELECT calories, carbs, protein, fat FROM food_items WHERE id = $1',
        [finalFoodId]
      );
      if (foodRes.rows.length === 0) {
        return res.status(404).json({ error: 'Food item not found' });
      }
      const food = foodRes.rows[0];
      nutrition = {
        calories: Math.round(food.calories * finalServings),
        carbs: parseFloat((food.carbs * finalServings).toFixed(1)),
        protein: parseFloat((food.protein * finalServings).toFixed(1)),
        fat: parseFloat((food.fat * finalServings).toFixed(1)),
      };
    }

    const result = await pool.query(
      `UPDATE user_meals
       SET food_id = $1, custom_name = $2, servings = $3, meal_type = $4, date = $5,
           calories = $6, carbs = $7, protein = $8, fat = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [
        finalFoodId || null,
        finalCustomName || null,
        finalServings,
        finalMealType,
        finalDate,
        nutrition.calories,
        nutrition.carbs,
        nutrition.protein,
        nutrition.fat,
        id,
        userId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM user_meals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ============================================================
// Auto Meal Nutrient Scanner
// ============================================================
router.post('/scan', authenticateToken, async (req, res) => {
  try {
    const { image, mimeType } = req.body || {};

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'A meal image is required' });
    }
    // Basic guard: base64 should be reasonably large.
    if (image.length < 100) {
      return res.status(400).json({ error: 'Image data appears to be invalid' });
    }

    const result = await analyzeFoodImage(image, mimeType || 'image/jpeg');
    return res.json(result);
  } catch (err) {
    const message = err.message || 'Failed to analyze image';
    // Distinguish upstream/parse failures from client input issues.
    if (/not configured|timed out|reach Gemini|API error|parse nutrition|No food identified/.test(message)) {
      console.error('Scan error:', message);
      return res.status(502).json({ error: message });
    }
    console.error('Scan error:', message);
    return res.status(400).json({ error: message });
  }
});

module.exports = router;
