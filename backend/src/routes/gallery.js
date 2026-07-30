const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, drone_id } = req.query;
    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`g.category = $${values.length}`);
    }
    if (drone_id) {
      values.push(drone_id);
      conditions.push(`g.drone_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT g.*, d.name AS drone_name
       FROM gallery_items g
       LEFT JOIN drones d ON g.drone_id = d.id
       ${whereClause}
       ORDER BY g.created_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT g.*, d.name AS drone_name
       FROM gallery_items g
       LEFT JOIN drones d ON g.drone_id = d.id
       WHERE g.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

router.post('/', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { title, description, media_url, media_type, category, drone_id } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({ error: 'title and media_url are required' });
    }

    const result = await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category, drone_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description ?? null, media_url, media_type ?? null, category ?? null, drone_id ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

module.exports = router;