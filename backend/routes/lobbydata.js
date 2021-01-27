const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');
const gamedataModel = require('../models/gamedata');
const middleware = require('./middleware');

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('lobbydata route has connected to mongoDB')
    }
});

router.post('/', (req,res) =>{
    console.log(res)
    console.log(req)
})

//route:/lobby-data/create
router.post('/create', middleware.verifyToken, middleware.getUsername, (req, res) => {
    let roomInfo = req.body;
    let name = res.locals.name;
    roomInfo["users"] = name;
    let room = new lobbyModel(roomInfo);
    room.save();
    let gameInfo = {room: roomInfo.room, cardsShuffled: false, cardOnTable: ["AS"]}
    let gameRoom = new gamedataModel(gameInfo);
    gameRoom.save();
    res.status(200).send({name: name})
})

//route:/lobby-data/join
router.post('/join', middleware.verifyToken, middleware.getUsername, (req, res) => {
    let roomInfo = req.body;
    let name = res.locals.name;
    lobbyModel.findOne({ room: roomInfo.room }, (err, room) => {
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            numberOfUsers = room.users.length
            //console.log(numberOfUsers)
            if(numberOfUsers <=4){
                room.users.push(name);
                room.totalUsers = numberOfUsers + 1; 
                room.save();
                res.status(200).send({name: name});
            }else{
                res.status(400).send("Room full")
            }
        } 
    })
})

router.post('/leave', middleware.verifyToken, middleware.getUsername, middleware.leaveRoom, (req, res) => {
   
})

router.get('/update', (req,res) => {
    lobbyModel.find({}, {room:1, _id:0}, (err, rooms) =>{
        if (err){
            console.log(err)
            res.status(500).send({err})
        }else if (rooms === null){
            res.status(200).send("Not found")
        }else{
            res.status(200).send({rooms})
        }
    })
})

router.post('/users', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, (req,res)=>{
    let users = res.locals.roomInfo.users;
    res.status(200).send({users});
})

router.post('/deleteall',  (req, res) =>{  
    lobbyModel.deleteMany({}, (err, result)=>{
        if (err){
            console.log(err)
        }
    });
    gamedataModel.deleteMany({}, (err, result)=>{
        if (err){
            console.log(err)
        }
    });
    res.status(200).send({message: "cleared"})
})

module.exports = router