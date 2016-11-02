var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendfile('index.html');
});

io.on('connection', function(socket) {
    console.log('a smartphone connected');
    socket.on('disconnect', function() {
        console.log('smartphone disconnected');
    });

    socket.on('codescan', function(msg) {
        io.emit('codescan', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', function(socket) {
    socket.on('codescan', function(msg) {
        console.log('codescan: ' + msg);
    });
});