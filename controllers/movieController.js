const Movie = require('../models/Movie');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let bucket;
const conn = mongoose.connection;
conn.once('open', () => {
    bucket = new GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        console.error('Get all movies error:', error);
        res.status(500).json({ success: false, message: 'Error fetching movies' });
    }
};

exports.getMyMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, movies });
    } catch (error) {
        console.error('Get my movies error:', error);
        res.status(500).json({ success: false, message: 'Error fetching your movies' });
    }
};

exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.json({ success: true, movie });
    } catch (error) {
        console.error('Get movie by id error:', error);
        res.status(500).json({ success: false, message: 'Error fetching movie' });
    }
};

exports.createMovie = async (req, res) => {
    try {
        const { name, description } = req.body;
        const imageFile = req.files.image;

        // Read the raw binary data from the temp file
        const imageContent = fs.readFileSync(imageFile.tempFilePath);

        // Convert the raw binary data to base64
        const base64Image = `data:${imageFile.mimetype};base64,${imageContent.toString('base64')}`;

        const movie = new Movie({
            name,
            description,
            image: base64Image,
            userId: req.user._id,
            uid: uuidv4()
        });

        const savedMovie = await movie.save();
        res.status(201).json({
            success: true,
            movie: savedMovie
        });
    } catch (error) {
        console.error('Create movie error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating movie',
            error: error.message
        });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (description) updates.description = description;

        if (req.files?.image) {
            const imageFile = req.files.image;
            const imageContent = fs.readFileSync(imageFile.tempFilePath);
            updates.image = `data:${imageFile.mimetype};base64,${imageContent.toString('base64')}`;
        }

        const movie = await Movie.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Movie updated successfully',
            movie
        });
    } catch (error) {
        console.error('Update movie error:', error);
        res.status(500).json({ success: false, message: 'Error updating movie' });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found or unauthorized' });
        }

        res.json({
            success: true,
            message: 'Movie deleted successfully',
            movieId: req.params.id
        });
    } catch (error) {
        console.error('Delete movie error:', error);
        res.status(500).json({ success: false, message: 'Error deleting movie' });
    }
};
