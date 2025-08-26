const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const reviews = require('./reviews');
const movies = require('./movies');
const watchlist = require('./watchlist');
const social = require('./social');
const users = require('./users');

router.get('/', (_req, res) => { res.json({ message: 'Movies API' }); });
router.get('/health', (_req, res) => { res.json({ status: 'ok' }); });

router.use('/auth', authRoutes);
router.use('/', reviews);
router.use('/movies', movies);
router.use('/', watchlist);
router.use('/', social);
router.use('/users', users);

module.exports = router;
