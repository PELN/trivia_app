import React from 'react';

const InfoRoom = ({ room, users }) => {
    return(
        <div>
            <h3>Welcome to gameroom: {room}</h3>
            <a href="/">Quit</a>

            <h5>Players currently in the gameroom</h5>
             {users.map((user, index) => 
                <p key={index}>
                    Player: {user.username}, 
                    score: {user.score}
                </p>
                )
            }
        </div>
    );
};

export default InfoRoom;


