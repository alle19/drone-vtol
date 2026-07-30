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
    const [
      subscriberCount,
      droneStats,
      referralFunnel,
      inquiryVolume,
      signupsPerDay,
      newsletterSubscribersPerDay,
      usersByRole,
      avgTimeToContact,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM newsletter_subscribers'),
      pool.query(
        `SELECT d.id, d.name, d.slug,
                (SELECT COUNT(*)::int FROM activity_events ae
                  WHERE ae.target_type = 'drone' AND ae.target_id = d.id AND ae.event_type = 'view') AS view_count,
                (SELECT COUNT(*)::int FROM favorites f
                  WHERE f.item_type = 'drone' AND f.item_id = d.id) AS favorite_count,
                (SELECT COUNT(*)::int FROM inquiries iq
                  WHERE iq.drone_id = d.id) AS inquiry_count
         FROM drones d
         ORDER BY view_count DESC`
      ),
      pool.query(
        `SELECT cl.id, cl.slug, cl.platform,
                (SELECT COUNT(*)::int FROM activity_events ae
                  WHERE ae.target_type = 'campaign_link' AND ae.target_id = cl.id) AS click_count,
                (SELECT COUNT(*)::int FROM users u
                  WHERE u.referral_source = cl.slug) AS signup_count,
                (SELECT COUNT(*)::int FROM inquiries iq JOIN users u ON u.id = iq.user_id
                  WHERE u.referral_source = cl.slug) AS inquiry_count
         FROM campaign_links cl
         ORDER BY click_count DESC`
      ),
      pool.query(`SELECT status, COUNT(*)::int AS count FROM inquiries GROUP BY status`),
      pool.query(
        `SELECT gs.day::date AS date, COUNT(u.id)::int AS count
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS gs(day)
         LEFT JOIN users u ON DATE_TRUNC('day', u.created_at) = gs.day
         GROUP BY gs.day
         ORDER BY gs.day`
      ),
      pool.query(
        `SELECT gs.day::date AS date, COUNT(n.id)::int AS count
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS gs(day)
         LEFT JOIN newsletter_subscribers n ON DATE_TRUNC('day', n.subscribed_at) = gs.day
         GROUP BY gs.day
         ORDER BY gs.day`
      ),
      pool.query(`SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`),
      pool.query(
        `SELECT EXTRACT(EPOCH FROM AVG(contacted_at - created_at))::float AS avg_seconds
         FROM inquiries
         WHERE contacted_at IS NOT NULL`
      ),
    ]);

    res.json({
      subscriber_count: subscriberCount.rows[0].count,
      drone_stats: droneStats.rows,
      referral_funnel: referralFunnel.rows,
      inquiry_volume_by_status: inquiryVolume.rows,
      signups_per_day: signupsPerDay.rows,
      newsletter_subscribers_per_day: newsletterSubscribersPerDay.rows,
      users_by_role: usersByRole.rows,
      avg_time_to_contact_seconds: avgTimeToContact.rows[0].avg_seconds,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
});

module.exports = router;
