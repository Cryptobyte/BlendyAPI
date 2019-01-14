const mongoose = require('mongoose');
const uuid = require('uuid/v1');

const emailKey = new mongoose.Schema({
    key: {type: String, default: uuid},
    user: ObjectId
});

EmailKey = mongoose.model('EmailKey', emailKey);
module.exports = EmailKey;