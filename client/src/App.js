import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import './App.css';
import JoinGame from './components/JoinGame/JoinGame';
import Game from './components/Game/Game';
import Scoreboard from './components/Scoreboard/Scoreboard';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <BrowserRouter>
      <Route path="/" exact component={JoinGame} />
      <Route path="/game" component={Game} />
      <Route path="/scoreboard" component={Scoreboard} />
    </BrowserRouter>
  );
}

export default App;
