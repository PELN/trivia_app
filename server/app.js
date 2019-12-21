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
    
    // game master creates room and joins it
    socket.on('createRoom', ({ roomName, masterName }, callback) => {
        // check if room name exists before it is created
        if (rooms[roomName]) {
            console.log('ROOM NAME ALREADY EXIST');
            return callback({ error: "Room already exists with that name, try another!" });
        }

        const room = {
            id: uuidv1(),
            name: roomName,
            sockets: [],
            players: []
        };
        rooms[roomName] = room;


        joinRoom(socket, room, masterName);
        console.log('****roooms*****', rooms);

        callback();
    });

    // player joins game that game master has created
    socket.on('joinRoom', ({ joinRoomName, playerName }, callback) => {
        const room = rooms[joinRoomName];
        console.log('player name', playerName);

        // check if rooms array is empty AND check if joinRoomName exists in rooms
        if (typeof room === 'undefined' ) {
            console.log('No rooms created with that name');
            return callback({ error: "No rooms created with that name" });
        };
        // check if player has input a name
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
            // saving room info to communicate with later (don't have to pass variables around with the info)
            socket.roomId = room.id;
            socket.roomName = room.name;
            socket.username = playerName;
            
            // if it is not the first user (master), then add user to array
            if(room.sockets.length !== 1){
                const player = { id: socket.id, username: playerName, score: 0 }
                rooms[socket.roomName].players[playerName] = player; // structure rooms array with keys of roomName and playerName
                // console.log('hellooo', room.players[playerName].username);
            };

            // console.log(socket.id, "Joined room:", room.id);
            socket.emit('message', { text: `Welcome ${playerName} to the game in ${room.name}.` });
            socket.broadcast.to(room.id).emit('message', { text: `${playerName} has joined the game!` });

            allPlayersInRoom = Object.values(room.players);
            io.to(room.id).emit('playerData', allPlayersInRoom);
        });
    };

    // let master know if there are enough players to emit 'initGame', which will fetch from API
    socket.on('ready', (callback)  => {
        // console.log('SOCKET NAME',roomName);
        const room = rooms[socket.roomName];
        // console.log('ROOOOOM', room);
        // console.log("Coming through");
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

    // emit player choice from GameQuestion to GameMaster, the first socket
    socket.on('playerChoice', ({ playerName, choice, currentRound }) => {
        console.log('player name:', playerName, '|||||', 'choice:', choice, '||||||', currentRound);
        const room = rooms[socket.roomName];
        room.sockets[0].emit('playerChoice', playerName, choice, currentRound);
    });

    // get playerName from GameMaster, set score for player in players array
    socket.on('updateScore', (playerName) => {
        const room = rooms[socket.roomName];
        room.players[playerName].score += 1;
        // console.log(room.players[playerName]);
    });

    socket.on('endGame', () => {
        // send scores back to user
        const room = rooms[socket.roomName];
    
        res = Object.values(room.players); // to send the array with keys that has objects as values
        console.log('GAME END SCORES', res);
        io.to(room.id).emit('scores', res);

        for (const client of res) {
            // console.log('hello client',client);
            socket.to(client.id).emit("finalPlayerInfo", client);
        };
    });
    
    socket.on('disconnect', () => {
        console.log('user left with socket id', socket.id);
        // console.log(rooms[socket.roomName].sockets[0].id);
        // if room has been deleted when master leaving the game
        if(typeof rooms[socket.roomName] == "undefined") {
            console.log('room does not exist');
        } else {
            // if room exists
            if(rooms[socket.roomName].sockets[0].id !== socket.id){
                console.log(rooms[socket.roomName].players[socket.username].username, 'has left');
                socket.broadcast.to(socket.roomId).emit('message', { text: `${rooms[socket.roomName].players[socket.username].username} has left the game!` });
        
                res = Object.values(rooms[socket.roomName].players);
                delete rooms[socket.roomName].players[socket.username];
        
                const room = rooms[socket.roomName];
                allPlayersInRoom = Object.values(room.players);
                io.to(room.id).emit('playerData', allPlayersInRoom);
            } else {
                // send msg to players that master left
                console.log(rooms[socket.roomName].sockets[0].username, 'has left');
                socket.broadcast.to(socket.roomId).emit('message', { text: `The gamemaster ${rooms[socket.roomName].sockets[0].username} has left the game! Please leave the room.` });
    
                const room = rooms[socket.roomName];
                // remove room from rooms
                delete rooms[room.name];
                console.log(rooms);
            }
        }


    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


