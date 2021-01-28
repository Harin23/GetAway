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
            let deck = 
            ["AS", "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS",
            "AC", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC",
            "AH", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH",
            "AD", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD"];
            room.deck0 = [];
            room.deck1 = [];
            room.deck2 = [];
            room.deck3 = [];
            room.stillPlaying = [0, 1, 2, 3];
            room.save();
            let shuffled = room.cardsShuffled;
            if (shuffled === false){
                //shuffle requestingUserCards
                let hold, newPos;
                for (var i=deck.length-1; i>0; i--){
                    hold = deck[i];
                    newPos = Math.floor(Math.random() * (i+1))
                    deck[i] = deck[newPos]
                    deck[newPos] = hold;
                }
                cb();
                function cb(){
                    if (i>0 ){
                        setTimeout(function(){cb()}, 5);
                    }else{
                        let turn = 0, index=0;
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
                        room.turn = turn;
                        res.status(200).send("Cards Shuffled")
                    }
                }
            }else{
                console.log("game already started")
                res.status(200).send("requestingUserCards already shuffled")
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
    let roomReq = res.locals.roomInfo.room
    let cardThrown = req.body.card;
    let requestingUserIndex = res.locals.index;
    let assignedDeckName = res.locals.assignedDeckName;
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let stillPlaying = gameRoom.stillPlaying;
            let stillPlayingIndex = stillPlaying.indexOf(turn);
            function updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex){
                let gameover = false;
                let tempTurn =0;
                let cardsLeft = requestingUserCards.length;
                if(stillPlayingIndex === stillPlaying.length-1){
                    tempTurn = stillPlaying[0];
                }else{
                    tempTurn = stillPlaying[stillPlayingIndex+1];
                };
                if(cardsLeft === 0){
                    stillPlaying = updateArray(stillPlaying, stillPlayingIndex)
                    gameRoom.stillPlaying = stillPlaying;
                    if(stillPlaying.length === 1){
                        gameover = true;
                    }
                }
                return [tempTurn, gameover]
            }
            function updateArray(someArray, removeIndex){
                let temp = someArray.slice(0,removeIndex);
                temp.push(...someArray.slice(removeIndex+1))
                return temp;
            }
            function getCardValue(card){
                let deckSorted = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
                return deckSorted.indexOf(card.slice(0, card.length-2));
            }
            function getCardSuit(card){
                return card.slice(card.length-1)
            }
            let turn = gameRoom["turn"];
            let cardsOnTable = gameRoom["cardOnTable"];
            //check if it is the turn of the user trying to throw the card, if not send not ur turn message.
            if(requestingUserIndex === turn){
                let requestingUserCards = gameRoom[assignedDeckName];
                let suitOnTable = getCardSuit(cardsOnTable[0]);
                let thrownCardIndex = requestingUserCards.indexOf(cardThrown);
                //confirm that the card user is trying to throw exists in his deck.
                if(thrownCardIndex !== -1){
                    //if the card exists, remove it from thier deck.
                    requestingUserCards = updateArray(requestingUserCards, thrownCardIndex)
                    gameRoom[assignedDeckName] = requestingUserCards;
                    //update the cards on table array with the new card that was just thrown
                    if(cardThrown !== "AS" && cardsOnTable.length+1<=4){
                        cardsOnTable.unshift(cardThrown);
                        gameRoom["cardOnTable"]=cardsOnTable;
                    }else if(cardThrown !== "AS" && cardsOnTable.length+1>4){
                        cardsOnTable = [];
                        cardsOnTable.push(cardThrown)
                        gameRoom["cardOnTable"]=cardsOnTable;
                    }
                    //console.log("cardsOnTable after resetting: ", cardsOnTable)
                    //console.log(cardThrown[cardThrown.length-1] === suitOnTable, cardThrown[cardThrown.length-1], suitOnTable)
                    //if the thrown cards suit matches the suit of that round or if it is the first card thrown that round, then no one has to collect any cards.
                    if(getCardSuit(cardThrown) === suitOnTable || cardsOnTable.length === 1){
                        //check if that was the user's last card, if so, pull them from still playing list. Then update turn based on whos left in the game:
                        let updatedTurn = updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex)
                        gameRoom.turn = updatedTurn[0]
                        gameRoom.save();
                        res.status(200).send({thrown: true, room: roomReq, gameover: updatedTurn[1]});
                    }else if(getCardSuit(cardThrown) !== suitOnTable && cardsOnTable.length > 1){
                    //else if the suit does not match and its not the first card thrown that round, then the person that threw the highest card that round collects.
                        //find the index of the highest card thrown:
                        let index=0, cardValue=0, numberOfCardsOnTable = cardsOnTable.length, collectorDeck, deckSpaceLeft, pickUpAmount, collector=0;
                        let updatedTurn = updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex)
                        for(let i=1; i<numberOfCardsOnTable; i++){
                            let card = cardsOnTable[i];
                            let tempIndex = getCardValue(card)
                            console.log(tempIndex)
                            if(tempIndex >= cardValue){
                                cardValue = tempIndex;
                                index = i;
                            }
                        }
                        //after finding the index of the highest card on the table, based on who threw the current card, turns are reversed to find out who threw the highest card.
                        for(let i=0; i<index; i++){
                            if(stillPlayingIndex === 0){
                                stillPlayingIndex = stillPlaying.length-1;
                            }else{
                                stillPlayingIndex -= 1;
                            }
                        }
                        //console.log("index: ", index, " collector: ", collector)
                        //highest card throwers deck is retrieved
                        collector = stillPlaying[stillPlayingIndex];
                        collectorDeck = gameRoom["deck"+collector];
                        //console.log("collectors deck before: ", collectorDeck)
                        //since front end was designed hold a max of 13 cards in users deck, the user picks up cards from taht round as long as it doesnt exceed the max deck threshold
                        deckSpaceLeft = 13 - collectorDeck.length;
                        pickUpAmount = Math.min(deckSpaceLeft, cardsOnTable.length)
                        //console.log("pickup", pickUpAmount, "deckSpaceLeft ", deckSpaceLeft, "cardsOnTable.length ", cardsOnTable.length)
                        for(let i=pickUpAmount-1; i>=0; i--){
                            collectorDeck.push(cardsOnTable[i])
                        }
                        //the collectors get to throw first card that round.
                        gameRoom["turn"] = collector;
                        gameRoom.save();
                        res.status(200).send({thrown: true, room: roomReq, gameover: updatedTurn[1]});
                    }
                }else{res.status(200).send({thrown: false, reason: "Card not found"})};
            }else{
                res.status(200).send({thrown: false, reason: "Not your turn"})
            };
        };
    });
});

router.post("/getcardcount", middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, middleware.getProccessedRoomInfo, (req, res)=>{
    let roomReq = req.body.room;
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let keys = [];
            keys = Object.keys(otherUsers);
            for(let i=0; i<keys.length; i++){
                let deckName = otherUsers[keys[i]];
                otherUsers[keys[i]] = gameRoom[deckName].length;
            }
            res.status(200).send({otherUsers});
        }
    })
})

module.exports = router