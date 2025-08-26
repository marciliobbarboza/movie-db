const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/watchlistController');

router.get('/users/me/watchlist', auth, ctrl.list);
router.post('/users/me/watchlist/:movieId', auth, ctrl.add);
router.delete('/users/me/watchlist/:movieId', auth, ctrl.remove);

module.exports = router;
