const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

router.post('/', optionalAuthenticate, async (req, res) => {
  try {
    const { anon_id, event_type, target_type, target_id, referral_source } = req.body;

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    const userId = req.user ? req.user.id : null;
    if (!userId && !anon_id) {
      return res.status(400).json({ error: 'anon_id is required for anonymous events' });
    }

    const result = await pool.query(
      `INSERT INTO activity_events (user_id, anon_id, event_type, target_type, target_id, referral_source)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, userId ? null : anon_id, event_type, target_type ?? null, target_id ?? null, referral_source ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [subscriberCount, topDrones, signupsByLink, inquiryVolume] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM newsletter_subscribers'),
      pool.query(
        `SELECT d.id, d.name, d.slug,
                COUNT(*) FILTER (WHERE ae.event_type = 'view')::int AS view_count,
                COUNT(*) FILTER (WHERE ae.event_type = 'favorite')::int AS favorite_count
         FROM activity_events ae
         JOIN drones d ON ae.target_type = 'drone' AND ae.target_id = d.id
         GROUP BY d.id, d.name, d.slug
         ORDER BY view_count DESC
         LIMIT 10`
      ),
      pool.query(
        `SELECT cl.id, cl.slug, cl.platform, COUNT(u.id)::int AS signup_count
         FROM campaign_links cl
         LEFT JOIN users u ON u.referral_source = cl.slug
         GROUP BY cl.id, cl.slug, cl.platform
         ORDER BY signup_count DESC`
      ),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM inquiries GROUP BY status`),
    ]);

    res.json({
      subscriber_count: subscriberCount.rows[0].count,
      top_drones: topDrones.rows,
      signups_by_campaign_link: signupsByLink.rows,
      inquiry_volume_by_status: inquiryVolume.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

module.exports = router;
