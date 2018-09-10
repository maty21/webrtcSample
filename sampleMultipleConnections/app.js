const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const staticPath = `${__dirname}/public`;
// WARNING: app.listen(80) will NOT work here!

app.use(express.static(`${__dirname}/public`))
app.get('/pleasedont0526561432', (req, res) => {
    res.sendFile(staticPath + '/callee.html');
});
app.get('/', (req, res) => {
    res.json({stop:'stop'});
});

app.get('/caller', (req, res) => {
    res.sendFile(staticPath + '/caller.html');
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


server.listen(3001);


