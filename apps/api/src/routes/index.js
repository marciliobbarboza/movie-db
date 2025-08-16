const express = require('express');
const router = express.Router();
const users = require('./users');

router.get('/', (_req, res) => {
  res.json({ message: 'Movies API - inicial' });
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/users', users);

module.exports = router;
