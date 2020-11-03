const mongoose = require('mongoose');
const gamedataSchema = new mongoose.Schema({
    lobbyName: String,
    
});
module.exports = mongoose.model('lobby', lobbySchema, 'lobby');