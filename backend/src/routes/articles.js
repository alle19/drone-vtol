// backend/src/routes/articles.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

// GET /api/articles — public, published only, filterable
router.get('/', async (req, res) => {
  try {
    const { category, related_drone_id, related_firm_id } = req.query;

    const conditions = [`status = 'published'`];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (related_drone_id) {
      values.push(related_drone_id);
      conditions.push(`related_drone_id = $${values.length}`);
    }
    if (related_firm_id) {
      values.push(related_firm_id);
      conditions.push(`related_firm_id = $${values.length}`);
    }

    const result = await pool.query(
      `SELECT * FROM articles WHERE ${conditions.join(' AND ')} ORDER BY published_at DESC`,
      values
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/all — editor/admin only, every article regardless of status
// NOTE: this must stay above the /:slug route below, or Express would treat "all" as a slug.
router.get('/all', authenticate, authorize('editor', 'admin'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slug — public if published; editor/admin can preview their drafts
router.get('/:slug', optionalAuthenticate, async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM articles WHERE slug = $1', [slug]);
    const article = result.rows[0];

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const isStaff = req.user && (req.user.role === 'editor' || req.user.role === 'admin');

    if (article.status !== 'published' && !isStaff) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles — editor/admin only
router.post('/', authenticate, authorize('editor', 'admin'), async (req, res) => {
  try {
    const { title, slug, body, category, featured_image_url, related_drone_id, related_firm_id, status } = req.body;

    if (!title || !slug || !body) {
      return res.status(400).json({ error: 'title, slug, and body are required' });
    }

    const finalStatus = status === 'published' ? 'published' : 'draft';
    const publishedAt = finalStatus === 'published' ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO articles (title, slug, body, author_id, category, status, featured_image_url, related_drone_id, related_firm_id, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        title,
        slug,
        body,
        req.user.id,
        category ?? null,
        finalStatus,
        featured_image_url ?? null,
        related_drone_id ?? null,
        related_firm_id ?? null,
        publishedAt,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'An article with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// PATCH /api/articles/:id — editor can edit only their own; admin can edit any
router.patch('/:id', authenticate, authorize('editor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const articleResult = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    const article = articleResult.rows[0];

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isAuthor = req.user.role === 'editor' && article.author_id === req.user.id;

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({ error: 'You can only edit your own articles' });
    }

    const { title, body, category, featured_image_url, related_drone_id, related_firm_id, status } = req.body;

    // Stamp published_at the moment status transitions into 'published' for the first time
    let publishedAt = article.published_at;
    if (status === 'published' && article.status !== 'published') {
      publishedAt = new Date();
    }

    const result = await pool.query(
      `UPDATE articles SET
        title = COALESCE($1, title),
        body = COALESCE($2, body),
        category = COALESCE($3, category),
        featured_image_url = COALESCE($4, featured_image_url),
        related_drone_id = COALESCE($5, related_drone_id),
        related_firm_id = COALESCE($6, related_firm_id),
        status = COALESCE($7, status),
        published_at = $8
       WHERE id = $9 RETURNING *`,
      [
        title ?? null,
        body ?? null,
        category ?? null,
        featured_image_url ?? null,
        related_drone_id ?? null,
        related_firm_id ?? null,
        status ?? null,
        publishedAt,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

module.exports = router;