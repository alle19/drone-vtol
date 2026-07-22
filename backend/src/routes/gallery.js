// backend/src/routes/gallery.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/gallery?category=&drone_id=&firm_id=
router.get('/', async (req, res) => {
  try {
    const { category, drone_id, firm_id } = req.query;
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
    if (firm_id) {
      values.push(firm_id);
      conditions.push(`g.firm_id = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT g.*, d.name AS drone_name, f.name AS firm_name
       FROM gallery_items g
       LEFT JOIN drones d ON g.drone_id = d.id
       LEFT JOIN firms f ON g.firm_id = f.id
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

// GET /api/gallery/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT g.*, d.name AS drone_name, f.name AS firm_name
       FROM gallery_items g
       LEFT JOIN drones d ON g.drone_id = d.id
       LEFT JOIN firms f ON g.firm_id = f.id
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

// POST /api/gallery — admin/editor only
router.post('/', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { title, description, media_url, media_type, category, drone_id, firm_id } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({ error: 'title and media_url are required' });
    }

    const result = await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category, drone_id, firm_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description ?? null, media_url, media_type ?? null, category ?? null, drone_id ?? null, firm_id ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

module.exports = router;