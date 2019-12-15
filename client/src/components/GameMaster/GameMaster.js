import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import Messages from '../Messages/Messages';

let socket;

const GameMaster = ({ location }) => {
    const server = 'localhost:5000';
    const [roomName, setRoomName] = useState('');
    const [masterName, setMasterName] = useState('');
    
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // const [gameStart, setGameStart] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(''); // index 0, first question object?
    const [currentOptions, setCurrentOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [round, setRound] = useState(0);

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
    console.log(messages);


    const InitGame = () => {
        console.log("initializing game")
        socket.emit('ready', (error) => {
            if (error) {
                setError(true);
                setErrorMsg(error);
                console.log(error);
            };
        });
    };
    
    const StartGame = () => {
        console.log("Current options", currentOptions);
        // send first question
        socket.emit('startGame', { currentQuestion, currentOptions, round }, () => {});
        console.log("round", round);
        // update next round question but not if the round(5) is equal to question length(5)
        // because this would request a value in the array that does not exist (Out of bounds)
        if (round !== questions.length) {
            setCurrentQuestion(questions[round].question);
            const options = questions[round].incorrect_answers
            const correctAnswer = questions[round].correct_answer
            setCurrentOptions([...options, correctAnswer]); //correctAnswer has to have random position
            setCorrectAnswer(correctAnswer);
            setRound(round + 1);   
        };
    };

    useEffect(() => {
        socket.on('initGame', () => {
            //fetch api
            setRound(0); // init game to 0
            const response = fetch("https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986")
                .then(response => response.json())
                .then(res => {
                    console.log(res);
                    setQuestions(res.results);
                    setCurrentQuestion(res.results[round].question);
                    const options = res.results[round].incorrect_answers;
                    const correctAnswer = res.results[round].correct_answer;
                    setCurrentOptions([...options, correctAnswer]); //correctAnswer has to have random position
                    setRound(round + 1);
            });
        });
    }, []);


    return(
        <div>
            <h1>Game master</h1>
            {errorMsg.error}
            <Messages messages={messages} />
            <button onClick={InitGame}>Init Game</button>
            <button onClick={StartGame}>Start Game</button>
        </div>
    );
}

export default GameMaster;