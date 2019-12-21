import React, { useState, useEffect} from 'react';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/scores/' , {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'applicaton/json'
            }
        })
        .then(response => response.json())
        .then( (scores) => {
            setLeaderboard(scores);
            // console.log(leaderboard);
        });

    }, []);
    
    return (
        <div>
            <h1>LEADERBOARD</h1>
            <h3>Top 20</h3>
            {leaderboard.map((score, index) => 
                <div className="leaderboard-container" key={index}>
                    {score.username}
                    {score.score}
                </div>
            )}
            <a href="/">Join a new game</a>
        </div>
    );
};


export default Leaderboard;