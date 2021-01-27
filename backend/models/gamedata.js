const mongoose = require('mongoose');
const gamedataSchema = new mongoose.Schema({
    room: String,
    cardsShuffled: Boolean,
    gameFinished: Boolean,
    cardOnTable: [String],
    deck0: [String],
    deck1: [String],
    deck2: [String],
    deck3: [String],
    // deckAssignments:{deck0: String, deck1: String, deck2: String, deck3: String},
    turn: Number
});
module.exports = mongoose.model('gamedata', gamedataSchema, 'gamedata');