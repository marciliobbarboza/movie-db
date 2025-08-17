const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');

router.get('/', user.list);
router.get('/:id', user.getOne);
router.post('/', user.create);
router.put('/:id', user.update);
router.delete('/:id', user.remove);

module.exports = router;
