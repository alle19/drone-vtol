const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const SORT_OPTIONS = {
  price_asc: 'price ASC',
  price_desc: 'price DESC',
  newest: 'created_at DESC',
};

router.get('/', async (req, res) => {
  try {
    const { category, firm_id, min_price, max_price, min_flight_time, min_range, sort } = req.query;

    const conditions = [];
    const values = [];

    if (category) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    if (firm_id) {
      values.push(firm_id);
      conditions.push(`firm_id = $${values.length}`);
    }
    if (min_price) {
      values.push(min_price);
      conditions.push(`price >= $${values.length}`);
    }
    if (max_price) {
      values.push(max_price);
      conditions.push(`price <= $${values.length}`);
    }
    if (min_flight_time) {
      values.push(min_flight_time);
      conditions.push(`flight_time_min >= $${values.length}`);
    }
    if (min_range) {
      values.push(min_range);
      conditions.push(`range_km >= $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const orderClause = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

    const result = await pool.query(`SELECT * FROM drones ${whereClause} ORDER BY ${orderClause}`, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drones' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const droneResult = await pool.query('SELECT * FROM drones WHERE id = $1', [id]);
    const drone = droneResult.rows[0];

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const ratingResult = await pool.query(
      `SELECT COUNT(*)::int AS review_count, COALESCE(AVG(rating), 0)::float AS average_rating
       FROM drone_reviews WHERE drone_id = $1`,
      [id]
    );

    res.json({ ...drone, ...ratingResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drone' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'firm_owner' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only a firm owner or admin can create a drone' });
    }

    const {
      name, slug, category, description, price,
      wingspan_mm, weight_kg, flight_time_min, range_km,
      max_speed_kmh, payload_kg, extra_specs, primary_image_url,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    let firmId;
    if (req.user.role === 'firm_owner') {
      firmId = req.user.firm_id;
    } else {
      firmId = req.body.firm_id;
      if (!firmId) {
        return res.status(400).json({ error: 'firm_id is required when creating a drone as admin' });
      }
    }

    const result = await pool.query(
      `INSERT INTO drones (firm_id, name, slug, category, description, price, wingspan_mm, weight_kg, flight_time_min, range_km, max_speed_kmh, payload_kg, extra_specs, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        firmId,
        name,
        slug,
        category ?? null,
        description ?? null,
        price ?? null,
        wingspan_mm ?? null,
        weight_kg ?? null,
        flight_time_min ?? null,
        range_km ?? null,
        max_speed_kmh ?? null,
        payload_kg ?? null,
        JSON.stringify(extra_specs ?? {}),
        primary_image_url ?? null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A drone with this slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create drone' });
  }
});

router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const droneResult = await pool.query('SELECT * FROM drones WHERE id = $1', [id]);
    const drone = droneResult.rows[0];

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.role === 'firm_owner' && req.user.firm_id === drone.firm_id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You do not manage this drone' });
    }

    const {
      name, category, description, price,
      wingspan_mm, weight_kg, flight_time_min, range_km,
      max_speed_kmh, payload_kg, extra_specs, primary_image_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE drones SET
        name = COALESCE($1, name),
        category = COALESCE($2, category),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        wingspan_mm = COALESCE($5, wingspan_mm),
        weight_kg = COALESCE($6, weight_kg),
        flight_time_min = COALESCE($7, flight_time_min),
        range_km = COALESCE($8, range_km),
        max_speed_kmh = COALESCE($9, max_speed_kmh),
        payload_kg = COALESCE($10, payload_kg),
        extra_specs = COALESCE($11, extra_specs),
        primary_image_url = COALESCE($12, primary_image_url)
       WHERE id = $13 RETURNING *`,
      [
        name ?? null,
        category ?? null,
        description ?? null,
        price ?? null,
        wingspan_mm ?? null,
        weight_kg ?? null,
        flight_time_min ?? null,
        range_km ?? null,
        max_speed_kmh ?? null,
        payload_kg ?? null,
        extra_specs != null ? JSON.stringify(extra_specs) : null,
        primary_image_url ?? null,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update drone' });
  }
});

module.exports = router;