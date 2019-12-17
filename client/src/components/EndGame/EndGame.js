import React from 'react';

const EndGame = ({ players }) => {

    // show score
    // make form where user can save score
    // then it gets on scoreboard

    console.log('scores in end game:', players);

    return(
        <div>
            <h1>Game has ended</h1>
            {players.map((player, index) =>                    
                <div className="score-container" key={index}>
                    <div>
                        <h3>{player.username}</h3>
                        <h2>{player.score}</h2>
                    </div>
                </div>
            )}
        </div>
    );
}


export default EndGame;

