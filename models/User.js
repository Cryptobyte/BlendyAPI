const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const user = new Schema({
    username: String,
    password: String,
    email: String,
    joined: {type: Date, default: Date.now},
    rank: Number,
    friends: [ObjectId],
    requests: [ObjectId],
    coins: Number
});

module.exports = mongoose.model("User", user);