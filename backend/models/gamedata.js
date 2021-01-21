const mongoose = require('mongoose');
const gamedataSchema = new mongoose.Schema({
    room: String,
    cardsShuffled: Boolean,
    gameFinished: Boolean,
    deck0: [String],
    deck1: [String],
    deck2: [String],
    deck3: [String]
});
module.exports = mongoose.model('gamedata', gamedataSchema, 'gamedata');