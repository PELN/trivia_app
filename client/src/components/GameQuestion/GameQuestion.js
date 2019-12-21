import React, { useState } from 'react';
import './GameQuestion.css';

const GameQuestion = ({ currentQuestion, currentOptions, currentRound, playerName, socket, clickStatus, onClickChange }) => {
    const [playerChoice, setPlayerChoice] = useState('');
    const [clickActivated, setClickActivated] = useState(clickStatus); // clickStatus is by default set to true from GamePlayer, to show the question first

    const clickOption = (event) => {
        const choice = event.target.innerText;
        socket.emit('playerChoice', { playerName, choice, currentRound }, () => {
            console.log('player name', playerName, 'choice', playerChoice);
        });
        setPlayerChoice(choice);

        // when player has clicked on a choice the click is set to false, to show what choice they have chosen
        setClickActivated(false); 
        onClickChange(false); // set handleClickChange parameter to false in GamePlayer
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