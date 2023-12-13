const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    Name: String,
    Email: String,
    Password: String,
});

module.exports = mongoose.model('User', UserSchema);

