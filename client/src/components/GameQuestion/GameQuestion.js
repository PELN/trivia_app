import React, { useState } from 'react';
import './GameQuestion.css';

const GameQuestion = ({ currentQuestion, currentOptions, currentRound, playerName, socket }) => {
    const [playerChoice, setPlayerChoice] = useState('');
    const [optionClicked, setOptionClicked] = useState(false);

    const clickOption = (event) => {
        const choice = event.target.innerText;
        // console.log('clicked on choice', choice);
        socket.emit('playerChoice', { playerName, choice, currentRound }, () => {
            console.log('player name', playerName, 'choice', playerChoice);
        });
        setPlayerChoice(choice);
        setOptionClicked(true);
    };
    
    console.log(playerChoice, playerName);



    return(
        <div>
            {optionClicked === false ? (
                <div>
                    <h1>Round {currentRound}</h1>
                    <h2>Question: {decodeURIComponent(currentQuestion.question)}</h2>
                    
                    <div className="container">
                        {currentOptions.map((option, index) =>
                            <div className="options-container" key={index} onClick={clickOption}>
                                {decodeURIComponent(option)}
                            </div>
                            )
                        }
                    </div>
                </div>
            ) : (
                <div>
                    <h1>option clicked</h1>
                </div>
            )}
        </div>
    );
};

export default GameQuestion;