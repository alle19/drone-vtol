const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { drone_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (drone_id) {
      const droneResult = await pool.query('SELECT id FROM drones WHERE id = $1', [drone_id]);
      if (droneResult.rows.length === 0) {
        return res.status(404).json({ error: 'Drone not found' });
      }
    }

    const result = await pool.query(
      `INSERT INTO inquiries (user_id, drone_id, message, status)
       VALUES ($1, $2, $3, 'new') RETURNING *`,
      [req.user.id, drone_id ?? null, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC');
    } else {
      result = await pool.query('SELECT * FROM inquiries WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const inquiryResult = await pool.query('SELECT * FROM inquiries WHERE id = $1', [id]);
    const inquiry = inquiryResult.rows[0];

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not manage this inquiry' });
    }

    const { status } = req.body;
    if (!['new', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: "status must be 'new', 'contacted', or 'closed'" });
    }

    const result = await pool.query('UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

module.exports = router;
