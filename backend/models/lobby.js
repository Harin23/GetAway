const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    room: String,
    users: [String],
    status: Boolean
});
module.exports = mongoose.model('lobby', lobbySchema, 'lobby');