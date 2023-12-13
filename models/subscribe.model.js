const mongoose = require('mongoose');

const subscribeSchema = mongoose.Schema({
    status: String,
    createdDateTime:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscribe',subscribeSchema);