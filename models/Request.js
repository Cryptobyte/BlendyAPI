const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var request = new Schema({
    to: ObjectId,
    from: ObjectId,
    date: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Request", request);