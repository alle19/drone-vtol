const express = require('express');
const router = express.Router();
const pool = require('../db');
const { optionalAuthenticate } = require('../middleware/auth');

router.post('/subscribe', optionalAuthenticate, async (req, res) => {
  try {
    const { email, referral_source } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email, referral_source, user_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING *`,
      [email, referral_source ?? null, req.user ? req.user.id : null]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({ error: 'This email is already subscribed' });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

module.exports = router;
