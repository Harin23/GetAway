const express = require('express');
const jwt = require('jsonwebtoken')
const router = express.Router();
const mongoose = require('mongoose');
const userModel = require('../models/user');

//connect to db
db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Connected to mongoDB users collection')
    }
});

payloadCollected = "";

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
        this.payloadCollected = payload['subject'];
        next();
    }
}

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
        

router.get('/username', verifyToken, (req,res) => {
    userModel.findOne({ _id: payloadCollected}, (err, user) => {
        if (err){
            console.log(err)
        } else if (user === null){
            res.status(401).send('Username not found')
        } else {
            let collectedUsername = user.username;
            res.status(200).send({collectedUsername})
        };
    });
});

router.post('/verify', verifyToken, (req,res) => {
    let user = req.body;
    localUsername = user.username;
    userModel.findOne({ _id: payloadCollected}, (err, user) => {
        if (err){
            console.log(err)
        } else if (user === null){
            res.status(401).send('Username not found')
        } else {
            let collectedUsername = user.username;
            if (localUsername === collectedUsername){
                res.status(200).send(true)
            }else{
                res.status(401).send(false)
            }
            
        };
    });
});

module.exports = router
