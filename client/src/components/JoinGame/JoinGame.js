import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';

import './JoinGame.css';

const JoinGame = () => {
    const [roomName, setRoomName] = useState('');
    const [joinRoomName, setJoinRoomName] = useState('');
    const [masterName, setMasterName] = useState('');
    const [playerName, setPlayerName] = useState('');

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col>
                    <h1>Create Game</h1>
                    <Form>
                        <Form.Control placeholder="Room name" type="text" onChange={(event) => setRoomName(event.target.value)}/>
                        <Form.Control placeholder="Master name" type="text" onChange={(event) => setMasterName(event.target.value)}/>
                        <Link onClick={event => (!roomName) ? event.preventDefault() : null} to={`/gamemaster?roomName=${roomName}&masterName=${masterName}`}>
                            <Button variant="primary" type="submit">Create game</Button>
                        </Link>
                    </Form>
                </Col>
            </Row>

            <Row className="justify-content-md-center">
                <Col>
                    <h1>Join Game</h1>
                    <Form>
                        <Form.Control className="joinInput" placeholder="Room name" type="text" onChange={(event) => setJoinRoomName(event.target.value)}/>
                        <Form.Control placeholder="Player name" type="text" onChange={(event) => setPlayerName(event.target.value)}/>
                        <Link onClick={event => (!joinRoomName) ? event.preventDefault() : null} to={`/gameplayer?joinRoomName=${joinRoomName}&playerName=${playerName}`}>
                            <Button variant="primary" type="submit">Join game</Button>
                        </Link>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default JoinGame;