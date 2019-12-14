import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import Messages from '../Messages/Messages';

let socket;

const GameMaster = ({ location }) => {
    const server = 'localhost:5000';
    const [roomName, setRoomName] = useState('');
    const [masterName, setMasterName] = useState('');
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    // const [gameStart, setGameStart] = useState(false);

    useEffect(() => {
        const { roomName, masterName } = queryString.parse(location.search);
        socket = io.connect(server);

        setRoomName(roomName);
        setMasterName(masterName);
        console.log('room:', roomName, 'name:', masterName);

        socket.emit('createRoom', { roomName, masterName }, () => {
            console.log(`****** WELCOME to room: ${roomName}, ${masterName} with id: ${socket.id}`);
        });

        return () => {
            socket.emit('disconnect');
            socket.disconnect();
        };

    }, [server, location.search]);

    useEffect(() => {
        socket.on('message', (text) => {
            setMessage(text);
        });
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message ]); // use spread operator to send whole array + add the message to it
        });
    }, [messages]); //when messages array changes rerender effect


    const GameStart = () => {
        //fetch api
        socket.emit('ready', { roomName }, () => {
        });
    };
    



    return(
        <div>
            <h1>Game master</h1>
            <Messages messages={messages} />
            <button onClick={GameStart}>Start Game</button>
        </div>
    );
}

export default GameMaster;