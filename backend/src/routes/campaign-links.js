const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const PLATFORMS = ['youtube', 'facebook', 'instagram'];

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM campaign_links ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch campaign links' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { slug, platform, destination_path } = req.body;

    if (!slug || !platform || !destination_path) {
      return res.status(400).json({ error: 'slug, platform, and destination_path are required' });
    }
    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(', ')}` });
    }

    const result = await pool.query(
      `INSERT INTO campaign_links (slug, platform, destination_path)
       VALUES ($1, $2, $3) RETURNING *`,
      [slug, platform, destination_path]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A campaign link with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create campaign link' });
  }
});

router.patch('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, destination_path } = req.body;

    if (platform && !PLATFORMS.includes(platform)) {
      return res.status(400).json({ error: `platform must be one of: ${PLATFORMS.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE campaign_links SET
        platform = COALESCE($1, platform),
        destination_path = COALESCE($2, destination_path)
       WHERE id = $3 RETURNING *`,
      [platform ?? null, destination_path ?? null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign link not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update campaign link' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM campaign_links WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign link not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete campaign link' });
  }
});

module.exports = router;
