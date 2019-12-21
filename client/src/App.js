import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import JoinGame from './components/JoinGame/JoinGame';
import GameMaster from './components/GameMaster/GameMaster';
import GamePlayer from './components/GamePlayer/GamePlayer';
import Leaderboard from './components/Leaderboard/Leaderboard';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  return (
    <BrowserRouter>
      <Route path="/" exact component={JoinGame} />
      <Route path="/gamemaster" component={GameMaster} />
      <Route path="/gameplayer" component={GamePlayer} />
      <Route path="/leaderboard" component={Leaderboard} />
    </BrowserRouter>
  );
};

export default App;
