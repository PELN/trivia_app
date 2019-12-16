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

    const [score, setScore] = useState([]);
    
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
    // console.log(messages);


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
    
    const ShowQuestion = () => {
        console.log("Current options", currentOptions);
        // send first question
        socket.emit('ShowQuestion', { currentQuestion, currentOptions, round }, () => {});
        console.log("round", round);        
    };
    
    const NextQuestion = () => {
        // update next round question but not if the round(5) is equal to question length(5)
        // because this would request a value in the array that does not exist (Out of bounds)
        if (round !== questions.length) {
            console.log(questions);
            getQuestion(questions);
        };
    };

    useEffect(() => {
        socket.on('initGame', () => {
            setRound(0); // init game to 0
            const response = fetch("https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986")
                .then(response => response.json())
                .then(res => {
                    console.log("This is res and round",res, round);
                    setQuestions(res.results);
                    getQuestion(res.results);
            });
        });
    }, []);


    const getQuestion = (questionObj) => {
        setCurrentQuestion(questionObj[round].question);
        const options = questionObj[round].incorrect_answers;
        const correctOption = questionObj[round].correct_answer;
        setCurrentOptions([...options, correctOption]); //correctAnswer has to have random position
        setCorrectAnswer(correctOption);
        setRound(prevRound => {return prevRound + 1}); // function that increments the round
    };

    // check if playerChoice is correct
    useEffect(() => {
        socket.on('playerChoice', (playerName, playerChoice, currentRound) => {
            // console.log("This is question", questions[round-1]);
            // console.log("Current Question here", currentQuestion);
            // console.log(playerName, playerChoice);
            // console.log(round);

            // if it is not undefined
            if(typeof questions[round-1] !== 'undefined' && currentRound === round) {
                console.log('CORRECT ANSWER IS:', decodeURIComponent(correctAnswer));           
                if (playerChoice === decodeURIComponent(correctAnswer)) {
                    console.log(playerName, 'has answered correctly!');
                    // GIVE POINT

                    // create object (for each player) and push it to empty array of scores
                    // increment score if answer is correct
                    // [ scores: {player: playerName, score: 0}, {player: playerName, score: 0}]
                    // setScore
                    // delete score from player object in app.js ???? 

                } else {
                    console.log(playerName, 'has NOOOT answered correctly!');
                    // DONT GIVE POINT
                }
            }
        });
    },[round]);



    return(
        <div>
            <h1>Game master</h1>
            {errorMsg.error}
            <Messages messages={messages} />
            <button onClick={InitGame}>Init Game</button>
            {/* if game has ended (length of questions = 5), change button to 'next' instead of 'start' */}
            <button onClick={ShowQuestion}>Show question</button> {/* This button used to be start game */}
            <button onClick={NextQuestion}>Next question</button>
        </div>
    );
};

export default GameMaster;