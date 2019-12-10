import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

const JoinGame = () => {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('');

    return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <h1>Join Game</h1>
                        <input className="joinInput" placeholder="Username" type="text" onChange={(event) => setUsername(event.target.value)}/>
                        <input className="joinInput" placeholder="Room" type="text" onChange={(event) => setRoom(event.target.value)}/>
                        <Link onClick={event => (!username || !room) ? event.preventDefault() : null} to={`/game?username=${username}&room=${room}`}>
                            <Button variant="primary" type="submit">Join game</Button>
                        </Link>
                    </Col>
                </Row> 
            </Container>
    );
};

export default JoinGame;