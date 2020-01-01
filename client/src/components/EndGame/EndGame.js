import React from 'react';
import { useHistory } from "react-router-dom";
import { Form, Container, Col, Button, Table } from 'react-bootstrap';
import './EndGame.css';

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
            <h1>The game has ended!</h1>
            <div className="score-container">
            <h3>Game scores</h3>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Player name</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {players.map((player, index) =>
                        <tr key={index}>
                            <td>{player.username}</td>
                            <td>{player.score}</td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>

            <div className="save-score-container">
                <h3>Save score to leaderboard</h3>
                <p>If you want to play again in the same room, don't save your score!</p>
                <Form onSubmit={handleSubmit} method="POST">
                    <Form.Control disabled={true} readOnly defaultValue={player.username}/>
                    <Form.Control disabled={true} readOnly defaultValue={player.score}/>
                    <Button variant="primary" type="submit">Save score</Button>
                </Form>
            </div>
            <a href="/">Leave room</a>
        </div>
    );
}


export default EndGame;

