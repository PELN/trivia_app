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
    

    socket.on('createRoom', ({ roomName }, callback) => {
        const room = {
            id: uuidv1(),
            name: roomName,
            sockets: [],
            users: []
        };
        rooms[roomName] = room;
        joinRoom(socket, room);
        console.log('****roooms*****', rooms);
        callback();
    });


    socket.on('joinRoom', ({ joinRoomName }, callback) => {
        console.log('***ROOMS***', rooms);
        console.log('***ROOMNAME***', joinRoomName);

        const room = rooms[joinRoomName];
        console.log('***ROOM***', room);

        joinRoom(socket, room);
        callback();
    });

    const joinRoom = (socket, room) => {
        room.sockets.push(socket);
        socket.join(room.id, () => {
            socket.roomId = room.id;
            socket.roomName = room.name;

            // if(room.sockets.length !== 1){
            // }

            console.log(socket.id, "Joined room:", room.id);
            socket.emit('message', { text: `Welcome to the game in ${room.name}.` });
        });
    };


    socket.on('ready', ({ roomName }) => {
        console.log(socket.id, 'is ready!!');
        console.log('SOCKET NAME',roomName);
        const room = rooms[roomName];
        console.log('ROOOOOM', room);
        if (room.sockets.length > 2) {
            for (const client of room.sockets) {
                client.emit('initGame', { text: `The game begins.` });
            };
        };
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
        // delete client[socket.id];
        // if(user) {
        //   io.to(user.room).emit('message', { text: `${user.username} has left.` });
        //   console.log(`${user.username} has left`);
        // };
    });
});


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


