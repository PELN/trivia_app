import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import JoinGame from './components/JoinGame/JoinGame';
import GameMaster from './components/GameMaster/GameMaster';
import GamePlayer from './components/GamePlayer/GamePlayer';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Navigation from './components/Navigation/Navigation';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navigation />
      <main>
        <Switch>
          <Route path="/" exact component={JoinGame} />
          <Route path="/gamemaster" component={GameMaster} />
          <Route path="/gameplayer" component={GamePlayer} />
          <Route path="/leaderboard" component={Leaderboard} />
        </Switch>
      </main>
      </BrowserRouter>
    </div>
  );
};

export default App;