const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/userSocialController');

router.get('/users/me/following', auth, ctrl.followingList);
router.get('/users/public', ctrl.listUsers);
router.get('/users/:id/public', ctrl.getUser);
router.get('/users/:id/status', auth, ctrl.followStatus);
router.get('/users/:id/watchlist', ctrl.getUserWatchlist);
router.post('/users/:id/follow', auth, ctrl.follow);
router.delete('/users/:id/follow', auth, ctrl.unfollow);

module.exports = router;
