const cors = require('cors');
const bodyParser = require('body-parser');
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const port = 3000;
io = require('socket.io')(server, options);

app.use(cors());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

//define routes:
const login = require('./routes/login');
const lobbydata = require('./routes/lobbydata');
const gamedata = require('./routes/gamedata');

app.get('/', (req, res) => {
    //root
});

app.use('/login', login);
app.use('/lobbydata', lobbydata);
app.use('/gamedata', gamedata);

io.of('/lobby').on('connection', (socket) => {
    socket.on("join_room", room =>{
        socket.join(room);
        //console.log(`${room} joined`)
    });

    socket.on("sendMessage", ({room, message, username}) =>{
        //console.log(room, message, username)
        io.of('lobby').to(room).emit('message', `${username}:${message}`);
        //console.log(socket.disconnected);
    });

    socket.on("handoutCards", ({room}) => {

    }); 

    /*socket.on("typing", ({room, username}) =>{
        socket.to(room).emit(`${username} is typing...`);
    }); */
});


server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});






