const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reviewController');

router.get('/movies/:movieId/reviews', ctrl.listByMovie);

router.post('/movies/:movieId/reviews', auth, ctrl.create);

router.put('/reviews/:id', auth, ctrl.update);
router.delete('/reviews/:id', auth, ctrl.remove);

module.exports = router;
