const express = require('express');
const path = require('path');
const server = express();
const port = process.env.PORT || 5000


server.use('/public', express.static(path.join(__dirname, 'letter-hunt/003')));

server.get('/', function (req, res, next) {
    console.log('accessing the index page');
    res.sendFile(path.join(__dirname, 'letter-hunt/003', 'letter-hunt.html'));

});

server.listen(port, function () {
    console.log(`listening on port ${port}`)
});