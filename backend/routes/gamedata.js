const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');
const gamedataModel = require('../models/gamedata');

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Gamedata route has connected to mongoDB')
    }
});

clubs = ["AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC"];
hearts = ["AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH"];
diamonds = ["AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];
spades = ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS"];

router.post('/start', (req,res) => {
    roomName = req.body;
    gamedataModel.findOne({ room: roomName}, (err, room) =>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            let shuffled = room.cardsShuffled;
            if (shuffled === false){
                console.log('shuffle the cards')
                //shuffle cards
                var cards1 = []
                var cards2 = []
                var cards3 = []
                var cards4 = []
                var clubsCount = 13;
                var heartsCount = 13;
                var diamondsCount = 13;
                var spadesCount = 13;
                var cardSelector;
                var userSelector;
                for(i=0; i<=52; i++){
                    var suiteSelector = Math.floor(Math.random() * 4)
                    console.log(suiteSelector)
                    switch (suiteSelector) {
                        case 0:
                            //clubs
                            cardSelector = Math.floor(Math.random() * clubsCount);
                            userSelector = Math.floor(Math.random() * 4);
                            switch (userSelector) {
                                case 0:
                                    cards1.push(clubs[cardSelector])
                                    break;
                                case 1:
                                    cards2.push(clubs[cardSelector])
                                    break;
                                case 2:
                                    cards3.push(clubs[cardSelector])
                                    break;
                                case 3:
                                    cards4.push(clubs[cardSelector])
                                    break;
                            }
                            clubs=clubs-1;
                            break;
                        case 1:
                            //hearts
                            cardSelector = Math.floor(Math.random() * heartsCount);
                            userSelector = Math.floor(Math.random() * 4);
                            switch (userSelector) {
                                case 0:
                                    cards1.push(hearts[cardSelector])
                                    break;
                                case 1:
                                    cards2.push(hearts[cardSelector])
                                    break;
                                case 2:
                                    cards3.push(hearts[cardSelector])
                                    break;
                                case 3:
                                    cards4.push(hearts[cardSelector])
                                    break;
                            }
                            hearts = hearts-1;
                            break;
                        case 2:
                            //diamonds
                            cardSelector = Math.floor(Math.random() * diamondsCount);
                            userSelector = Math.floor(Math.random() * 4);
                            switch (userSelector) {
                                case 0:
                                    cards1.push(diamonds[cardSelector])
                                    break;
                                case 1:
                                    cards2.push(diamonds[cardSelector])
                                    break;
                                case 2:
                                    cards3.push(diamonds[cardSelector])
                                    break;
                                case 3:
                                    cards4.push(diamonds[cardSelector])
                                    break;
                            }
                            diamonds=diamonds-1;
                            break;
                        case 3:
                            //spades
                            cardSelector = Math.floor(Math.random() * spadesCount);
                            userSelector = Math.floor(Math.random() * 4);
                            switch (userSelector) {
                                case 0:
                                    cards1.push(spades[cardSelector])
                                    break;
                                case 1:
                                    cards2.push(spades[cardSelector])
                                    break;
                                case 2:
                                    cards3.push(spades[cardSelector])
                                    break;
                                case 3:
                                    cards4.push(spades[cardSelector])
                                    break;
                            }
                            spades=spades-1;
                            break;
                    }
                }
            }else{
                //check if the game is currently running 
                //by checking if a user has gotten rid of their cards
                //if not then update the user with the cards they got left.
            }
        }
    })

})

module.exports = router