const mongoose = require('mongoose');
const gamedataSchema = new mongoose.Schema({
    room: String,
    cardsShuffled: Boolean,
    deck0: [String],
    deck1: [String],
    deck2: [String],
    deck3: [String],
    deckAssignments: {deck0: String, deck1: String, deck2: String, deck3: String},
    currentRound: [{
        thrower: String,
        cardThrown: String
    }],
    stillPlaying:[Number],
    turn: Number,
    gameover: Boolean
});
module.exports = mongoose.model('gamedata', gamedataSchema, 'gamedata');