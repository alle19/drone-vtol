const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery_items';
    const params = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM gallery_items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gallery item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gallery item' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, media_url, media_type, category } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({ error: 'title and media_url are required' });
    }

    const result = await pool.query(
      `INSERT INTO gallery_items (title, description, media_url, media_type, category)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, media_url, media_type, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create gallery item' });
  }
});

module.exports = router;