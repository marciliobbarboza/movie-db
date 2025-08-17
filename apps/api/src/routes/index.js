const express = require('express');
const router = express.Router();
const users = require('./users');
const auth = require('./auth');
const movies = require('./movies');

router.get('/', (_req, res) => {
  res.json({ message: 'Movies API' });
});

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/movies', movies);

module.exports = router;
