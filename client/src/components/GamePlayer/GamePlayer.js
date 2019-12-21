import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';

import Messages from '../Messages/Messages';
import GameQuestion from '../GameQuestion/GameQuestion';
import EndGame from '../EndGame/EndGame';

let socket;

const GamePlayer = ({ location }) => {
    const server = 'localhost:5000';
    const [joinRoomName, setJoinRoomName] = useState('');
    const [playerName, setPlayerName] = useState('');

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const [gameStart, setGameStart] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
    const [currentRound, setCurrentRound] = useState(0);

    const [playersInRoom, setPlayersInRoom] = useState([]);

    const [clickActivated, setClickActivated] = useState(true);

    // game end
    const [players, setPlayers] = useState([]); // to get final score
    const [gameEnd, setGameEnd] = useState(false); // to get final score
    const [player, setPlayer] = useState(''); // to get each client final score

    useEffect(() => {
        const { joinRoomName, playerName } = queryString.parse(location.search);
        socket = io.connect(server);

        setJoinRoomName(joinRoomName);
        setPlayerName(playerName);
        console.log('room:', joinRoomName, 'name:', playerName);
    
        socket.emit('joinRoom', { joinRoomName, playerName }, (error) => {
            if (error) {
                setError(true);
                setErrorMsg(error);
                console.log(error);
            };
        });
        
        socket.on('playerData', (allPlayersInRoom) => {
            console.log(allPlayersInRoom);
            setPlayersInRoom(allPlayersInRoom);
            console.log('all players in room:', playersInRoom); // is empty the first time, but it is set the next time
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
    }, [messages]); //when messages array changes rerender effect


    useEffect(() => {
        socket.on('currentRound', (currentQuestion, currentOptions, currentRound) => {
            // console.log(currentQuestion, currentOptions, currentRound);
            setCurrentQuestion(currentQuestion);
            setCurrentOptions(currentOptions);
            setCurrentRound(currentRound);
            
            setGameStart(true);
            setGameEnd(false);
            console.log("This is the clicky status:", clickActivated);
            setClickActivated(true); // set click status to true on each round, to show question in GameQuestion
        });
    },[currentQuestion]);

    // set value to false from click function in GameQuestion (onClickChange)
    const handleClickChange = (val) => {
        console.log("This is the value of clicky", val);
        setClickActivated(val); // set value from GameQuestion
    };

    // get all players score - pass it to EndGame
    useEffect(() => {
        socket.on('scores', (players) => {
            setPlayers(players);
            setGameEnd(true);
        });
        
        // each player/client info to save score
        socket.on('finalPlayerInfo', (client) => {
            console.log(client);
            setPlayer(client);
        });
    }, []);


    return(
        <div>
            {error === true ? (
                <div>
                    {errorMsg.error}
                    <a href="/">Go back</a>
                </div>
            ) : (
                <div>
                { gameStart === false ? (
                    <div>
                        <h1>Game player</h1>
                        <a href="/">Leave room</a>
                        <h3>Players in room</h3>
                        {playersInRoom.map((playerInfo, index) => 
                            <p key={index}>
                                {playerInfo.username}
                            </p>
                        )}

                        <h3>Waiting for master to start the game...</h3>
                        <Messages messages={messages} />
                    </div>
                ) : (
                    // if game has ended - show endgame component instead of game question
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
    );
};

export default GamePlayer;