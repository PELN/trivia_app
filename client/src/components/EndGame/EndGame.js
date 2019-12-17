import React from 'react';

const EndGame = ({ players, player }) => {

    console.log('scores in end game:', players);
    console.log('hello client', player);

    return(
        <div>
            <h1>Game has ended</h1>
            {players.map((player, index) =>
                <div className="score-container" key={index}>
                    <div>
                        {player.username}
                        {player.score}
                    </div>
                </div>
            )}
        </div>
    );
}


export default EndGame;

