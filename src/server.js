const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const { fetchUserMovies } = require('../controllers/movieController');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userRoutes = require('../routes/userRoutes');
const movieRoutes = require('../routes/movieRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// File upload configuration
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 },
    parseNested: true,
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware setup
app.use('/js', express.static(path.join(__dirname, '../public/js'), {
    setHeaders: (res, path) => {
        res.setHeader('Content-Type', 'application/javascript');
    }
}));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home route with user movies
app.get('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const movies = await fetchUserMovies(decoded.userId);
            return res.render('home', {
                movies,
                isAuthenticated: true
            });
        }
        res.render('home', {
            movies: [],
            isAuthenticated: false
        });
    } catch (error) {
        console.error('Error:', error);
        res.render('home', {
            movies: [],
            isAuthenticated: false
        });
    }
});

// Routes
app.use('/api', userRoutes);
app.use('/api', movieRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/imdb-api';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = app;
