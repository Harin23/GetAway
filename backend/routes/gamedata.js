const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const gamedataModel = require('../models/gamedata');
const middleware = require("./middleware")

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Gamedata route has connected to mongoDB')
    }
});

router.post('/shuffle', (req,res) => {
    roomName = req.body['room'];
    gamedataModel.findOne({ room: roomName}, (err, room) =>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            function shuffleCards(){
                return new Promise((resolve)=>{
                    let deck = 
                    ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS",
                    "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC",
                    "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
                    "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];
                    let hold, newPos;
                    for (var i=deck.length-1; i>0; i--){
                        hold = deck[i];
                        newPos = Math.floor(Math.random() * (i+1))
                        deck[i] = deck[newPos]
                        deck[newPos] = hold;
                    }
                    if(i === 0){
                        resolve({deck: deck})
                    }
                })
            }
            let shuffled = room.cardsShuffled;
            if (shuffled === false){
                //shuffle requestingUserCards
                shuffleCards().then((shuffledDeck) =>{
                    let turn = 0, index=0, deck = shuffledDeck.deck;
                    index = deck.indexOf("AS");
                    if(index>=0 && index<=12){
                        turn = 0;
                    }else if(index>=13 && index<=25){
                        turn = 1;
                    }else if(index>=26 && index<=38){
                        turn = 2;
                    }else if(index>=39 && index<=51){
                        turn = 3;
                    }
                    room.deck0 = deck.slice(0,13);
                    room.deck1 = deck.slice(13,26);
                    room.deck2 = deck.slice(26,39);
                    room.deck3 = deck.slice(39,52);
                    room.cardsShuffled = true;
                    room.currentRound = {thrower: "noONE", card: "blank"}
                    room.gamestarted = false;
                    room.gameover = false;
                    room.turn = turn;
                    room.stillPlaying = [0, 1, 2, 3];
                    room.save()
                    res.status(200).send("Cards Shuffled")
                })       
            }else{
                res.status(200).send("Cards already shuffled")
            }
        }
    })

})

router.post('/getgameinfo', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, middleware.getProccessedRoomInfo, (req,res) => {
    let roomReq = res.locals.roomInfo.room;
    let name = res.locals.name;
    let assignedDeckName = res.locals.assignedDeckName;
    let otherUsers = res.locals.otherUsers;
    //console.log(res.locals.userId)
    //console.log("line 125", otherUsers)
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let cardOnTable = gameRoom["cardOnTable"][0];
            let assignedDeck = gameRoom[assignedDeckName];
            //console.log("requesting user: ", name, "other users: ", otherUsers)
            let keys = [];
            keys = Object.keys(otherUsers);
            for(let i=0; i<keys.length; i++){
                let deckName = otherUsers[keys[i]];
                otherUsers[keys[i]] = gameRoom[deckName].length;
            }
            res.status(200).send({assignedDeck, cardOnTable, otherUsers, roomReq, name});
        }
    })
})

