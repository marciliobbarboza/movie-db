const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { list, getOne, create, update, remove, getMe, updateMe, getAvatar } = require('../controllers/userController');

router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/:id/avatar', getAvatar);

router.get('/', list);
router.get('/:id', getOne);
router.post('/', auth, create);
router.put('/:id', auth, update);
router.delete('/:id', auth, remove);

module.exports = router;
