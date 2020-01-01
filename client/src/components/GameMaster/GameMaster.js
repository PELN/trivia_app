import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import io from 'socket.io-client';
import Messages from '../Messages/Messages';
import './GameMaster.css';

let socket;

const GameMaster = ({ location }) => {
    const server = 'localhost:5000';
    const [roomName, setRoomName] = useState('');
    const [masterName, setMasterName] = useState('');
    
    const [serverResMsg, setServerResMsg] = useState({res: 'When at least 2 players are in the room, click Init Game'});

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

    const InitGame = () => {
        socket.emit('ready', (res) => {
            setServerResMsg(res);
            console.log(res);
        });
    };
    
    const ShowQuestion = () => {
        // send first question
        socket.emit('showQuestion', { currentQuestion, currentOptions, round });
        console.log("Current question", currentQuestion, currentOptions, round);
        setServerResMsg({res:'Question is now being showed to players'});
    };
    
    const NextQuestion = () => {
        // update next round question but not if the round(5) is equal to question length(5)
        // because this would request a value in the array that does not exist (Out of bounds)
        if (round !== questions.length) {
            console.log(questions);
            getQuestion(questions);
        } else {
            // reached max round - end game
            console.log('game has ended');
            socket.emit('endGame');
            setServerResMsg({res: 'Game has ended! If you want to play again, click Init Game'});
        };
    };

    useEffect(() => {
        socket.on('initGame', () => {
            setRound(0); // init game to 0
            const response = fetch("https://opentdb.com/api.php?amount=3&type=multiple&encode=url3986")
                .then(response => response.json())
                .then(res => {
                    console.log("This is res and round",res, round);
                    setQuestions(res.results);
                    getQuestion(res.results);
            });
        });
    }, []);

    useEffect(() => {
        // check if answer is correct for each round, emit playername to server, if they answered correctly
        socket.on('playerChoice', (playerName, playerChoice, currentRound) => {
            // if it is not undefined
            if(typeof questions[round-1] !== 'undefined' && currentRound === round) {
                console.log('CORRECT ANSWER IS:', decodeURIComponent(correctAnswer));           
                if (playerChoice === decodeURIComponent(correctAnswer)) {
                    console.log(playerName, 'has answered correctly!');    
                    // GIVE POINT
                    socket.emit('updateScore', playerName);
                } else {
                    console.log(playerName, 'has NOT answered correctly!');
                    // NO POINT
                };
            };
            setServerResMsg({res: 'When all players has answered, click Next question, then click Show question'});
        });
    }, [round]);

    // function that gets/sets the question obj
    const getQuestion = (questionObj) => {
        setCurrentQuestion(questionObj[round].question);
        const incorrectOptions = questionObj[round].incorrect_answers;
        const correctOption = questionObj[round].correct_answer;

        // array of options where correct option is in random position
        const randomOptionsArray = [...incorrectOptions];
        const position = Math.floor(Math.random() * 3) + 1; // random index between 0 and 3
        randomOptionsArray.splice(position -1, 0, correctOption); // correct option in random position // splice returns removed items and changes original array
        console.log('random options array', randomOptionsArray);
        setCorrectAnswer(correctOption);
        setCurrentOptions(randomOptionsArray);

        setRound(prevRound => {return prevRound + 1}); // function that increments the round
    };

    return (
        <Container>
            <div className="wrapper">
                {error === true ? (
                    <div className="errorMsg">
                        <p>{errorMsg.error}</p>
                        <a href="/">Go back</a>
                    </div>
                ) : (
                    <div>
                        <h2>Hello, Game Master {masterName}!</h2>
                        <div className="serverRes"><strong>{serverResMsg.res}</strong></div>
                        <div className="button-container">
                            <Button variant="primary" size="md" onClick={InitGame}>Init Game</Button>
                            <Button variant="primary" size="md" onClick={ShowQuestion}>Show question</Button>
                            <Button variant="primary" size="md" onClick={NextQuestion}>Next question</Button>
                        </div>
                        <div className="players-container">
                            <h3 className="h3-players">Players in room</h3>
                            {playersInRoom.map((playerInfo, index) => 
                                <p key={index}>
                                    Playername: {playerInfo.username}
                                </p>
                            )}
                        </div>
                        <div className="messages-container">
                            <h3>Activity</h3>
                            <Messages messages={messages}/>
                        </div>
                        <a href="/">Leave room</a>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default GameMaster;