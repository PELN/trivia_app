const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const PORT = 5000;
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingInterval: 10000,
    pingTimeout: 60000,
    cookie: false
});

app.use(cors());
app.use(express.json()); // to be able to get the req.body, res.body as json
const scores = require('./routes/scores');
app.use('/scores', scores);

// MONGO 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/trivia', {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}, console.log('COONNECTED TO MONGO'));

// SOCKET
const uuidv1 = require('uuid/v1');
rooms = [];

io.on('connect', (socket) => {
    console.log('new connection', socket.id);
    
    // GameMaster creates room and joins it
    socket.on('createRoom', ({ roomName, masterName }) => {
        // check if room name exists before it is created
        if (rooms[roomName]) {
            console.log('ROOM NAME ALREADY EXIST');
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
        console.log('****roooms*****', rooms);
    });

    // player joins game that GameMaster has created
    socket.on('joinRoom', ({ joinRoomName, playerName }, callback) => {
        const room = rooms[joinRoomName];
        console.log('player name', playerName);

        // check if rooms array is empty / check if joinRoomName exists in rooms
        if (typeof room === 'undefined' ) {
            console.log('No rooms created with that name');
            return callback({ error: "No rooms created with that name" });
        };
        // check if playername is empty
        if (playerName === '') {
            console.log('You have to fill out player name');
            return callback({ error: "You have to fill out player name" });
        };
        // check if playername already exists in room
        if (room.players[playerName]){
            console.log(playerName, "IS ALREADY IN THE ROOM");
            return callback ({ error: "A player with that name is already in the room" });
        };

        joinRoom(socket, room, playerName);
        callback();
    });

    // function for joining room (used by createRoom and joinRoom)
    const joinRoom = (socket, room, playerName) => {
        room.sockets.push(socket);
        socket.join(room.id, () => {
            // saving info in the socket for later use
            socket.roomId = room.id;
            socket.roomName = room.name;
            socket.username = playerName;
            
            // if it is not the first socket (master), then add player to array
            if(room.sockets.length !== 1){
                const player = { id: socket.id, username: playerName, score: 0 }
                rooms[socket.roomName].players[playerName] = player; // structure rooms array with keys of roomName and playerName
            };

            socket.emit('message', { text: `Welcome ${playerName} to the game in ${room.name}.` });
            socket.broadcast.to(room.id).emit('message', { text: `${playerName} has joined the game!` });

            // show all players in the room to everyone
            allPlayersInRoom = Object.values(room.players);
            io.to(room.id).emit('playerData', allPlayersInRoom);
        });
    };

    // let GameMaster know if there are enough players to emit 'initGame', which will fetch from API
    socket.on('ready', (callback)  => {
        const room = rooms[socket.roomName];
        if (room.sockets.length > 2) {
            for (const client of room.sockets) {
                client.emit('initGame');
                console.log("Doing solid work", room.sockets.length);
                callback({ res: "Game initialized - Click start game" });
            }
        } else {
            console.log('not enough users to start game');
            callback({ res: "Not enough users to start game - needs at least 2 players" });
        }
        callback();
    });

    // GameMaster emits the question to server, and server broadcasts question to all players
    socket.on('showQuestion', ({ currentOptions, currentQuestion, round }) => {
        socket.broadcast.to(socket.roomId).emit('currentRound', {question: `${currentQuestion}`}, currentOptions, round);
    });

    // emit player choice from GameQuestion to GameMaster
    socket.on('playerChoice', ({ playerName, choice, currentRound }) => {
        console.log('player name:', playerName, '|', 'choice:', choice, '|', 'round:', currentRound);
        const room = rooms[socket.roomName];
        room.sockets[0].emit('playerChoice', playerName, choice, currentRound); // the first socket is game master
    });

    // increment score for player when they answered correctly
    socket.on('updateScore', (playerName) => {
        const room = rooms[socket.roomName];
        room.players[playerName].score += 1;
        console.log('player score', room.players[playerName].score);
    });

    // GameMaster emits endGame, and scores are send
    socket.on('endGame', () => {
        // send scores back to all players
        const room = rooms[socket.roomName];
        res = Object.values(room.players); // to send array with keys that has objects as values
        console.log('GAME END SCORES', res);
        io.to(room.id).emit('scores', res);

        // send individual score to each client - to save score
        for (const client of res) {
            socket.to(client.id).emit("finalPlayerInfo", client);
        };
    });
    
    socket.on('disconnect', () => {
        console.log('user left with socket id', socket.id);
        // console.log(rooms[socket.roomName].sockets[0].id);
        const room = rooms[socket.roomName];
        // if room has been deleted when master leaving the game
        if(typeof room == "undefined") {
            console.log('room does not exist, leave the room');
        } else {
            const room = rooms[socket.roomName];
            console.log(room.players);
            // if room exists, delete player from players array in that room
            // when refreshing master page, the room is deleted, so there are not any sockets in the room
            if(room.sockets[0].id !== socket.id){
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


