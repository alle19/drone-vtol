// backend/src/routes/firms.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/firms
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM firms ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch firms' });
  }
});

// GET /api/firms/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM firms WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch firm' });
  }
});

// POST /api/firms
// A 'user' with no firm yet becomes firm_owner of the firm they create.
// An 'admin' can create a firm without being tied to it.
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, slug, description, logo_url, website_url, contact_email, contact_phone, location } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    if (req.user.role === 'firm_owner') {
      return res.status(409).json({ error: 'You already manage a firm' });
    }

    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not allowed to create a firm' });
    }

    const result = await pool.query(
      `INSERT INTO firms (name, slug, description, logo_url, website_url, contact_email, contact_phone, location, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false) RETURNING *`,
      [
        name,
        slug,
        description ?? null,
        logo_url ?? null,
        website_url ?? null,
        contact_email ?? null,
        contact_phone ?? null,
        location ?? null,
      ]
    );

    const firm = result.rows[0];

    if (req.user.role === 'user') {
      await pool.query(`UPDATE users SET role = 'firm_owner', firm_id = $1 WHERE id = $2`, [firm.id, req.user.id]);
    }

    res.status(201).json(firm);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A firm with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create firm' });
  }
});

// PATCH /api/firms/:id
// Only the firm's own firm_owner, or an admin, can update it.
// Only an admin can change `verified` — a firm cannot self-verify.
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const firmResult = await pool.query('SELECT * FROM firms WHERE id = $1', [id]);
    const firm = firmResult.rows[0];

    if (!firm) {
      return res.status(404).json({ error: 'Firm not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'firm_owner' && req.user.firm_id === firm.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You do not manage this firm' });
    }

    const { name, description, logo_url, website_url, contact_email, contact_phone, location, verified } = req.body;
    const updatedVerified = isAdmin && typeof verified === 'boolean' ? verified : firm.verified;

    const result = await pool.query(
      `UPDATE firms SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        logo_url = COALESCE($3, logo_url),
        website_url = COALESCE($4, website_url),
        contact_email = COALESCE($5, contact_email),
        contact_phone = COALESCE($6, contact_phone),
        location = COALESCE($7, location),
        verified = $8
       WHERE id = $9 RETURNING *`,
      [
        name ?? null,
        description ?? null,
        logo_url ?? null,
        website_url ?? null,
        contact_email ?? null,
        contact_phone ?? null,
        location ?? null,
        updatedVerified,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update firm' });
  }
});

module.exports = router;