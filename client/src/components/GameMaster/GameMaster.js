import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Messages from '../Messages/Messages';

let socket;

const GameMaster = ({ location }) => {
    const server = 'localhost:5000';
    const [roomName, setRoomName] = useState('');
    const [masterName, setMasterName] = useState('');
    
    const [serverRes, setServerRes] = useState('');

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [round, setRound] = useState(0);

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [playersInRoom, setPlayersInRoom] = useState([]);

    useEffect(() => {
        const { roomName, masterName } = queryString.parse(location.search);
        socket = io.connect(server);
        setRoomName(roomName);
        setMasterName(masterName);

        socket.emit('createRoom', { roomName, masterName }, (error) => {
            if (error) {
                setError(true);
                setErrorMsg(error);
                console.log(error);
            };
        });
        
        socket.on('playerData', (allPlayersInRoom) => {
            console.log(allPlayersInRoom);
            setPlayersInRoom(allPlayersInRoom); // is empty the first time, but it is set the next time
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

        socket.on('message', (message) => {
            setMessages([...messages, message ]); // use spread operator to send whole array + add the message to it
        });
    }, [messages]); // when messages array changes rerender effect

    // click init game btn and check if there are enough players
    const InitGame = () => {
        socket.emit('ready', (res) => {
            setServerRes(res);
            console.log(res); // game is either initialized or there are not enough players
        });
    };
    
    useEffect(() => {
        socket.on('initGame', () => {
            setRound(0); // init game round to 0
            fetch("https://opentdb.com/api.php?amount=3&type=multiple&encode=url3986")
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

    const ShowQuestion = () => {
        // send first question
        socket.emit('showQuestion', { currentQuestion, currentOptions, round });
        console.log("round", round);
    };
    
    const NextQuestion = () => {
        // update next round question but not if the round is equal to question length
        // because this would request a value in the array that does not exist (Out of bounds)
        if (round !== questions.length) {
            console.log('QUESTIONS', questions);
            getQuestion(questions);
        } else {
            // reached max round - end game
            console.log('game has ended');
            socket.emit('endGame');
        };
    };

    useEffect(() => {
        // check if answer is correct, emit playername to server, if they answered correctly
        socket.on('playerChoice', (playerName, playerChoice, currentRound) => {
            console.log('**************',questions)
            // if it is not undefined
            if(typeof questions[round-1] !== 'undefined' && currentRound === round) {
                console.log('CORRECT ANSWER IS:', decodeURIComponent(correctAnswer));           
                if (playerChoice === decodeURIComponent(correctAnswer)) {
                    console.log(playerName, 'has answered correctly!');
                    // GIVE POINT
                    socket.emit('updateScore', playerName );
                } else {
                    console.log(playerName, 'has NOT answered correctly!');
                    // NO POINT
                }
            }
        });
    }, [round]);


    return(
        <div>
            {error === true ? (
                <div>
                    {errorMsg.error}
                    <a href="/">Go back</a>
                </div>
            ) : (
                <div>
                    <h1>Game master</h1>
                    {serverRes.res}
                    <a href="/">Leave room</a>
                    <h3>Players in room</h3>
                    {playersInRoom.map((playerInfo, index) => 
                        <p key={index}>
                            {playerInfo.username}
                        </p>
                    )}
                    <Messages messages={messages} />
                    <button onClick={InitGame}>Init Game</button>
                    <button onClick={ShowQuestion}>Show question</button>
                    <button onClick={NextQuestion}>Next question</button>
                </div>
            )}
        </div>
    );
};

export default GameMaster;