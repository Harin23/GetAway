const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');
const gamedataModel = require('../models/gamedata');
const { concat } = require('rxjs');

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Gamedata route has connected to mongoDB')
    }
});

deck = 
["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS",
"AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC",
"AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
"AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];



router.post('/start', (req,res) => {
    roomName = req.body['room'];
    console.log(roomName)
    gamedataModel.findOne({ room: roomName}, (err, room) =>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            console.log("shuffling started")
            room.user1 = [];
            room.user2 = [];
            room.user3 = [];
            room.user4 = [];
            room.save();
            let shuffled = room.cardsShuffled;
            if (shuffled === false){
                //shuffle cards
                let hold, newPos;
                console.log(deck)
                for (var i=deck.length-1; i>0; i--){
                    hold = deck[i];
                    newPos = Math.floor(Math.random() * (i+1))
                    deck[i] = deck[newPos]
                    deck[newPos] = hold;
                    console.log(i)
                }
                cb();
                function cb(){
                    if (i>0 ){
                        setTimeout(function(){cb()}, 5);
                    }else{
                        room.user1 = deck.slice(0,13)
                        room.user2 = deck.slice(13,26)
                        room.user3 = deck.slice(26,39)
                        room.user4 = deck.slice(39,52)
                    }
                }
            }else{
                //check if the game is currently running 
                //by checking if a user has gotten rid of their cards
                //if not then update the user with the cards they got left.
                console.log("game already started")
            }
        }
    })

})

module.exports = router