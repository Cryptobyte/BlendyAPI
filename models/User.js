const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const user = new Schema({
    username: String,
    password: String,
    email: String,
    joined: {type: Date, default: Date.now},
    rank: {type: Number, default: 0},
    friends: [ObjectId],
    requests: [ObjectId],
    coins: {type: Number, default: 0}
});

module.exports = mongoose.model("User", user);