const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(12345);
// WARNING: app.listen(80) will NOT work here!


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('connected');
    socket.on('createOffer:send', sdp => io.emit('createOffer:received', sdp));
    socket.on('callerCandidate:send', candidate => io.emit('callerCandidate:received',candidate));
    socket.on('calleeCandidate:send', candidate => io.emit('calleeCandidate:received',candidate));
    socket.on('socketAnswer:send', answer => io.emit('socketAnswer:received', answer));
//debugging
    ['createOffer:send', 'callerCandidate:send', 'calleeCandidate:send', 'socketAnswer:send']
        .forEach(e => socket.on(e, (data) => console.log(`event called with e => ${e}data :${JSON.stringify(data)}` )));
});




