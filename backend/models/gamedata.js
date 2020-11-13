const mongoose = require('mongoose');
const gamedataSchema = new mongoose.Schema({
    room: String,
    cardsShuffled: Boolean,
    user1: [String],
    user2: [String],
    user3: [String],
    user4: [String]
});
module.exports = mongoose.model('gamedata', gamedataSchema, 'gamedata');