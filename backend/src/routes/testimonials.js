const express = require('express');
const router = express.Router({ mergeParams: true });
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { droneId } = req.params;
    const result = await pool.query(
      `SELECT * FROM testimonials WHERE drone_id = $1 ORDER BY featured DESC, created_at DESC`,
      [droneId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

router.post('/', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { droneId } = req.params;
    const { agency_name, contact_title, quote, outcome, featured } = req.body;

    if (!agency_name || !quote) {
      return res.status(400).json({ error: 'agency_name and quote are required' });
    }

    const droneResult = await pool.query('SELECT id FROM drones WHERE id = $1', [droneId]);
    if (droneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const result = await pool.query(
      `INSERT INTO testimonials (drone_id, agency_name, contact_title, quote, outcome, featured)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [droneId, agency_name, contact_title ?? null, quote, outcome ?? null, featured ?? false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

router.patch('/:id', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const { agency_name, contact_title, quote, outcome, featured } = req.body;

    const result = await pool.query(
      `UPDATE testimonials SET
        agency_name = COALESCE($1, agency_name),
        contact_title = COALESCE($2, contact_title),
        quote = COALESCE($3, quote),
        outcome = COALESCE($4, outcome),
        featured = COALESCE($5, featured)
       WHERE id = $6 RETURNING *`,
      [
        agency_name ?? null,
        contact_title ?? null,
        quote ?? null,
        outcome ?? null,
        typeof featured === 'boolean' ? featured : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

router.delete('/:id', authenticate, authorize('admin', 'editor'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM testimonials WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

module.exports = router;
