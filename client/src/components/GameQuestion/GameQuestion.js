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
    
    return (
        <div>
            <div className="round-container">
                <h2>Question {currentRound}</h2>
            </div>
            { clickStatus === true ? (
                <div className="container">
                    <div className="question-container">
                        <h2>{decodeURIComponent(currentQuestion.question)}</h2>
                    </div>
                    <div className="options-container">
                        {currentOptions.map((option, index) =>
                            <div className="option" key={index} onClick={clickOption}>
                                {decodeURIComponent(option)}
                            </div>
                            )
                        }
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="h3-chosen-option">You chose: {playerChoice}</h3>
                </div>
                )
            }
        </div>
    );
};

export default GameQuestion;