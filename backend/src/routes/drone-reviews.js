const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { droneId } = req.params;
    const result = await pool.query(
      `SELECT dr.*, u.name AS reviewer_name
       FROM drone_reviews dr
       JOIN users u ON dr.user_id = u.id
       WHERE dr.drone_id = $1
       ORDER BY dr.created_at DESC`,
      [droneId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { droneId } = req.params;
    const { rating, body } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating is required and must be between 1 and 5' });
    }

    const droneResult = await pool.query('SELECT id, firm_id FROM drones WHERE id = $1', [droneId]);
    const drone = droneResult.rows[0];

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    if (req.user.role === 'firm_owner' && req.user.firm_id === drone.firm_id) {
      return res.status(403).json({ error: "You cannot review your own firm's drone" });
    }

    const result = await pool.query(
      `INSERT INTO drone_reviews (drone_id, user_id, rating, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [droneId, req.user.id, rating, body ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You have already reviewed this drone' });
    }
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;