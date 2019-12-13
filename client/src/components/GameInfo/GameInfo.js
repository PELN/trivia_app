import React from 'react';

const GameInfo = ({ currentQuestion, currentOptions }) => (

    <div>
        <h1>Let the game begin</h1>
        <h3>Category: {decodeURIComponent(currentQuestion.category)}</h3>
        <h1>Question: {decodeURIComponent(currentQuestion.question)}</h1>
        
        <div className="container">
            {currentOptions.map((option, index) => 
                <div className="choice-container" key={index}>
                    <p className="choice-text" key={index}>
                        {decodeURIComponent(option)}
                    </p>
                </div>
                )
            }
        </div>
    </div>

);

export default GameInfo;