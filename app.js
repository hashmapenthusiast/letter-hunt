const express = require('express');
const path = require('path');
const server = express();
const port = 3000

server.get('/', function (req, res, next) {
    console.log('accessing the index page');
    res.sendFile(path.join(__dirname, './letter-hunt.html'));

});

server.listen(port, function () {
    console.log(`listening on port ${port}`)
});
