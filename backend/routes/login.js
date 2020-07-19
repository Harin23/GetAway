const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const user_model = require('../models/user');
const user = require('../models/user');

//connect to db
db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, err => {
    if (err){
        console.log(err)
    } else {
        console.log('Connected to mongoDB')
    }
});

//this is the /login route:
router
    .route('/')
    .post(req,res => {
        let userinfo = req.body
        
        user_model.findOne({email: userinfo.email}, (err, user) => {
            if (err){
                console.log(err)
            } else if (!user){
                res.status(401).send('Invalid Email')
            } else if (user.password != user.password){
                res.status(401).send('Invalid Password')
            } else {
                res.status(200).send(user)
            }
        });
        
    });

//this is the /login/resgister route:
router
    .route('/register')
    .post(req,res => {
        let userinfo = req.body
        let user = new user_model(userinfo)
        user.save(err, registeredUser => {
            if (err){
                console.log(err)
            } else {
                res.status(200).send(registeredUser)
            }
        })
    });

module.exports = router