require('dotenv').config();
const express = require('express');
const cors = require('cors');

const landingRoutes = require('./routes/landing');
const galleryRoutes = require('./routes/gallery');
const authRoutes = require('./routes/auth');
const firmsRoutes = require('./routes/firms');
const dronesRoutes = require('./routes/drones');
const articlesRoutes = require('./routes/articles');
const inquiriesRoutes = require('./routes/inquiries');
const favoritesRoutes = require('./routes/favorites');
const droneReviewsRoutes = require('./routes/drone-reviews');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/landing', landingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/firms', firmsRoutes);
app.use('/api/drones', dronesRoutes);
app.use('/api/drones/:droneId/reviews', droneReviewsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/favorites', favoritesRoutes);

app.get('/', (req, res) => {
  res.send('VTOL Campaign API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});