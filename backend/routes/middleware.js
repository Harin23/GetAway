const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');
const userModel = require('../models/user');
const gamedataModel = require('../models/gamedata')

db_uri = process.env.DB
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('middleware route has connected to mongoDB')
    }
});

//use this function to check token once the user is signed in
function verifyToken(req, res, next){
    if (!req.headers.authorization){
        res.status(401).send('Unauthorized request');
    }
    let token = req.headers.authorization.split(" ")[1]
    if (token === 'null'){
        res.status(401).send('Unauthorized request');
    }
    let payload = jwt.decode(token, 'secretKey')
    if (!payload){
        res.status(401).send('Unauthorized request');
    }else{
        let userId = payload['subject'];
        res.locals.userId = userId;
        next();
    }
}

function getUsername(req, res, next){
    let userId = res.locals.userId;
    userModel.findOne({ _id: userId}, (err, user) => {
        if (err){
            console.log(err)
        } else if (user === null){
            res.status(401).send('Username not found')
        } else {
            res.locals.name = user.username;
            next();
        };
    });
}

function getRoomInfo(req, res, next){
    let username = res.locals.name;
    lobbyModel.findOne({ users: username }, (err, room)=>{
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(200).send({exists: false, name: username})
        }else{
            res.locals.roomInfo = room;
            next();
        }
    })
}

function leaveRoom(req, res, next){
    let user = res.locals.name;
    lobbyModel.findOne({ users: user }, (err, room) => {
        if (err){
            console.log(err)
        }else if (room === null){
            res.status(400).send("Room does not exist")
        }else{
            var users = room.users;
            if(users.length > 1){
                for (var i=users.length-1; i>=0; i--) {
                    if (users[i] === user) {
                    users.splice(i, 1);
                    }
                }
                room.users = users;
                room.save();
                res.status(200).send({name: user, room: room.room})
            }else{
                let roomName = room.room;
                room.remove();
                gamedataModel.findOne({ room: roomName }, (err, roomGame) => {
                    if (err){
                        console.log(err)
                    }else if (roomGame === null){
                        res.status(200).send({name: user, room: roomName})
                    }else{
                        roomGame.remove();
                        res.status(200).send({name: user, room: roomName})
                    }
                })
            }
        } 
    })
}

function getProccessedRoomInfo(req, res, next){
    let userReq = res.locals.name;
    let users = res.locals.roomInfo.users;
    if(users.length >14){
        res.status(400).send("Not enough users")
    }else{
        let index = users.indexOf(userReq);
        let assignedDeckName = "deck" + index;
        let otherUsers =  [];
        if(users.length > 1){
            otherUsers = users.map((user, i)=>{
                if(i !== index){
                    return {user: user, deck: "deck" + i}
                }
            }).filter(item => item);
        }else{
            users.push("user2", "user3", "user4");
            otherUsers = users.map((user, i)=>{
                if(i !== index){
                    return {user: user, deck: "deck" + i}
                }
            }).filter(item => item);
        }
        //console.log(userReq, otherUsers)
        res.locals.assignedDeckName = assignedDeckName;
        res.locals.index = index;
        res.locals.otherUsers = otherUsers;
        next();
    }      
}

module.exports={
    verifyToken : verifyToken,
    getProccessedRoomInfo : getProccessedRoomInfo,
    getUsername : getUsername,
    getRoomInfo : getRoomInfo,
    leaveRoom : leaveRoom
}
