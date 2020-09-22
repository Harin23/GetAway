const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const lobbyModel = require('./models/lobby')

db_uri = "mongodb+srv://harin_getaway_game24:vWey6Oa4D9wOzDY7@getaway.svfza.mongodb.net/getaway-users?retryWrites=true&w=majority"
mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true }, error => {
    if (error){
        console.log(error)
    } else {
        console.log('Connected to mongoDB')
    }
});

module.exports = router