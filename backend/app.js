const Express = require("express")();
const Http = require("http").Server(Express);
const socketio = require("socket.io")(Http);

var position = {
    x:100,
    y:100
};

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