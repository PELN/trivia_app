import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import Messages from '../Messages/Messages';
import GameQuestion from '../GameQuestion/GameQuestion';
import EndGame from '../EndGame/EndGame';
import { Container } from 'react-bootstrap';

let socket;

const GamePlayer = ({ location }) => {
    const server = 'localhost:5000';
    const [joinRoomName, setJoinRoomName] = useState('');
    const [playerName, setPlayerName] = useState('');

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [playersInRoom, setPlayersInRoom] = useState([]);
    const [playerCount, setPlayerCount] = useState([]);

    const [gameStart, setGameStart] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [clickActivated, setClickActivated] = useState(true);

    // game end
    const [players, setPlayers] = useState([]); // to get final score
    const [gameEnd, setGameEnd] = useState(false); 
    const [player, setPlayer] = useState(''); // to get each client final score

    useEffect(() => {
        const { joinRoomName, playerName } = queryString.parse(location.search);
        socket = io.connect(server);
        setJoinRoomName(joinRoomName);
        setPlayerName(playerName);
    
        socket.emit('joinRoom', { joinRoomName, playerName }, (error) => {
            if (error) {
                setError(true);
                setErrorMsg(error);
                console.log(error);
            };
        });
        
        socket.on('playerData', (allPlayersInRoom) => {
            setPlayersInRoom(allPlayersInRoom); // is empty the first time, but it is set the next time
            setPlayerCount(allPlayersInRoom.length);
        });

        return () => {
            socket.emit('disconnect');
            socket.disconnect();
        };
    }, [server]);

    useEffect(() => {
        socket.on('message', (text) => {
            setMessage(text);
        });
        socket.on('message', (message) => {
            setMessages([...messages, message ]);
        });
    }, [messages]);

    useEffect(() => {
        socket.on('currentRound', (gameQuestion, gameOptionsArray, gameRound) => {
            setCurrentQuestion(gameQuestion);
            setCurrentOptions(gameOptionsArray);
            setCurrentRound(gameRound);
            setCorrectAnswer('');
            setGameStart(true);
            setGameEnd(false);
            setClickActivated(true);
        });
    },[]);

    // set value to false from click function in GameQuestion (onClickChange)
    const handleClickChange = (val) => {
        setClickActivated(val);
    };

    useEffect(() => {
        socket.on('correctAnswer', (correctAnswer) => {
            setCorrectAnswer(correctAnswer);
        });
    }, []);

    useEffect(() => {
        socket.on('scores', (players) => {
            setPlayers(players);
            setGameEnd(true);
        });
        
        socket.on('finalPlayerInfo', (client) => {
            setPlayer(client);
        });
    }, []);

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
                    { gameStart === false ? (
                        <div>
                            <h2>Hello, Game player {playerName}!</h2>
                            <p><strong>Waiting for Game Master to start the game...</strong></p>
                            <div className="players-container">
                                <h3>Players in room: {playerCount}</h3>
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
                                <Messages messages={messages} />
                            </div>
                            <a href="/">Leave room</a>
                        </div>
                    ) : (
                        <div>
                            { gameEnd === false ? (
                                <GameQuestion
                                    currentQuestion={currentQuestion} 
                                    currentOptions={currentOptions} 
                                    currentRound={currentRound} 
                                    playerName={playerName} 
                                    socket={socket} 
                                    clickStatus={clickActivated} 
                                    onClickChange={handleClickChange}
                                    correctAnswer={correctAnswer}
                                />
                            ) : (
                                <EndGame players={players} player={player} />
                                )
                            }
                        </div>
                        )
                    }
                    </div>
                )
                }
            </div>
        </Container>
    );
};

export default GamePlayer;