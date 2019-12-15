import React, { useState, useEffect } from 'react';
import './GameQuestion.css';
import io from 'socket.io-client';
let socket;

const GameQuestion = ({ currentQuestion, currentOptions, currentRound, playerName }) => {
    const server = 'localhost:5000';
    const [playerChoice, setPlayerChoice] = useState('');

    const clickOption = (event) => {
        const choice = event.target.innerText;
        // console.log('clicked on choice', choice);
        setPlayerChoice(choice); 
    }
    console.log(playerChoice, playerName);

    socket = io.connect(server);
    useEffect(() => {
        socket.emit('playerChoice', { playerName, playerChoice }, () => {
            console.log('player name', playerName, 'choice', playerChoice);
        });
    },[playerChoice]);

    // decode url encoding
    return(
        <div>
            <div>
                <h1>Round {currentRound}</h1>
                <h2>Question: {decodeURIComponent(currentQuestion.question)}</h2>
                
                <div className="container">
                    {currentOptions.map((option, index) => 
                        <div className="options-container" key={index} onClick={clickOption}>
                            {/* <p className="choice-text" key={index}> */}
                                {decodeURIComponent(option)}
                            {/* </p> */}
                        </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default GameQuestion;