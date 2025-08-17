const express = require('express');
const router = express.Router();
const movie = require('../controllers/movieController');

router.get('/', movie.list);
router.get('/:id', movie.getOne);
router.post('/', movie.create);
router.put('/:id', movie.update);
router.delete('/:id', movie.remove);

module.exports = router;
