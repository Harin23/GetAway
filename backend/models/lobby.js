const mongoose = require('mongoose')

const lobbySchema = new mongoose.Schema({
    room: String
});
module.exports = mongoose.model('lobby', lobbySchema, 'room');