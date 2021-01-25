const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');
const gamedataModel = require('../models/gamedata');
const { IfStmt } = require('@angular/compiler');

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
deckSorted = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

let assignedDeckName="";
let index=0;
let otherUsers={};

function getRoomInfo(req, res, next){
    otherUsers={}; //without clearing here, this obj stores info from previous req causing error
    let roomReq = req.body.room;
    let userReq = req.body.name;
    lobbyModel.findOne({ room: roomReq }, (err, lobbyRoom) => {
        if (err){
            console.log(err)
        }else if (lobbyRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let users = lobbyRoom.users;
            if(users.length >4){
                res.status(400).send("Not enough users")
            }else{
                index = users.indexOf(userReq);
                assignedDeckName = "deck" + index;
                for(let i=0; i<users.length; i++){
                    //console.log(index, i !== index)
                    if(i !== index){
                        otherUsers[users[i]] = "deck" + i;
                        //console.log(i, otherUsers, users[i])
                    }
                }
                next();
            }
        }
    })
}

router.post('/shuffle', (req,res) => {
    roomName = req.body['room'];
    gamedataModel.findOne({ room: roomName}, (err, room) =>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            //console.log("shuffling started")
            room.deck0 = [];
            room.deck1 = [];
            room.deck2 = [];
            room.deck3 = [];
            room.save();
            let shuffled = room.cardsShuffled;
            if (shuffled === false){
                //shuffle cards
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
                        room.turn = 0;
                        res.status(200).send("Cards Shuffled")
                    }
                }
            }else{
                console.log("game already started")
                res.status(200).send("cards already shuffled")
            }
        }
    })

})

router.post('/getgameinfo', getRoomInfo, (req,res) => {
    let roomReq = req.body.room;
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            //console.log(room["deck0"])
            let cardOnTable = gameRoom["cardOnTable"][0];
            let assignedDeck = gameRoom[assignedDeckName];
            //console.log(otherUsers)
            let keys = [];
            keys = Object.keys(otherUsers);
            for(let i=0; i<keys.length; i++){
                let deckName = otherUsers[keys[i]];
                otherUsers[keys[i]] = gameRoom[deckName].length;
            }
            res.status(200).send({assignedDeck, cardOnTable, otherUsers});
        }
    })
})

router.post('/throwcard', getRoomInfo, (req,res) => {
    let roomReq = req.body.room;
    // let userReq = req.body.name;
    let cardThrown = req.body.card;
    //console.log(roomReq, userReq)
    gamedataModel.findOne({ room: roomReq}, (err, gameRoom) =>{
        if (err){
            console.log(err)
        }else if (gameRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let turn = gameRoom["turn"];
            let collector=turn;
            let cardsOnTable = gameRoom["cardOnTable"];
            if(index === turn){
                if(turn>= 0 && turn<1){
                    turn +=1;
                }else{
                    turn = 0;
                }
                gameRoom["turn"] = turn;
                let cards = gameRoom[assignedDeckName];
                let suitOnTable = cardsOnTable[0][cardsOnTable[0].length-1]
                let index = cards.indexOf(cardThrown);
                if(index !== -1){
                    let temp = cards.splice(0, index);
                    temp.push(...cards.splice(1));
                    gameRoom[assignedDeckName] = temp;
                    if(cardThrown !== "AS" && cardsOnTable.length<2){
                        cardsOnTable.unshift(cardThrown);
                        gameRoom["cardOnTable"]=cardsOnTable;
                    }else if(cardThrown !== "AS" && cardsOnTable.length>2){
                        cardsOnTable = [];
                        cardsOnTable.push(cardThrown)
                        gameRoom["cardOnTable"]=cardsOnTable;
                    }
                    console.log(cardThrown[cardThrown.length-1] === suitOnTable, cardThrown[1], suitOnTable)
                    if(cardThrown[1] === suitOnTable){
                        gameRoom.save();
                        res.status(200).send({thrown: true});
                    }else{
                        //the user that threw the highest card that round has to collect
                        //find the index of the highest card thrown:
                        let index=0, cardValue=0, numberOfCardsOnTable = cardsOnTable.length, collectorDeck, deckSpaceLeft, pickUpAmount;
                        console.log("cardsOnTable: ", cardsOnTable)
                        for(let i=1; i<numberOfCardsOnTable; i++){
                            let card = cardsOnTable[i];
                            let tempIndex = deckSorted.indexOf(card[0]);
                            if(tempIndex >= cardValue){
                                cardValue = tempIndex;
                                index = i;
                            }
                        }
                        
                        for(let i=0; i<index; i++){
                            if(collector === 0){
                                collector = 3;
                            }else{
                                collector -= 1;
                            }
                        }
                        console.log("index: ", index, " collector: ", collector)
                        collectorDeck = gameRoom["deck"+collector];
                        console.log("collectors deck before: ", collectorDeck)
                        deckSpaceLeft = 13 - collectorDeck.length;
                        pickUpAmount = Math.min(deckSpaceLeft, cardsOnTable.length)
                        console.log("pickup", pickUpAmount, "deckSpaceLeft ", deckSpaceLeft, "cardsOnTable.length ", cardsOnTable.length)
                        for(let i=pickUpAmount-1; i>=0; i--){
                            collectorDeck.push(cardsOnTable[i])
                        }
                        console.log("")
                        gameRoom.save();
                        res.status(200).send({thrown: true});
                    }
                }else{res.status(200).send({thrown: false, reason: "Card not found"})};
            }else{
                res.status(200).send({thrown: false, reason: "Not your turn"})
            };
        };
    });
});

router.post("/getcardcount", getRoomInfo, (req, res)=>{
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