var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function () {
    console.log('A user has been connected');
});

http.listen('3000', function () {
    console.log('Server started! Port is 3000');
});