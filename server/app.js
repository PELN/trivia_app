const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const PORT = 5000;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
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
    

    socket.on('createRoom', ({ roomName, masterName }, callback) => {
        const room = {
            id: uuidv1(),
            name: roomName,
            sockets: [],
            players: []
        };
        rooms[roomName] = room;
        joinRoom(socket, room);
        console.log('****roooms*****', rooms);
        console.log('master name:', masterName);
        callback();
    });


    socket.on('joinRoom', ({ joinRoomName, playerName }, callback) => {
        // console.log('***ROOMS***', rooms);
        // console.log('***ROOMNAME***', joinRoomName);
        const room = rooms[joinRoomName];
        // console.log('***ROOM***', room);

        console.log('player name', playerName);
        joinRoom(socket, room, playerName);
        callback();
    });

    const joinRoom = (socket, room, playerName) => {
        room.sockets.push(socket);
        socket.join(room.id, () => {
            socket.roomId = room.id;
            socket.roomName = room.name;

            // if it is not the first user (master), then add user to array
            if(room.sockets.length !== 1){
                // push users to array, set score to 0
                // socket.id is not the same!!!!
                const player = { id: socket.id, username: playerName, score: 0 }
                room.players.push(player);
                console.log(room.players);
            }

            console.log(socket.id, "Joined room:", room.id);
            socket.emit('message', { text: `Welcome ${playerName} to the game in ${room.name}.` });
            socket.broadcast.to(room.id).emit('message', { text: `${playerName} has joined the game!` });
        });
    };


    socket.on('ready', ({ roomName }) => {
        console.log(socket.id, 'is ready!!');
        // console.log('SOCKET NAME',roomName);
        const room = rooms[roomName];
        // console.log('ROOOOOM', room);
        if (room.sockets.length > 2) {
            for (const client of room.sockets) {
                client.emit('initGame', { text: `The game begins.` });
            };
        } else {
            console.log('not enough users to start game');
        }
    });




    // socket.on('joinGame', ({ username, room }, callback) => {
    //     const { user, error } = addUser({ id: socket.id, username, room, score: 0 });
    //     if (error) return callback(error);
    //     socket.join(user.room);

    //     console.log(getUsersInRoom(user.room).length)

    //     socket.emit('message', { text: `Welcome to the game in ${user.room}, ${user.username}.` })
    //     socket.broadcast.to(user.room).emit('message', { text: `${user.username} has joined the game!` });
    //     console.log(user.username, 'has joined room:', room, 'with id:', socket.id);

    //     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        
    //     socket.on('gameInfo', ({ user, question, answers}, callback) => {
    //         socket.broadcast.to(user.room).emit('question', { question: `${question}`});
    //         socket.broadcast.to(user.room).emit('answers', { answers: `${answers}`});
    //         callback();
    //     });

    //     callback();
    // });




    socket.on('disconnect', () => {
        // console.log('user left');
        // console.log(socket.id);
        // delete socket[socket.id];

        // io.to(room.id).emit('message', { text: `${playerName} has left.` });
        // console.log(`${playerName} has left`);
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


