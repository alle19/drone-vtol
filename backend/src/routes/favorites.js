// backend/src/routes/favorites.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const TABLE_BY_TYPE = {
  drone: { table: 'drones', titleCol: 'name', imageCol: 'primary_image_url' },
  article: { table: 'articles', titleCol: 'title', imageCol: 'featured_image_url' },
  firm: { table: 'firms', titleCol: 'name', imageCol: 'logo_url' },
};

// POST /api/favorites — toggles a favorite on/off, returns the resulting state
router.post('/', authenticate, async (req, res) => {
  try {
    const { item_type, item_id } = req.body;

    if (!TABLE_BY_TYPE[item_type] || !item_id) {
      return res.status(400).json({ error: "item_type must be 'drone', 'article', or 'firm', and item_id is required" });
    }

    const { table } = TABLE_BY_TYPE[item_type];
    const itemExists = await pool.query(`SELECT id FROM ${table} WHERE id = $1`, [item_id]);
    if (itemExists.rows.length === 0) {
      return res.status(404).json({ error: `${item_type} not found` });
    }

    const existing = await pool.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3',
      [req.user.id, item_type, item_id]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE id = $1', [existing.rows[0].id]);
      return res.json({ favorited: false });
    }

    await pool.query('INSERT INTO favorites (user_id, item_type, item_id) VALUES ($1, $2, $3)', [req.user.id, item_type, item_id]);
    res.json({ favorited: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// GET /api/favorites — current user's favorites, enriched with title/image per item
router.get('/', authenticate, async (req, res) => {
  try {
    const favoritesResult = await pool.query('SELECT * FROM favorites WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const favorites = favoritesResult.rows;

    const idsByType = { drone: [], article: [], firm: [] };
    favorites.forEach((f) => idsByType[f.item_type].push(f.item_id));

    const detailMaps = {};
    for (const [type, { table, titleCol, imageCol }] of Object.entries(TABLE_BY_TYPE)) {
      const ids = idsByType[type];
      detailMaps[type] = {};
      if (ids.length > 0) {
        const result = await pool.query(
          `SELECT id, ${titleCol} AS title, ${imageCol} AS image_url FROM ${table} WHERE id = ANY($1)`,
          [ids]
        );
        result.rows.forEach((row) => {
          detailMaps[type][row.id] = row;
        });
      }
    }

    const enriched = favorites.map((f) => ({ ...f, item: detailMaps[f.item_type][f.item_id] || null }));
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

module.exports = router;