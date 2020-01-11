import React, { useEffect, useState } from 'react';
import queryString from 'query-string';
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
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [round, setRound] = useState(0);

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [playersInRoom, setPlayersInRoom] = useState([]);

    useEffect(() => {
        const { roomName, masterName } = queryString.parse(location.search); // parse query to object and destructure it
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
        });
    };

    useEffect(() => {
        socket.on('initGame', () => {
            setRound(0);
            const response = fetch("https://opentdb.com/api.php?amount=3&type=multiple&encode=url3986")
                .then(response => response.json())
                .then(res => {
                    setQuestions(res.results);
                    sendQuestion(res.results);
            });
        });
    }, []);

    const sendQuestion = (questionObj) => {
        const gameQuestion = questionObj[round].question;
        const incorrectOptions = questionObj[round].incorrect_answers;
        const correctOption = questionObj[round].correct_answer;

        // array of options where correct option is in random position
        const gameOptionsArray = [...incorrectOptions];
        const randomNumber = Math.random() * 3; // get random number between 0 and 1 (multiply with 3)
        const position = Math.floor(randomNumber) + 1; // round randomNumber down and add 1 to it
        gameOptionsArray.splice(position -1, 0, correctOption); // splice returns removed items from array (start pos, deleteCount)
        setCorrectAnswer(correctOption);
        
        // update value in useState for next round like a queue
        setRound(prevRound => {return prevRound + 1}); // prevRound: parameter holding the round number 

        const gameRound = round + 1; // show round value from 1 for the player, not 0
        socket.emit('showQuestion', { gameQuestion, gameOptionsArray, gameRound });
        setServerResMsg({ res: 'Question is now being showed to players' });
    };

    const NextQuestion = () => {
        // update next round question but not if the round(3) is equal to question length(3)
        if (round !== questions.length) {
            sendQuestion(questions);
        } else {
            // reached max round - end game
            socket.emit('endGame');
            setServerResMsg({ res: 'Game has ended! If you want to play again, click Init Game' });
        };
    };
    
    useEffect(() => {
        // check if answer is correct for each round, emit playername to server, if they answered correctly
        socket.on('playerChoice', (playerName, playerChoice, currentRound) => {
            // if it is not undefined -- round-1 because arrays are indexed at 0 (current round -1 )
            if(typeof questions[round-1] !== 'undefined' && currentRound === round) {
                console.log('CORRECT ANSWER IS:', decodeURIComponent(correctAnswer));           
                if (playerChoice === decodeURIComponent(correctAnswer)) {
                    // GIVE POINT
                    console.log(playerName, 'has answered CORRECTLY');
                    socket.emit('updateScore', playerName);
                } else {
                    // NO POINT
                    console.log(playerName, 'has NOT answered correctly!');
                };
            };
            setServerResMsg({ res: 'When all players has answered, click Next question' });
        });
    }, [round]); // when round changes, useEffect should run again??

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
                        <div className="serverRes">
                            <strong>{serverResMsg.res}</strong>
                        </div>
                        <div className="button-container">
                            <Button variant="primary" size="md" onClick={InitGame}>Init Game</Button>
                            <Button variant="primary" size="md" onClick={NextQuestion}>Next question</Button>
                        </div>
                        <div className="players-container">
                            <h3>Players in room</h3>
                            <hr/>
                            {playersInRoom.map((playerInfo, index) => 
                                <p className="p-players" key={index}>
                                    Playername: {playerInfo.username}
                                </p>
                            )}
                        </div>
                        <div className="messages-container">
                            <h3>Activity</h3>
                            <hr/>
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