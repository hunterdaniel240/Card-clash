'use strict';

const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    wins: {
        type: Number,
        default: 0,
    },
    losses: {
        type: Number,
        default: 0,
    },
    score: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
