const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();
app.use(bodyParser(JSON));

//define routes:
const login = require('./routes/login');

app.get('/', (req, res) => {
    //root
});

app.use('/login', login);

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});







