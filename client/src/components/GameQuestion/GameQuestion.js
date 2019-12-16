import React, { useState } from 'react';
import './GameQuestion.css';

const GameQuestion = ({ currentQuestion, currentOptions, currentRound, playerName, socket, clickStatus, onClickChange }) => {
    const [playerChoice, setPlayerChoice] = useState('');
    const [clickActivated, setClickActivated] = useState(clickStatus);

    const clickOption = (event) => {
        const choice = event.target.innerText;
        // console.log('clicked on choice', choice);
        socket.emit('playerChoice', { playerName, choice, currentRound }, () => {
            console.log('player name', playerName, 'choice', playerChoice);
        });
        setPlayerChoice(choice);
        setClickActivated(false);
        onClickChange(false);
    };

    return(
        <div>
            <h1>Round {currentRound}</h1>
            <h2>Question: {decodeURIComponent(currentQuestion.question)}</h2>
            
            <div className="container">
                {currentOptions.map((option, index) =>
                    clickStatus === true ? (
                        <div className="options-container" key={index} onClick={clickOption}>
                            {decodeURIComponent(option)}
                            </div>
                        ) : (
                        <div className="options-container" key={index}>
                            {decodeURIComponent(option)}
                        </div>
                        )
                    )
                }
            </div>
        </div>
    );
};

export default GameQuestion;