const cors = require('cors');
const bodyParser = require('body-parser');
const app = require('express')();
const server = require('http').createServer(app);
const options = { /* ... */ };
const port = 3000;
io = require('socket.io')(server, options);

app.use(cors());
app.use(bodyParser(JSON));
app.use(bodyParser.urlencoded({ extended: false }));

//define routes:
//const lobby = require('./routes/lobby');
const login = require('./routes/login');
//const table = require('./routes/table');

app.get('/', (req, res) => {
    //root
});

app.use('/login', login);
//app.use('/lobby', lobby);
//app.use('/table', table(io));

io.of('/lobby').on('connection', (socket) => {
    
    socket.emit('welcome', "welcome to the lobby");

});


server.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});






