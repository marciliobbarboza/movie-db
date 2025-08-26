// apps/api/src/routes/reviews.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const ctrl = require('../controllers/reviewController');

router.get('/movies/:movieId/reviews', ctrl.listByMovie);
router.post('/movies/:movieId/reviews', auth, ctrl.create);

router.post('/reviews/:id/like', auth, ctrl.likeReview);
router.delete('/reviews/:id/like', auth, ctrl.unlikeReview);

router.post('/reviews/:id/comments', auth, ctrl.addComment);
router.post('/reviews/:id/comments/:commentId/like', auth, ctrl.likeComment);
router.delete('/reviews/:id/comments/:commentId/like', auth, ctrl.unlikeComment);

router.post('/reviews/:id/comments/:commentId/replies', auth, ctrl.replyComment);
router.post('/reviews/:id/comments/:commentId/replies/:replyId/like', auth, ctrl.likeReply);
router.delete('/reviews/:id/comments/:commentId/replies/:replyId/like', auth, ctrl.unlikeReply);

router.post('/reviews/:id/follow-author', auth, ctrl.followAuthor);

module.exports = router;
