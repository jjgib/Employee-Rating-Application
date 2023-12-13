const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    employeeId: mongoose.Types.ObjectId,
    title: String,
    description: String,
    is_verified: String,
    createdDateTime:{ type: Date, default: Date.now }
});

module.exports = mongoose.model('Workreports', reportSchema);

