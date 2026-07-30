require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const landingRoutes = require('./routes/landing');
const galleryRoutes = require('./routes/gallery');
const authRoutes = require('./routes/auth');
const dronesRoutes = require('./routes/drones');
const articlesRoutes = require('./routes/articles');
const inquiriesRoutes = require('./routes/inquiries');
const favoritesRoutes = require('./routes/favorites');
const testimonialsRoutes = require('./routes/testimonials');
const newsletterRoutes = require('./routes/newsletter');
const campaignLinksRoutes = require('./routes/campaign-links');
const activityRoutes = require('./routes/activity');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/landing', landingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/drones', dronesRoutes);
app.use('/api/drones/:droneId/testimonials', testimonialsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/campaign-links', campaignLinksRoutes);
app.use('/api/activity', activityRoutes);

// Public, top-level (not /api) so campaign links can be short: bravex-pivot.example/r/yt1
app.get('/r/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const linkResult = await pool.query('SELECT * FROM campaign_links WHERE slug = $1', [slug]);
    const link = linkResult.rows[0];

    if (!link) {
      return res.status(404).send('Link not found');
    }

    await pool.query(
      `INSERT INTO activity_events (event_type, target_type, target_id, referral_source)
       VALUES ('campaign_redirect', 'campaign_link', $1, $2)`,
      [link.id, slug]
    );

    const separator = link.destination_path.includes('?') ? '&' : '?';
    const destination = `${process.env.FRONTEND_URL}${link.destination_path}${separator}ref=${encodeURIComponent(slug)}`;

    res.redirect(302, destination);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to process redirect');
  }
});

app.get('/', (req, res) => {
  res.send('VTOL Campaign API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});