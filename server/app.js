const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const PORT = process.env.PORT || 5000;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./routes/router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    pingInterval: 10000,
    pingTimeout: 60000,
    cookie: false
});

app.use(router);

io.on('connect', (socket) => {
    // console.log('new connection', socket.id);
    socket.on('joinGame', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room, score: 0 });
        if (error) return callback(error);
        socket.join(user.room);
        console.log(getUsersInRoom(user.room).length)
        socket.emit('message', { text: `Welcome to the game in ${user.room}, ${user.username}.` })
        socket.broadcast.to(user.room).emit('message', { text: `${user.username} has joined the game!` });
        console.log(user.username, 'has joined room:', room, 'with id:', socket.id);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        
        // call countdown function here if two users has joined

        // setInterval(() => {
        //     io.sockets.emit('state', gameState);
        // }, 1000 / 60);
    
        callback();
    });


    socket.on('gameInfo', ({ user, question, answers}, callback) => {
        socket.broadcast.to(user.room).emit('question', { question: `${question}`});
        socket.broadcast.to(user.room).emit('answers', { answers: `${answers}`});
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
          io.to(user.room).emit('message', { text: `${user.username} has left.` });
          console.log(`${user.username} has left`);
        };
    })
});




server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

