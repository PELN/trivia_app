import React, { useState } from 'react';
import './GameQuestion.css';

const GameQuestion = ({ currentQuestion, currentOptions, currentRound, playerName, socket, clickStatus, onClickChange }) => {
    const [playerChoice, setPlayerChoice] = useState('');
    const [clickActivated, setClickActivated] = useState(clickStatus); // used to prevent many clicks on one option ^ also onClickChange

    const clickOption = (event) => {
        const choice = event.target.innerText;
        // console.log('clicked on choice', choice);
        socket.emit('playerChoice', { playerName, choice, currentRound }, () => {
            console.log('player name', playerName, 'choice', playerChoice);
        });
        setPlayerChoice(choice);

        setClickActivated(false); // used to prevent many clicks on one option
        onClickChange(false); // used to prevent many clicks on one option
    };
    
    return(
        <div>
            <h1>Round {currentRound}</h1>
            { clickStatus === true ? (
                <div className="container">
                <h2>Question: {decodeURIComponent(currentQuestion.question)}</h2>
                    {currentOptions.map((option, index) =>
                        <div className="options-container" key={index} onClick={clickOption}>
                            {decodeURIComponent(option)}
                        </div>
                        )
                    }
                </div>
            ) : (
                <div>
                    <h3>You have chosen: {playerChoice}</h3>
                </div>
                )
            }
        </div>
    );
};

export default GameQuestion;