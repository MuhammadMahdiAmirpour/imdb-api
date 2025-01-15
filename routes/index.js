const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.render('home', { movies });
});

module.exports = router;
