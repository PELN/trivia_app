import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import Messages from '../Messages/Messages';

let socket;

const GamePlayer = ({ location }) => {
    const server = 'localhost:5000';
    const [joinRoomName, setJoinRoomName] = useState('');
    const [playerName, setPlayerName] = useState('');
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);

    useEffect(() => {
        const { joinRoomName, playerName } = queryString.parse(location.search);
        socket = io.connect(server);

        setJoinRoomName(joinRoomName);
        setPlayerName(playerName);
        console.log('room:', joinRoomName, 'name:', playerName);
    
        socket.emit('joinRoom', { joinRoomName, playerName }, () => {
            console.log(`****** WELCOME to room: ${joinRoomName}, ${playerName} with id: ${socket.id}`)
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

    useEffect(() => {
        socket.on('currentRound', (currentQuestion, currentOptions, currentRound) => {
            console.log(currentQuestion)
            console.log(currentOptions)
            console.log(currentRound)

            setCurrentQuestion(currentQuestion);
            setCurrentOptions(currentOptions);
            setCurrentRound(currentRound);
        });
    },[currentQuestion]);
    return(
        <div>
            <h1>Game player</h1>
            <Messages messages={messages} />
            <h3>Category: {decodeURIComponent(currentQuestion.category)}</h3>
            <h1>Question: {decodeURIComponent(currentQuestion.question)}</h1>
            
            <div className="container">
                {currentOptions.map((option, index) => 
                    <div className="choice-container" key={index}>
                        <p className="choice-text" key={index}>
                            {decodeURIComponent(option)}
                        </p>
                    </div>
                    )
                }
            </div>
        </div>
    );
}

export default GamePlayer;