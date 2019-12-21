import React from 'react';
import { useHistory } from "react-router-dom";

const EndGame = ({ players, player }) => {
    let history = useHistory();

    const handleSubmit = async e => {
        e.preventDefault();

        fetch('http://localhost:5000/scores/save' , {
            method: 'POST',
            body: JSON.stringify({
                username: player.username, 
                score: player.score
            }),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'applicaton/json'
            }
        }).then((response) => {
            if(response.status === 200) {
                console.log('Score has been saved');
                history.push('/leaderboard');
            };
        });
    };


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
            
            <p>If you want to play again in the same room, don't save your score!</p>
            <form onSubmit={handleSubmit} method="POST">
                <input disabled={true} readOnly defaultValue={player.username}/>
                <input disabled={true} readOnly defaultValue={player.score}/>
                <button>Save score</button>
            </form>
            <a href="/">Leave room</a>
        </div>
    );
}


export default EndGame;

