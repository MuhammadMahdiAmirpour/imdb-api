const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const movieSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uid: {
        type: String,
        default: uuidv4,
        unique: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Movie', movieSchema);
