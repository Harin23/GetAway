const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const lobbyModel = require('../models/lobby');

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
        let payloadCollected = payload['subject'];
        res.locals.payloadCollected = payloadCollected;
        next();
    }
}

function getRoomInfo(req, res, next){
    db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
    mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
        if (error){
            console.log(error)
        } else {
            console.log('middleware route has connected to mongoDB')
        }
    });
    //otherUsers={}; //without clearing here, this obj stores info from previous req causing error
    let roomReq = req.body.room;
    let userReq = req.body.name;
    lobbyModel.findOne({ room: roomReq }, (err, lobbyRoom) => {
        if (err){
            console.log(err)
        }else if (lobbyRoom === null){
            res.status(400).send("Room does not exist")
        }else{
            let users = lobbyRoom.users;
            if(users.length >14){
                res.status(400).send("Not enough users")
            }else{
                let index = users.indexOf(userReq);
                let assignedDeckName = "deck" + index;
                let otherUsers =  {};
                for(let i=0; i<users.length; i++){
                    //console.log(index, i !== index)
                    if(i !== index){
                        otherUsers[users[i]] = "deck" + i;
                        //console.log(i, otherUsers, users[i])
                    }
                }
                res.locals.assignedDeckName = assignedDeckName;
                res.locals.index = index;
                res.locals.otherUsers = otherUsers;
                next();
            }
        }
    })
}

module.exports={
    verifyToken : verifyToken,
    getRoomInfo : getRoomInfo
}