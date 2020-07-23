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

//this is the /login route:
router.post('/', (req,res) => {
        let userinfo = req.body
        
        user_model.findOne({email: userinfo.email}, (err, user) => {
            if (err){
                console.log(err)
            } else if (!user){
                res.status(401).send('Invalid Email')
            } else if (user.password != user.password){
                res.status(401).send('Invalid Password')
            } else {
                let payload = { subject: user._id }
                let token = jwt.sign(payload, 'secretkey')
                res.status(200).send(token)
            }
        });
        
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

module.exports = router