const express = require('express');
const router = express.Router();
const content = require('../content');

router.get('/', (req, res) => {
  res.json(content);
});

module.exports = router;