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
            let turn = gameRoom["turn"];
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
            function updateCardsOnTable(cardsOnTable){
                if(cardThrown !== "AS" && cardsOnTable.length+1<=4){
                    cardsOnTable.unshift(cardThrown);
                }else if(cardThrown !== "AS" && cardsOnTable.length+1>4){
                    cardsOnTable = [];
                    cardsOnTable.push(cardThrown)
                }
                return cardsOnTable;
            }
            function findTheHighestCardThrower(cardsOnTable, stillPlaying, stillPlayingIndex){
                let index=0, cardValue=0, highCardThrower=0, numberOfCardsOnTable = cardsOnTable.length;
                for(let i=0; i<numberOfCardsOnTable; i++){
                    let card = cardsOnTable[i];
                    let tempIndex = getCardValue(card)
                    //console.log(tempIndex)
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
                highCardThrower = stillPlaying[stillPlayingIndex];
                return highCardThrower
            }
            function findTheHighestCardThrowerWithoutCurrentThrower(cardsOnTable, stillPlaying, stillPlayingIndex){
                let index=0, cardValue=0, highCardThrower=0, numberOfCardsOnTable = cardsOnTable.length;
                for(let i=1; i<numberOfCardsOnTable; i++){
                    let card = cardsOnTable[i];
                    let tempIndex = getCardValue(card)
                    //console.log(tempIndex)
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
                highCardThrower = stillPlaying[stillPlayingIndex];
                return highCardThrower
            }

            function updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex, cardsOnTable, collectionOccured){
                let gameover = false;
                let tempTurn =0, numberOfCardsOnTable=cardsOnTable.length;
                let cardsLeft = requestingUserCards.length;

                if(collectionOccured === false && numberOfCardsOnTable !== 4){
                    //sequential turn
                    if(stillPlayingIndex === stillPlaying.length-1){
                        tempTurn = stillPlaying[0];
                    }else{
                        tempTurn = stillPlaying[stillPlayingIndex+1];
                    };
                }else if(collectionOccured === false && numberOfCardsOnTable === 4){
                    //highest card thrower as next turn
                    tempTurn = findTheHighestCardThrower(cardsOnTable, stillPlaying, stillPlayingIndex)
                }else{
                    tempTurn = findTheHighestCardThrowerWithoutCurrentThrower(cardsOnTable, stillPlaying, stillPlayingIndex)
                }
                if(cardsLeft === 0){
                    stillPlaying = updateArray(stillPlaying, stillPlayingIndex)
                    gameRoom.stillPlaying = stillPlaying;
                    if(stillPlaying.length === 1){
                        gameover = true;
                    }
                }

                return [tempTurn, gameover]
            }
            //check if it is the turn of the user trying to throw the card, if not send not ur turn message.
            if(requestingUserIndex === turn){
                let cardsOnTable = gameRoom["cardOnTable"];
                let stillPlaying = gameRoom.stillPlaying;
                let stillPlayingIndex = stillPlaying.indexOf(turn);
                let requestingUserCards = gameRoom[assignedDeckName];
                let thrownCardIndex = requestingUserCards.indexOf(cardThrown);
                let suitOnTable = "";
                //confirm that the card user is trying to throw exists in his deck.
                if(thrownCardIndex !== -1){
                    //update the cards on table array with the new card that was just thrown
                    if(cardsOnTable.length === 4 || cardsOnTable.length === 0){
                        suitOnTable = getCardSuit(cardThrown)
                    }else{
                        suitOnTable = getCardSuit(cardsOnTable[0]);
                    }
                    cardsOnTable=updateCardsOnTable(cardsOnTable);
                    //if the thrown cards suit matches the suit of that round or if it is the first card thrown that round, then no one has to collect any cards.
                    if(getCardSuit(cardThrown) === suitOnTable){
                        //check if that was the user's last card, if so, pull them from still playing list. Then update turn based on whos left in the game:
                        console.log("first case")
                        console.log("thrower:", name, " card thrown:", cardThrown, " cards on table before:", cardsOnTable, " suit on table:", suitOnTable)
                        requestingUserCards = updateArray(requestingUserCards, thrownCardIndex)
                        gameRoom[assignedDeckName] = requestingUserCards;
                        let updatedTurn = updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex, cardsOnTable, false)
                            console.log("cards on table after: ", cardsOnTable, "updated turn: ", updatedTurn)
                            if(updateTurn[1] === true){
                                gameRoom.gameover = true;
                            }
                            gameRoom.turn = updatedTurn[0]
                            gameRoom["cardOnTable"] = cardsOnTable;
                            gameRoom.save();
                            res.status(200).send({thrown: true, room: roomReq, gameover: updatedTurn[1]});
                    }else if(requestingUserCards.map(card=> getCardSuit(card)).indexOf(suitOnTable) !== -1){
                        console.log("Wrong card case")
                        res.status(200).send({thrown: false, reason: "Throw the card that matches the suit on table please."})
                    }else{
                        //else if the suit does not match and its not the first card thrown that round, then the person that threw the highest card that round collects.
                        //find the index of the highest card thrown:
                        console.log("collection case")
                        let collectorDeck=[], deckSpaceLeft=0, pickUpAmount=0;
                        console.log("thrower: ", name, "card thrown: ", cardThrown, "cards on table before: ", cardsOnTable, " suit on table:", suitOnTable)
                        requestingUserCards = updateArray(requestingUserCards, thrownCardIndex)
                        gameRoom[assignedDeckName] = requestingUserCards;
                        let updatedTurn = updateTurn(requestingUserCards, stillPlaying, stillPlayingIndex, cardsOnTable, true)
                        console.log("cards on table after: ", cardsOnTable, "updated turn: ", updatedTurn)
                        let collector = updatedTurn[0]
                        //highest card throwers deck is retrieved 
                        collectorDeck = gameRoom["deck"+collector];
                        //since front end was designed hold a max of 13 cards in users deck, the user picks up cards from taht round as long as it doesnt exceed the max deck threshold
                        deckSpaceLeft = 13 - collectorDeck.length;
                        pickUpAmount = Math.min(deckSpaceLeft, cardsOnTable.length)
                        for(let i=pickUpAmount-1; i>=0; i--){
                            collectorDeck.push(cardsOnTable[i])
                        }
                        if(updateTurn[1] === true){
                            gameRoom.gameover = true;
                        }
                        //the collectors get to throw first card that round.
                        gameRoom["turn"] = collector;
                        //clear cards on table after a user collects
                        gameRoom["cardOnTable"] = [];
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