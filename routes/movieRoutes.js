const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const auth = require('../middleware/auth');

router.get('/movies', movieController.getAllMovies);
router.get('/movies/my', auth, movieController.getMyMovies);
router.get('/movies/:id', movieController.getMovieById);
router.post('/movie', auth, movieController.createMovie);
router.put('/movies/:id', auth, movieController.updateMovie);
router.delete('/movies/:id', auth, movieController.deleteMovie);

module.exports = router;