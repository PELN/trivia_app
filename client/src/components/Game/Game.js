// waiting room for game start
import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Messages from '../Messages/Messages';
import RoomInfo from '../RoomInfo/RoomInfo';
import GameStart from '../GameStart/GameStart';
import { Link } from 'react-router-dom';

let socket;

const Game = ({ location }) => {
    const server = 'localhost:5000';
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect( () => {
        const { username, room } = queryString.parse(location.search);
        socket = io.connect(server)

        setUsername(username);
        setRoom(room);

        socket.emit('joinGame', { username, room }, (error) => {
            console.log(`${username} has joined the game in ${room}, with id: ${socket.id}`);
            if (error) {
                setError(true);
                setErrorMsg(error);
                console.log(error);
            };
        });

        return () => {
            socket.emit('disconnect');
            socket.disconnect();
        };
    }, [server, location.search]); //only rerender useEffect if any of these changes

    useEffect( () => {
        socket.on('message', (text) => {
            setMessage(text);
        });

        socket.on('roomData', ({ users }) => {
            setUsers(users);
        })
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message ]); // use spread operator to send whole array + add the message to it
        });
    }, [messages]); //when messages array changes rerender effect

    console.log('***** users *******',users);
    // console.log('message', message);
    // console.log('messages', messages);

    return(
        <div>
            { error === false ? (
                <div>
                    <h1>Game start</h1>
                    <RoomInfo room={room} users={users}/>
                    <Messages messages={messages} />
                    <GameStart users={users}/>
                </div>
            ) : (
                <div>
                    <h1>Go back</h1>
                    {errorMsg}
                    <div><Link to={'/'}>Go Back</Link></div>
                </div>
                )
            }
        </div>
    );
};

export default Game;