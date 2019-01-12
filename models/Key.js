const mongoose = require('mongoose');
const uuid = require('uuid/v1');

const key = new mongoose.Schema({
    uuid: {type: String, default: uuid},
    //time: {type: Date, default: Date.now}, -- Not currently necessary as the time a key is created will be stored in the user object
    user: mongoose.ObjectId,
    game: mongoose.ObjectId
});

module.exports = mongoose.model("Key", key);
