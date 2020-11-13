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

clubsOriginal = ["AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC"];
heartsOriginal = ["AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH"];
diamondsOriginal = ["AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];
spadesOriginal = ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS"];

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
                var clubs = clubsOriginal
                var hearts = heartsOriginal
                var diamonds = diamondsOriginal
                var spades = spadesOriginal
                var clubsCount = 13;
                var heartsCount = 13;
                var diamondsCount = 13;
                var spadesCount = 13;
                var user1 = 13
                var user2 = 13
                var user3 = 13
                var user4 = 13
                var cardSelector;
                var userSelector;
                while(clubsCount>0 || heartsCount>0 || diamondsCount>0 || spadesCount>0){
                    var suiteSelector = Math.floor(Math.random() * 4)
                    if (suiteSelector === 0 && clubsCount>0){
                        //clubs
                        cardSelector = Math.floor(Math.random() * clubsCount);
                        userSelector = Math.floor(Math.random() * 4);
                        console.log("clubs:"+clubsCount, "cardselector:"+cardSelector, "selectedcard"+clubs[cardSelector])
                        console.log(clubs)
                        if(userSelector === 0 && user1>0) {
                            clubsCount = clubsCount - 1;
                            room.user1.push(clubs[cardSelector])
                            clubs.splice(cardSelector, 1)
                            user1 = user1 - 1;
                        }else if(userSelector === 1 && user2>0){
                            clubsCount = clubsCount - 1;
                            room.user2.push(clubs[cardSelector])
                            clubs.splice(cardSelector, 1) 
                            user2 = user2 - 1;
                        }else if(userSelector === 2 && user3>0){
                            clubsCount = clubsCount - 1;
                            room.user3.push(clubs[cardSelector])
                            clubs.splice(cardSelector, 1)
                            user3 = user3 - 1;
                        }else if(userSelector === 3 && user4>0){
                            clubsCount = clubsCount - 1;
                            room.user4.push(clubs[cardSelector])
                            clubs.splice(cardSelector, 1)
                            user4 = user4 - 1;
                        }
                        console.log(clubsCount)
                    }else if(suiteSelector === 1 && heartsCount>0){
                        //hearts
                        cardSelector = Math.floor(Math.random() * heartsCount);
                        userSelector = Math.floor(Math.random() * 4);
                        console.log("hearts:"+heartsCount, "cardselector:"+cardSelector, "selectedcard"+hearts[cardSelector])
                        console.log(hearts)
                        if(userSelector === 0 && user1>0) {
                            heartsCount = heartsCount - 1;
                            room.user1.push(clubs[cardSelector])
                            hearts.splice(cardSelector, 1)
                            user1 = user1 - 1;
                        }else if(userSelector === 1 && user2>0){
                            heartsCount = heartsCount - 1;
                            room.user2.push(clubs[cardSelector])
                            hearts.splice(cardSelector, 1)
                            user2 = user2 - 1;
                        }else if(userSelector === 2 && user3>0){
                            heartsCount = heartsCount - 1;
                            room.user3.push(clubs[cardSelector])
                            hearts.splice(cardSelector, 1)
                            user3 = user3 - 1;
                        }else if(userSelector === 3 && user4>0){
                            heartsCount = heartsCount - 1;
                            room.user4.push(clubs[cardSelector])
                            hearts.splice(cardSelector, 1)
                            user4 = user4 - 1;
                        }
                        console.log(heartsCount)
                    }else if(suiteSelector === 2 && diamondsCount>0){
                        //diamonds
                        cardSelector = Math.floor(Math.random() * diamondsCount);
                        userSelector = Math.floor(Math.random() * 4);
                        console.log("diamonds:"+diamondsCount, "cardselector:"+cardSelector, "selectedcard"+diamonds[cardSelector])
                        console.log(diamonds)
                        if(userSelector === 0 && user1>0) {
                            diamondsCount = diamondsCount - 1
                            room.user1.push(clubs[cardSelector])
                            diamonds.splice(cardSelector, 1)
                            user1 = user1 - 1;
                        }else if(userSelector === 1 && user2>0){
                            diamondsCount = diamondsCount - 1
                            room.user2.push(clubs[cardSelector])
                            diamonds.splice(cardSelector, 1)
                            user2 = user2 - 1;
                        }else if(userSelector === 2 && user3>0){
                            diamondsCount = diamondsCount - 1
                            room.user3.push(clubs[cardSelector])
                            diamonds.splice(cardSelector, 1)
                            user3 = user3 - 1;
                        }else if(userSelector === 3 && user4>0){
                            diamondsCount = diamondsCount - 1
                            room.user4.push(clubs[cardSelector])
                            diamonds.splice(cardSelector, 1)
                            user4 = user4 - 1;
                        }
                        console.log(diamondsCount)
                    }else if(suiteSelector === 3 && spadesCount>0){
                        //spades
                        cardSelector = Math.floor(Math.random() * spadesCount);
                        userSelector = Math.floor(Math.random() * 4);
                        console.log("spades:"+spadesCount, "cardselector:"+cardSelector, "selectedcard"+spades[cardSelector])
                        console.log(spades)
                        if(userSelector === 0 && user1>0) {
                            spadesCount = spadesCount - 1
                            room.user1.push(clubs[cardSelector])
                            spades.splice(cardSelector, 1)
                            user1 = user1 - 1;
                        }else if(userSelector === 1 && user2>0){
                            spadesCount = spadesCount - 1
                            room.user2.push(clubs[cardSelector])
                            spades.splice(cardSelector, 1)
                            user2 = user2 - 1;
                        }else if(userSelector === 2 && user3>0){
                            spadesCount = spadesCount - 1
                            room.user3.push(clubs[cardSelector])
                            spades.splice(cardSelector, 1)
                            user3 = user3 - 1;
                        }else if(userSelector === 3 && user4>0){
                            spadesCount = spadesCount - 1
                            room.user4.push(clubs[cardSelector])
                            spades.splice(cardSelector, 1)
                            user4 = user4 - 1;
                        }
                        console.log(spadesCount)
                    }
                }
                // cb();
                // function cb(){
                //     if (i < 52){
                //         setTimeout(function(){cb()}, 10);
                //     }else{
                //         room.save();
                //     }
                // }
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