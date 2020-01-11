const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const PORT = 5000;
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingInterval: 10000, // check how often
    pingTimeout: 60000, // until close connection
    cookie: false
});

// middleware: methods/functions between request and response
app.use(cors());
app.use(express.json()); // POST req, get incoming data from body as JSON (req.body)
const scores = require('./routes/scores');
app.use('/scores', scores); // use route for api

// MONGO 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/trivia', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.catch((err) => {
    console.log(err);
});

// SOCKET
const uuidv1 = require('uuid/v1');
rooms = [];

io.on('connect', (socket) => {
    console.log('new connection', socket.id);
    
    // GameMaster creates room and joins it
    socket.on('createRoom', ({ roomName, masterName }, callback) => {
        // check if room name exists before it is created
        if (rooms[roomName]) {
            return callback({ error: "Room already exists with that name, try another!" });
        }
        // create room object
        const room = {
            id: uuidv1(),
            name: roomName,
            sockets: [],
            players: []
        };
        rooms[roomName] = room;

        joinRoom(socket, room, masterName);
    });

    // player joins game that GameMaster has created
    socket.on('joinRoom', ({ joinRoomName, playerName }, callback) => {
        const room = rooms[joinRoomName];

        // check if rooms array is empty / check if joinRoomName exists in rooms
        if (typeof room === 'undefined' ) {
            return callback({ error: "No rooms created with that name" });
        };
        // check if playername is empty
        if (playerName === '') {
            return callback({ error: "You have to fill out player name" });
        };
        // check if playername already exists in room
        if (room.players[playerName]){
            return callback ({ error: "A player with that name is already in the room" });
        };

        joinRoom(socket, room, playerName);
        callback();
    });

    // function for joining room (used by createRoom and joinRoom)
    const joinRoom = (socket, room, playerName) => {
        socket.join(room.id, () => {
            room.sockets.push(socket);
            // saving info in the socket for later use to identify each user
            socket.roomId = room.id;
            socket.roomName = room.name;
            socket.username = playerName;
            
            // if it is not the first socket (master), then add player to players
            if(room.sockets.length !== 1) {
                const player = { id: socket.id, username: playerName, score: 0 }
                rooms[socket.roomName].players[playerName] = player; // playerName as key and player object as value
            };

            socket.emit('message', { text: `Welcome ${playerName} to the game in ${room.name}.` });
            socket.broadcast.to(room.id).emit('message', { text: `${playerName} has joined the game!` });

            // show all players in the room to everyone
            allPlayersInRoom = Object.values(room.players); // to send value from key/value obj in socket, bug in socket
            io.to(room.id).emit('playerData', allPlayersInRoom);
        });
    };

    // let GameMaster know if there are enough players to emit 'initGame', to fetch API
    socket.on('ready', (callback)  => {
        const room = rooms[socket.roomName];
        if (room.sockets.length > 2) {
            for (const client of room.sockets) {
                client.emit('initGame');
                callback({ res: "Game initialized - Click Show question to begin" });
            }
        } else {
            callback({ res: "Not enough users to start game - needs at least 2 players" });
        }
    });

    // GameMaster emits the question to server, and server broadcasts question to all players
    socket.on('showQuestion', ({ gameQuestion, gameOptionsArray, gameRound }) => {
        socket.broadcast.to(socket.roomId).emit('currentRound', { question: `${gameQuestion}` }, gameOptionsArray, gameRound);
    });

    // emit player choice from GameQuestion to GameMaster
    socket.on('playerChoice', ({ playerName, choice, currentRound }) => {
        const room = rooms[socket.roomName];
        room.sockets[0].emit('playerChoice', playerName, choice, currentRound); // the first socket is game master
    });

    // increment score for player when they answered correctly
    socket.on('updateScore', (playerName) => {
        const room = rooms[socket.roomName];
        room.players[playerName].score += 1;
        // console.log('player score', room.players[playerName].score);
    });

    // GameMaster emits endGame, and scores are send
    socket.on('endGame', () => {
        // send scores back to all players
        const room = rooms[socket.roomName];
        res = Object.values(room.players); // to send array with keys that has objects as values
        // console.log('GAME END SCORES', res);
        io.to(room.id).emit('scores', res);

        // send individual score to each client - to save score
        for (const client of res) {
            socket.to(client.id).emit("finalPlayerInfo", client);
        };
    });
    
    socket.on('disconnect', () => {
        console.log('User left with socket id', socket.id);
        // console.log(rooms[socket.roomName].sockets[0].id);
        const room = rooms[socket.roomName];
        // if room has been deleted when master leaving the game
        if(typeof room == "undefined") {
            console.log('Room does not exist, leave the room');
        } else {
            const room = rooms[socket.roomName];
            // if room exists, delete player from players array in that room
            // when refreshing master page, the room is deleted, so there are not any sockets in the room
            if(room.sockets[0].id !== socket.id) {
                console.log(room.players[socket.username].username, 'has left');
                socket.broadcast.to(socket.roomId).emit('message', { text: `${room.players[socket.username].username} has left the game!` });
                
                // remove player from players array
                delete room.players[socket.username];
                
                // update room players array
                allPlayersInRoom = Object.values(room.players);
                io.to(room.id).emit('playerData', allPlayersInRoom);
            } else {
                const room = rooms[socket.roomName];

                // send msg to players that master left
                console.log(room.sockets[0].username, 'has left');
                socket.broadcast.to(socket.roomId).emit('message', { text: `The gamemaster ${room.sockets[0].username} has left the game! Please leave the room.` });
                
                // remove room from rooms
                delete rooms[room.name];
            };
        };
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


