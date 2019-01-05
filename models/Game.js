const mongoose = require('mongoose');

var game = new mongoose.Schema({
    name: String,
    reward: Number
});

module.exports = mongoose.model("Game", game);