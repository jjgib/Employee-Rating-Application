const mongoose = require('mongoose');

const periodSchema = mongoose.Schema({
    fromdate: Date,
    todate: Date,
    createdDateTime:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Ratingperiods', periodSchema);

