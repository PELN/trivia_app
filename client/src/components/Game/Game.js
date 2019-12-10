// waiting room for game start
import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Messages from '../Messages/Messages';
import RoomInfo from '../RoomInfo/RoomInfo';
import GameStart from '../GameStart/GameStart';

let socket;

const Game = ({ location }) => {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
  
    const server = 'localhost:5000';

    // retrieve data that user has entered in JoinGame and set states
    useEffect( () => {
        const { username, room } = queryString.parse(location.search);
        socket = io.connect(server)

        setUsername(username);
        setRoom(room);

        socket.emit('joinGame', { username, room }, (error) => {
            console.log(`${username} has joined the game in ${room}, with id: ${socket.id}`);
            if (error) {
                alert(error);
                // user shouldn't be redirected to game page, if username is taken
                // find out how join link can be made different and still send params
            }
        });

        return () => {
            socket.emit('disconnect');
            socket.disconnect();
        }
    }, [server, location.search]); //only rerender useEffect if any of these changes

    useEffect( () => {
        socket.on('message', (text) => {
            setMessage(text);
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        })
    }, []); //when messages array changes rerender effect

    useEffect(() => {
        socket.on('message', (message) => {
            // use spread operator to send whole array + add the message to it
          setMessages([...messages, message ]);
        });
    }, [messages]);

    console.log('***** users *******',users);
    // console.log('message', message);
    // console.log('messages', messages);

    return(
        <div>
            <h1>Game start</h1>
            <RoomInfo room={room} users={users}/>
            <Messages messages={messages} />
            <GameStart/>
        </div>
    );
};

export default Game;