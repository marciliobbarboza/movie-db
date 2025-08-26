const express = require('express');
const router = express.Router();
const users = require('./users');
const authRoutes = require('./auth');
const movies = require('./movies');
const reviews = require('./reviews');

router.get('/', (_req, res) => { res.json({ message: 'Movies API' }); });
router.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

router.use('/auth', authRoutes);
router.use('/users', users);
router.use('/', reviews);
router.use('/movies', movies);

module.exports = router;
