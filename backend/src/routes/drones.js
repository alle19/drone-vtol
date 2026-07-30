const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const SORT_OPTIONS = {
  newest: 'created_at DESC',
};

router.get('/', async (req, res) => {
  try {
    const { subcategory, min_flight_time, min_range, sort } = req.query;

    const conditions = [];
    const values = [];

    if (subcategory) {
      values.push(subcategory);
      conditions.push(`subcategory = $${values.length}`);
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

    res.json(drone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch drone' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can create a drone' });
    }

    const {
      name, slug, subcategory, description,
      wingspan_mm, weight_kg, flight_time_min, range_km,
      max_speed_kmh, payload_kg, extra_specs, primary_image_url,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    const result = await pool.query(
      `INSERT INTO drones (name, slug, subcategory, description, wingspan_mm, weight_kg, flight_time_min, range_km, max_speed_kmh, payload_kg, extra_specs, primary_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        name,
        slug,
        subcategory ?? null,
        description ?? null,
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only an admin can update a drone' });
    }

    const { id } = req.params;
    const droneResult = await pool.query('SELECT * FROM drones WHERE id = $1', [id]);
    const drone = droneResult.rows[0];

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const {
      name, subcategory, description,
      wingspan_mm, weight_kg, flight_time_min, range_km,
      max_speed_kmh, payload_kg, extra_specs, primary_image_url,
    } = req.body;

    const result = await pool.query(
      `UPDATE drones SET
        name = COALESCE($1, name),
        subcategory = COALESCE($2, subcategory),
        description = COALESCE($3, description),
        wingspan_mm = COALESCE($4, wingspan_mm),
        weight_kg = COALESCE($5, weight_kg),
        flight_time_min = COALESCE($6, flight_time_min),
        range_km = COALESCE($7, range_km),
        max_speed_kmh = COALESCE($8, max_speed_kmh),
        payload_kg = COALESCE($9, payload_kg),
        extra_specs = COALESCE($10, extra_specs),
        primary_image_url = COALESCE($11, primary_image_url)
       WHERE id = $12 RETURNING *`,
      [
        name ?? null,
        subcategory ?? null,
        description ?? null,
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
