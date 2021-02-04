const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const gamedataModel = require('../models/gamedata');
const user = require('../models/user');
const middleware = require("./middleware")

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Gamedata route has connected to mongoDB')
    }
});

router.post('/shuffle', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, (req,res) => {
    let roomName = res.locals.roomInfo.room;
    let user = res.locals.name;
    let users = res.locals.roomInfo.users;
    let userIndex = users.indexOf(user);
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
            if (shuffled === false && userIndex === 0){
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
                    room.currentRound = {thrower: 9, card: "blank"}
                    room.currTurn = turn;
                    room.stillPlaying = [0, 1, 2, 3];
                    room.cardsReq = 4;
                    room.save()
                    res.status(200).send({cardsShuffled: true})
                })       
            }else{
                if(shuffled === true){
                    res.status(200).send({cardsShuffled: true})
                }else{
                    res.status(400).send("Only room leader can shuffle cards")
                }
            }
        }
    })

})

router.post('/getgameinfo', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, middleware.getProccessedRoomInfo, (req,res) => {
    let roomReq = res.locals.roomInfo.room;
    let users = res.locals.roomInfo.users;
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
            let stillPlaying = gameRoom.stillPlaying;
            if(stillPlaying.length > 1){
                let cardOnTable = gameRoom.currentRound[0].card;
                let assignedDeck = gameRoom[assignedDeckName];
                otherUsers.map(obj=>{
                    obj.deck = gameRoom[obj.deck].length
                }) 
                let userTurn = users[gameRoom.currTurn]
                res.status(200).send({gameover: false, currentTurn: userTurn, assignedDeck, cardOnTable, otherUsers});
            }else{
                let loserDeck = "deck" + stillPlaying[0];
                let shuffled = gameRoom.cardsShuffled;
                if(shuffled === true){
                    gameRoom.cardsShuffled = false;
                    gameRoom.save();
                }
                if(loserDeck === assignedDeckName){
                    res.status(200).send({gameover: true, loser: name})
                }else{
                    let loserName = otherUsers.filter(obj=>{
                        return obj.deck === loserDeck;
                    })[0].user;
                    res.status(200).send({gameover: true, loser: loserName})
                }

            }

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

    function sortPlayersBasedOnCardThrown(cardsOnTable, stillPlaying){
        //ensure everything passed into this func is updated before calling this
        let sorted = cardsOnTable.slice(0)
        sorted = sorted.sort((a, b) =>{
            var valA = getCardValue(a.card);
            var valB = getCardValue(b.card);
            return valB - valA;
        }).filter(item =>{
            return stillPlaying.indexOf(item.thrower) !== -1
        });
        console.log("before sorting: ", cardsOnTable, "after: ", sorted)
        return sorted;
    }

    function updateSequentialTurn(stillPlaying, currTurnIndex){
        let tempTurn;
        if(currTurnIndex === stillPlaying.length-1){
            tempTurn = stillPlaying[0];
        }else{
            tempTurn = stillPlaying[currTurnIndex+1];
        };
        return tempTurn;
    }

    function updateStillPlaying(cardsLeft, stillPlaying, currTurnIndex){
        if(cardsLeft === 0){
            stillPlaying = updateArray(stillPlaying, currTurnIndex)
        }
        return stillPlaying
    }

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
            let turn = gameRoom["currTurn"];
            if(turn === requestingUserIndex){
                //throw card
                let cardsOnTable = gameRoom["currentRound"];
                let stillPlaying = gameRoom.stillPlaying;
                let requestingUserCards = gameRoom[assignedDeckName];
                let thrownCardIndex = requestingUserCards.indexOf(cardThrown);
                let currTurnIndex = stillPlaying.indexOf(turn);
                let cardsReq = gameRoom.cardsReq;
                if(thrownCardIndex !== -1 && stillPlaying.length > 1){
                    //before updating cards on table, check if throw is valid, if so which case it falls under:
                    if(cardsOnTable[0].card === "blank" || cardsOnTable.length === cardsReq){
                        //case1: The card thrown will be the first of the round, so its suit does not matter at this point.
                        //cardsOnTable = updateCardsOnTable(cardsOnTable, cardThrown, turn);
                        cardsOnTable = [];
                        cardsOnTable.push({thrower: turn, card: cardThrown})
                        requestingUserCards = updateArray(requestingUserCards, thrownCardIndex);
                        turn = updateSequentialTurn(stillPlaying, currTurnIndex);
                        //total requirement for cards on table to end current round has to be updated at the
                        //beginning of each round before updating stillPlaying.
                        gameRoom.cardsReq = stillPlaying.length;
                        stillPlaying = updateStillPlaying(requestingUserCards.length, stillPlaying, currTurnIndex);//stillPlaying has to be updated after the seq turn update
                        gameRoom.currentRound = cardsOnTable;
                        gameRoom[assignedDeckName] = requestingUserCards;
                        gameRoom.currTurn = turn;
                        gameRoom.stillPlaying = stillPlaying;
                        gameRoom.save();
                        res.status(200).send({room: roomReq})
                    }else if(getCardSuit(cardsOnTable[0].card) === getCardSuit(cardThrown)){
                        //Case 2: The card thrown is not the first in the round, and the cards suit matches the round's suit.
                        //cardsOnTable = updateCardsOnTable(cardsOnTable, cardThrown, turn);
                        cardsOnTable.unshift({thrower: turn, card: cardThrown});
                        requestingUserCards = updateArray(requestingUserCards, thrownCardIndex);
                        //update turn sequentially if last card in the round was not thrown
                        //if it was then, update turn to the highest card thrower still playing
                        if(cardsOnTable.length === cardsReq){//last card of the round just thrown
                            //updating stillPlaying first allows the highest card thrower array to include or not include the current thrower if they are or arent in the game.
                            stillPlaying = updateStillPlaying(requestingUserCards.length, stillPlaying, currTurnIndex);
                            turn = sortPlayersBasedOnCardThrown(cardsOnTable, stillPlaying)[0].thrower;
                        }else{
                            turn = updateSequentialTurn(stillPlaying, currTurnIndex);
                            stillPlaying = updateStillPlaying(requestingUserCards.length, stillPlaying, currTurnIndex);
                        }
                        gameRoom.currentRound = cardsOnTable;
                        gameRoom[assignedDeckName] = requestingUserCards;
                        gameRoom.currTurn = turn;
                        gameRoom.stillPlaying = stillPlaying;
                        gameRoom.save();
                        res.status(200).send({room: roomReq})
                    }else if(requestingUserCards.map(card=> getCardSuit(card)).indexOf(getCardSuit(cardsOnTable[0].card)) !== -1){
                        //case 3:The card thrown is not the first in the round, and the cards suit doesn't matches the round's suit.
                        //But the user has the card with the matching suit.
                        res.status(400).send("Throw the card matching the suit of the round")
                    }else{
                        //case 4: Not first turn in round, suit doesnt match, and the user doesnt have the card with matching suit.
                        //user that threw the highest card and has not run out of cards yet, has to collect
                        //cardsOnTable = updateCardsOnTable(cardsOnTable, cardThrown, turn);
                        cardsOnTable.unshift({thrower: turn, card: cardThrown});
                        requestingUserCards = updateArray(requestingUserCards, thrownCardIndex);
                        //highest card thrower without the current thrower as next turn/collector
                        console.log("turn befgore: ", turn)
                        turn = (sortPlayersBasedOnCardThrown(cardsOnTable, stillPlaying).filter((item) => item.thrower !== turn))[0].thrower;
                        console.log("turn after: ", turn)
                        stillPlaying = updateStillPlaying(requestingUserCards.length, stillPlaying, currTurnIndex);
                        let collectorDeck = gameRoom["deck"+turn];
                        pickUpAmount = Math.min((13-collectorDeck.length), cardsOnTable.length)
                        for(let i=pickUpAmount-1; i>=0; i--){
                            collectorDeck.push(cardsOnTable[i].card)
                        }
                        cardsOnTable = [{thrower: 9, card: "blank"}];
                        gameRoom.currentRound = cardsOnTable;
                        gameRoom[assignedDeckName] = requestingUserCards;
                        gameRoom.currTurn = turn;
                        gameRoom.stillPlaying = stillPlaying;
                        gameRoom["deck"+turn] = collectorDeck;
                        gameRoom.save();
                        res.status(200).send({room: roomReq})
                    }
                }else{
                    if(thrownCardIndex !== -1){
                        res.status(400).send("Card not found")
                    }else if(stillPlaying.length <= 1){
                        res.status(400).send("Gameover")
                    }
                }
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