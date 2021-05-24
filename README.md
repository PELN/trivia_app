# Trivia app
Technologies: React/hooks, Node/express, Socket.io, MongoDB/mongoose

Requirements: Use node/react, connect to a database, use sockets, connect to an API

## Project description
For the exam in my node/react elective I have built a trivia/quiz application using sockets.

Sockets enables realtime communication between web clients and servers.

I have used socket rooms to create, join and leave a game.

The questions are fetched from this API: https://opentdb.com/api_config.php

For the frontend, I have used React Hooks and bootstrap (the design/UX was not prioritized as much as functionality)

Also, I didn't use a database to store the rooms and players, since I wanted to focus on learning react and node.

<img width="650" alt="Screenshot 2021-05-24 at 16 57 03" src="https://user-images.githubusercontent.com/31202787/119367595-646d0900-bcb2-11eb-96f5-bc52abba25aa.png">


## Set-up guide

Have node.js, npm, nodemon, react-scripts installed.

1. git clone project

2. in the terminal, cd into server folder and run npm start

3. in another terminal, cd into client folder and run npm start
- a browser should open up with localhost:3000

4. in one browser, create a game 

5. in a second browser, join the game with the game name

6. in a third browser, also join the same game

7. the game master starts the game by clicking "Start Game"

8. the players emit their answer in their respective browser

9. when all players have answered - the game master clicks "Next question"

10. and so on, for as many rounds there are

11. when the game is finished, the scores of each player are dispalyed - they can save it to a highscore list, leave the game, or stay to play again

## Demo
![demo2](https://user-images.githubusercontent.com/31202787/119366573-684c5b80-bcb1-11eb-965e-283f656f647c.gif)

