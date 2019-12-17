import React, { useState } from 'react';

const EndGame = ({ players, player }) => {
    // const [saveUsername, setSaveUsername] = useState('');
    // const [saveScore, setSaveScore] = useState('');


    console.log('scores in end game:', players);
    console.log('hello client', player);

    // const handleChange = () => {
    //     saveUsername(player.username);
    //     setSaveScore(player.score);
    // }

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

            <form>
                <input disabled={true} readOnly defaultValue={player.username}/>
                <input disabled={true} readOnly defaultValue={player.score}/>
                <button>Save score</button>
            </form>
        </div>
    );
}


export default EndGame;

