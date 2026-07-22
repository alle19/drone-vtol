const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { firm_id, drone_id, message } = req.body;

    if (!firm_id || !message) {
      return res.status(400).json({ error: 'firm_id and message are required' });
    }

    const firmResult = await pool.query('SELECT id FROM firms WHERE id = $1', [firm_id]);
    if (firmResult.rows.length === 0) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    if (drone_id) {
      const droneResult = await pool.query('SELECT id, firm_id FROM drones WHERE id = $1', [drone_id]);
      if (droneResult.rows.length === 0) {
        return res.status(404).json({ error: 'Drone not found' });
      }
      if (droneResult.rows[0].firm_id !== Number(firm_id)) {
        return res.status(400).json({ error: 'That drone does not belong to the specified firm' });
      }
    }

    const result = await pool.query(
      `INSERT INTO inquiries (user_id, firm_id, drone_id, message, status)
       VALUES ($1, $2, $3, $4, 'new') RETURNING *`,
      [req.user.id, firm_id, drone_id ?? null, message]
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
    } else if (req.user.role === 'firm_owner') {
      result = await pool.query('SELECT * FROM inquiries WHERE firm_id = $1 ORDER BY created_at DESC', [req.user.firm_id]);
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

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'firm_owner' && req.user.firm_id === inquiry.firm_id;

    if (!isAdmin && !isOwner) {
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