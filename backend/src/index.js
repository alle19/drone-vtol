require('dotenv').config();
const express = require('express');
const cors = require('cors');

const landingRoutes = require('./routes/landing');
const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/landing', landingRoutes);
app.use('/api/gallery', galleryRoutes);

app.get('/', (req, res) => {
  res.send('VTOL Campaign API is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});