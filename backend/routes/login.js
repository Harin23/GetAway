const express = require('express');
const jwt = require('jsonwebtoken')
const router = express.Router();
const mongoose = require('mongoose');
const userModel = require('../models/user');


//connect to db
db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Connected to mongoDB')
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
    let payload = jwt.verify(token, 'secretKey')
    if (!payload){
        res.status(401).send('Unauthorized request');
    }
    next(payload);
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
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send(token)
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
                 //let username = user.username;
                 let payload = { subject: user._id }
                 let token = jwt.sign(payload, 'secretkey')
                 res.status(200).send({token})
             }
        });
    }
});


//this is the /login/resgister route:
router.post('/register', (req,res) => {
    let userinfo = req.body
    let user = new userModel(userinfo)
    user.save()
        .then(registeredUser => {
        let payload = { subject: registeredUser._id }
        let token = jwt.sign(payload, 'secretKey')
        res.status(200).send(token)
        })
        .catch(err => {
        res.status(400).send(err);
      });
    });

router.get('/username', verifyToken, (req,res) => {
    userModel.findOne({ _id: payload}, (err, username) => {
        if (err){
            console.log(err)
        } else if (username === null){
            res.status(401).send('Username not found')
        } else {
            res.status(200).send({username})
        }
    });
});

module.exports = router

//res.addHeader("Access-Control-Allow-Headers", "Content-Type, authorization");