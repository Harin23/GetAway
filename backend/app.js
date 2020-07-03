const Express = require("express")();
const Http = require("http").Server(Express);
const socketio = require("socket.io")(Http);

var position = {
    x:100,
    y:100
};

//-------------------------------------------------------------------------sql server----------------------------------------------------------------------------------------------------------
var sqlAuth= []; //update me

var Connection = require('tedious').Connection;  
    var config = {  
        server: '127.0.0.1',  
        authentication: {
            type: 'default',
            options: {
                userName: sqlAuth[0], 
                password: sqlAuth[1]  
            }
        },
        options: {
            // If you are on Microsoft Azure, you need encryption:
            encrypt: false,
            database: 'getaway'  //update me
        }
    }; 
    var connection = new Connection(config);  
    connection.on('connect', function(err) { 
        if (err) {console.log(err)}; 
        // If no error, then good to proceed.  
        console.log("Connected");  
        executeStatement();  
    });  
  
    var Request = require('tedious').Request;  
    var TYPES = require('tedious').TYPES;  
  
    function executeStatement() {  
        request = new Request("SELECT * FROM users;", function(err) {  
        if (err) { console.log(err)};  
        });  
        var result = "";  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                result+= column.value + " ";  
              }  
            });  
            console.log(result);  
            result ="";  
        });  
  
        request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');  
        });  
        connection.execSql(request);  
    }  

    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

socketio.on("connection", socket => {
    socket.emit("position", position);
    socket.on("move", data =>{
        switch(data){
            case "l":
                position.x = position.x -50;
                socketio.emit("position", position);
                break;
            case "u":
                position.y = position.y -50;
                socketio.emit("position", position);
                break;
            case "r":
                position.x = position.x + 50;
                socketio.emit("position", position);
                break;
            case "d":
                position.y = position.y + 50;
                socketio.emit("position", position);
                break;
        }
    })
});

Http.listen(3000, () => {
    console.log("Listening at port: 3000...");
});