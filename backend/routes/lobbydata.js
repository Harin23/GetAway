const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby')
const gamedataModel = require('../models/gamedata');

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
router.post('/create', (req, res) => {
    let roomInfo = req.body;
    //console.log(roomInfo)
    roomInfo['totalUsers'] = 1;
   // console.log(roomInfo)
    let room = new lobbyModel(roomInfo);
    room.save();
    let gameInfo = {room: roomInfo.room, cardsShuffled: false, cardOnTable: "AS"}
    let gameRoom = new gamedataModel(gameInfo);
    gameRoom.save();
    res.status(200).send("lobby created")
})

//route:/lobby-data/join
router.post('/join', (req, res) => {
    let roomInfo = req.body;
    lobbyModel.findOne({ room: roomInfo.room }, (err, room) => {
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            numberOfUsers = room.totalUsers
            //console.log(numberOfUsers)
            if(numberOfUsers <=4){
                room.users.push(roomInfo.users);
                room.totalUsers = numberOfUsers + 1; 
                room.save();
                res.status(200).send({room});
            }else{
                res.status(400).send("Room full")
            }
        } 
    })
})

router.post('/leave', (req, res) => {
    let roomInfo = req.body;
    lobbyModel.findOne({ room: roomInfo.room }, (err, room) => {
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            var users = room.users;
            var user = roomInfo.users;
            numberOfUsers = room.totalUsers;
            if(users.length > 1 || numberOfUsers > 1){
                for (var i=users.length-1; i>=0; i--) {
                    if (users[i] === user) {
                    users.splice(i, 1);
                    }
                }
                numberOfUsers -= 1;
                room.totalUsers = numberOfUsers;
                room.users = users;
                room.save();
                res.status(200).send({message: "Left"})
            }else{
                room.remove();
                gamedataModel.findOne({ room: roomInfo.room }, (err, room) => {
                    if (err){
                        console.log(err)
                    }else if (room === null){
                        res.status(400).send("Room Deleted")
                    }else{
                        room.remove();
                    }
                })
            }
        } 
    })
})

router.get('/update', (req,res) => {
    lobbyModel.find({}, {room:1, _id:0}, (err, room) =>{
        if (err){
            console.log(err)
            res.status(500).send({err})
        }else if (room === null){
            res.status(200).send("Not found")
        }else{
            res.status(200).send({room})
        }
    })
})

router.post('/users', (req,res)=>{
    let roomInfo = req.body.room;
    lobbyModel.findOne({ room: roomInfo }, (err, room) =>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            let users = room.users;
            res.status(200).send({users});
        }
    })
})

router.post('/find', (req,res)=>{
    let username = req.body.username;
    lobbyModel.findOne({ users: username }, (err, room)=>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(200).send({data: false})
        }else{
            res.status(200).send({data: room});
        }
    })
})

//route: /lobby-data/delete
router.post('/delete', (req, res) =>{
    let roomInfo = req.body;
    lobbyModel.deleteOne({ room: roomInfo });
})

module.exports = router