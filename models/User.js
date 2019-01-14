const mongoose = require('mongoose');
const Utils = require('../utils');
var Schema = mongoose.Schema;

const user = new Schema({
    username: String,
    password: String,
    email: String,
    joined: {type: Date, default: Date.now},
    rank: {type: Number, default: 0},
    friends: [mongoose.ObjectId],
    requests: [mongoose.ObjectId],
    // used to store when they last created a key
    lastKey: {type: Date, default: undefined},
    coins: {type: Number, default: 0}
});

user.statics.validPassword = function(password) {
    return Utils.compareHash(password, this.password);
};

const User = mongoose.model("User", user);
module.exports = User;