router.post('/throwcard', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, middleware.getProccessedRoomInfo, (req,res) => {

    function updateArray(someArray, removeIndex){
        let temp = someArray.slice(0,removeIndex);
        temp.push(...someArray.slice(removeIndex+1))
        return temp;
    }

    function getCardValue(card){
        let deckSorted = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
        return deckSorted.indexOf(card.slice(0, card.length-1));
    }

    function getCardSuit(card){
        return card.slice(card.length-1)
    }

    function updateCardsOnTable(cardsOnTable, cardThrown, turn){
        console.log(cardsOnTable)
        if(cardsOnTable.length+1<=4 && cardsOnTable[0].card !== "blank"){
            cardsOnTable.unshift({thrower: turn, card: cardThrown});
        }else if(cardsOnTable.length+1>4 || cardsOnTable[0].card === "blank"){
            cardsOnTable = [];
            cardsOnTable.push({thrower: turn, card: cardThrown})
        }
        console.log(cardsOnTable)
        return cardsOnTable;
    }

    function sortPlayersBasedOnCardThrown(cardsOnTable, stillPlaying){
        //ensure everything passed into this func is updated before calling this
        let sorted = cardsOnTable.slice(0)
        sorted.sort((a, b) =>{
            var valA = getCardValue(a.card);
            var valB = getCardValue(b.card);
            return valB - valA;
        });
        sorted = sorted.filter(item =>{
          console.log(stillPlaying.indexOf(item.thrower) !== -1)
            return stillPlaying.indexOf(item.thrower) !== -1
        });
        return sorted;
    }

    function updateStillPlaying(cardsLeft, stillPlaying, currTurnIndex){
        if(cardsLeft === 0){
            let playersLeft = updateArray(stillPlaying, currTurnIndex)
            if(playersLeft.length === 1){
                let gameover = true;
            }else{
                let gameover = false
            }
        }
        return [playersLeft, gameover]
    }

    function updateTurn(cardsOnTable, collectionOccured, stillPlaying, turn, cardsLeft){
        //ensure everything passed into this func is updated before calling this
        let tempTurn, currTurnIndex = stillPlaying.indexOf(turn);
        let update=[];
       if(collectionOccured === false && cardsOnTable.length < 4){
            //sequential turn
            if(currTurnIndex === stillPlaying.length-1){
                tempTurn = stillPlaying[0];
            }else{
                tempTurn = stillPlaying[currTurnIndex+1];
            };
            //update stillplaying after determining sequential turn
            update = updateStillPlaying(cardsLeft, stillPlaying, currTurnIndex);
        }else if(collectionOccured === false && cardsOnTable.length === 4){
            //highest card thrower as next turn
            //update stillplaying before updating turn to highest thrower, if current thrower is out of cards then dont include them.
            update = updateStillPlaying(cardsLeft, stillPlaying, currTurnIndex);
            tempTurn = sortPlayersBasedOnCardThrown(cardsOnTable, stillPlaying)[0].thrower;
        }else{
            //highest card thrower without the current thrower as next turn/collector
            let sorted = findTheHighestCardThrowerWithoutCurrentThrower(cardsOnTable, stillPlaying);
            tempTurn = sorted.filter(item => item.thrower !== turn)[0].thrower
            update = updateStillPlaying(cardsLeft, stillPlaying, currTurnIndex);
        }
        update.push(tempTurn);
        return update;
    }
    let roomReq = res.locals.roomInfo.room
    let cardThrown = req.body.card;
    let requestingUserIndex = res.locals.index;
    let assignedDeckName = res.locals.assignedDeckName;
    let name = res.locals.name;
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let turn = gameRoom["currTurn"];
            if(turn === requestingUserIndex){
                //throw card
                let cardsOnTable = gameRoom["cardOnTable"];
                let stillPlaying = gameRoom.stillPlaying;
                let stillPlayingIndex = stillPlaying.indexOf(turn);
                let requestingUserCards = gameRoom[assignedDeckName];
                let thrownCardIndex = requestingUserCards.indexOf(cardThrown);
                let suitOnTable = "";
            }else{
                res.status(400).send("Not your Turn")
            }
        }
    })
});

router.post('/gameover', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, (req,res) => {
    let roomReq = res.locals.roomInfo
    gamedataModel.findOne({ room: roomReq.room}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let gameover = gameRoom.gameover;
            if(gameover === true){
                let loserIndex=null;
                for(let i=0; i<4; i++){
                    let deck = "deck"+i;
                    if(gameRoom[deck].length>0){
                        loserIndex = i;
                        break;
                    }
                }
                if(loserIndex === null){
                    res.status(400).send("Unable to find loser")
                }else{
                    let loser = roomReq.users[loserIndex];
                    res.status(200).send({gameover: true, loser: loser});
                }
            }else{
                res.status(200).send({gameover: false, loser: null})
            }
        }
    })
})

module.exports = router