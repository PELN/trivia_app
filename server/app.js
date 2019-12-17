const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const PORT = 5000;

const router = require('./routes/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingInterval: 10000,
    pingTimeout: 60000,
    cookie: false
});

const uuidv1 = require('uuid/v1');

app.use(router);
rooms = [];

io.on('connect', (socket) => {
    console.log('new connection', socket.id);
    
    // game master creates room and joins it
    socket.on('createRoom', ({ roomName, masterName }, callback) => {
        const room = {
            id: uuidv1(),
            name: roomName,
            sockets: [],
            players: []
        };
        rooms[roomName] = room;
        joinRoom(socket, room, masterName);
        console.log('****roooms*****', rooms);
        console.log('master name:', masterName);
        callback();
    });

    // player joins game that game master has created
    socket.on('joinRoom', ({ joinRoomName, playerName }, callback) => {
        // console.log('***ROOMS***', rooms);
        // console.log('***ROOMNAME***', joinRoomName);
        const room = rooms[joinRoomName];
        // console.log('***ROOM***', room);
        console.log('player name', playerName);

        // check if rooms array is empty
        // check if joinRoomName exists in rooms
        if (typeof room === 'undefined' ) {
            console.log('No rooms created with that name');
            return callback({error: "No rooms created with that name"});
        };
        // check if player has input a name
        if (playerName === '') {
            console.log('You have to fill out player name');
            return callback({error: "You have to fill out player name"});
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

            // if it is not the first user (master), then add user to array
            if(room.sockets.length !== 1){
                const player = { id: socket.id, username: playerName, score: 0 }
                rooms[socket.roomName].players[playerName] = player; // structure rooms array with keys of roomName and playerName
            };

            console.log(socket.id, "Joined room:", room.id);
            socket.emit('message', { text: `Welcome ${playerName} to the game in ${room.name}.` });
            socket.broadcast.to(room.id).emit('message', { text: `${playerName} has joined the game!` });
            // io.to(room.id).emit('playerData', { players: room.players });
            // console.log('!!!!!!! LOOK', room.id, room.players)
        });
    };

    // let master know if there are enough players to emit 'initGame', which will fetch from API
    socket.on('ready', (callback)  => {
        // console.log('SOCKET NAME',roomName);
        const room = rooms[socket.roomName];
        // console.log('ROOOOOM', room);
        console.log("Coming through")
        if (room.sockets.length > 2) {
            for (const client of room.sockets) {
                client.emit('initGame');
                console.log("Doing solid work", room.sockets.length);
                callback({error: "Game initialized - Click start game"}); // SHOULD NOOT BE ERROR, CHANGE TO MSG?
            }
        } else {
            console.log('not enough users to start game');
            callback({error: "Not enough users to start game - needs at least 2 players"});
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
        rooms[socket.roomName].sockets[0].emit('playerChoice', playerName, choice, currentRound);
    });

    // get playerName from GameMaster, set score for player in players array
    socket.on('updateScore', (playerName) => {
        const room = rooms[socket.roomName];
        room.players[playerName].score += 1;
        console.log(room.players[playerName]);
    });

    socket.on('endGame', () => {
        // send scores back to user
        // if score is a tie: emit 'its a tie'
        const room = rooms[socket.roomName];
        // console.log(room.players[playerName]);
    
        res = Object.values(room.players); // to send the array with keys that has objects as values
        console.log('GAME END SCORES', res);
        io.to(room.id).emit('scores', res);
    });
    
    socket.on('disconnect', () => {
        // console.log('user left');
        // console.log(socket.id);

        // const room = rooms[socket.roomName];
        // io.to(room.id).emit('message', { text: `${playerName} has left.` });
        // console.log(`${playerName} has left`);
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


