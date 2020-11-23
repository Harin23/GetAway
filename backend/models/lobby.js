const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    room: String,
    users: [String],
    totalUsers: Number,
    roomLeader: String
});
module.exports = mongoose.model('lobby', lobbySchema, 'lobby');