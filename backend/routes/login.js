const express = require('express');
const jwt = require('jsonwebtoken')
const router = express.Router();
const mongoose = require('mongoose');
const userModel = require('../models/user');
const middleware = require("./middleware")

//connect to db
db_uri = process.env.DB
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('login route connected to mongoDB')
    }
});

//this is the /login route:
router.post('/', (req,res) => {
    let userinfo = req.body
    if (userinfo.userid.indexOf('@') > -1){
        userModel.findOne({ email: userinfo.userid }, (err, user) => {
            if (err){
                console.log(err)
            } else if (user === null){
                res.status(401).send('Invalid Email')
            } else if (user.password != userinfo.password){
                res.status(401).send('Invalid Password')
            } else {
                let username = user.username;
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send({token, username})
            }
        });
    }else {
        userModel.findOne({ username: userinfo.userid }, (err, user) => {
             if (err){
                console.log(err)
            } else if (user === null){
                    res.status(401).send('Invalid Username')
              } else if (user.password != userinfo.password){
                res.status(401).send('Invalid Password')
            } else {
                 let username = user.username;
                 let payload = { subject: user._id }
                 let token = jwt.sign(payload, 'secretkey')
                 res.status(200).send({token, username})
             }
        });
    }
});

//this is the /login/resgister route:
router.post('/register', (req,res) => {
    let userinfo = req.body
    let user = new userModel(userinfo)
    
    emailExists = null;
    usernameExists = null;
    usernameTest = false;
    emailTest = false;

    userModel.findOne({ email: userinfo.email }, (err, user) => {
        if (err){
            console.log(err)
            emailTest = true;
        } else if (user === null){
            emailExists = false;
            emailTest = true;
        } else {
            emailExists = true;
            emailTest = true;
        }
    });

    userModel.findOne({ username: userinfo.username }, (err, user) => { 
        if (err){
            console.log(err)
            usernameTest = true;
        } else if (user === null){
            usernameExists = false;
            usernameTest = true;
        } else {
            usernameExists = true;
            usernameTest = true;
        }
    });

    cb1();
    function cb1(){
        if (emailTest ===false || usernameTest===false){
            setTimeout(function(){cb1()}, 10);
        }else{
            if (usernameExists === false && emailExists === false){
                user.save()
                    .then(registeredUser => {
                        let payload = { subject: registeredUser._id }
                        let token = jwt.sign(payload, 'secretKey')
                        res.status(200).send({token})
                    })
                    .catch(err => {
                        res.status(400).send(err);
                    });
            } else if (emailExists === true && usernameExists === false){
                res.status(400).send('This email address has already been used to register')
            } else if (usernameExists === true && emailExists === false){
                res.status(400).send('This username already exists')
            } else if (usernameExists === true && emailExists === true){
                res.status(400).send('This email address and username have both already been used to register')
            };
        };
    };

});

router.post('/verify', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, (req,res) => {
    let name = res.locals.name
    let room = res.locals.roomInfo.name;
    res.status(200).send({name: name, exists: true, room: room})
});

router.post('/userinfo', middleware.verifyToken, middleware.getUsername, middleware.getRoomInfo, (req,res) => {
    let userInfo = {name: res.locals.name, room: res.locals.roomInfo.room};
    res.status(200).send(userInfo)
});

module.exports = router
