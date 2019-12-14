// // waiting room for game start
// import React, { useState, useEffect } from 'react';
// import queryString from 'query-string';
// import io from 'socket.io-client';
// import Messages from '../Messages/Messages';
// import RoomInfo from '../RoomInfo/RoomInfo';
// //import GameStart from '../GameStart/GameStart';
// import GameQuestion from '../GameQuestion/GameQuestion';

// import { Link } from 'react-router-dom';

// let socket;

// const Game = ({ location }) => {
//     const server = 'localhost:5000';
    
//     // const [username, setUsername] = useState('');
//     const [roomName, setRoomName] = useState('');

//     // const [room, setRoom] = useState('');
//     const [users, setUsers] = useState([]);
//     const [message, setMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [error, setError] = useState(false);
//     const [errorMsg, setErrorMsg] = useState('');

//     const [questions, setQuestions] = useState([]);
//     const [currentQuestion, setCurrentQuestion] = useState(''); // index 0, first question object?
//     const [currentOptions, setCurrentOptions] = useState([]);


//     useEffect(() => {
//         socket = io.connect(server);

//         const { roomName } = queryString.parse(location.search);
//         setRoomName(roomName);
//         console.log(roomName);
//         socket.emit('createRoom', { roomName }, () => {
//             console.log(`****** WELCOME to room: ${roomName}, user with id: ${socket.id}`)
//         });

//         // socket.emit('joinGame', { username, room }, (error) => {
//         //     console.log(`${username} has joined the game in ${room}, with id: ${socket.id}`);
//         //     if (error) {
//         //         setError(true);
//         //         setErrorMsg(error);
//         //         console.log(error);
//         //     };
//         // });

//         return () => {
//             socket.emit('disconnect');
//             socket.disconnect();
//         };
//     }, [server, location.search]);

//     useEffect(() => {
//         socket.on('message', (text) => {
//             setMessage(text);
//         });

//         socket.on('roomData', ({ users }) => {
//             setUsers(users);
//         })
//     }, []);

//     useEffect(() => {
//         socket.on('message', (message) => {
//             setMessages([...messages, message ]); // use spread operator to send whole array + add the message to it
//         });
//     }, [messages]); //when messages array changes rerender effect

//     // console.log('***** users *******',users);
//     // console.log('message', message);
//     // console.log('messages', messages);


//     // fetch questions
//     useEffect(() => {
//         const getQuestions = async () => {
//             const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986")
//                 .then(response => response.json())
//                 .then(questions => {
//                     setQuestions(questions.results);
//                     setCurrentQuestion(questions.results[0]);
//                     const options = questions.results[0].incorrect_answers
//                     const correctAnswer = questions.results[0].correct_answer
//                     // console.log('!!!!! options', options, correctAnswer);
//                     setCurrentOptions([...options, correctAnswer]); //correctAnswer has to have random position
//                 });
//         };
//         getQuestions();
//     }, []);
        
//     // console.log('questions array', questions);
//     // console.log('current question', currentQuestion);
//     // console.log('current options', currentOptions);


//     useEffect(() => {
//         socket.on('question', ({ currentQuestion }))
//         socket.on('answers', ({ currentOptions }))
//     });
    


//     return(
//         <div>
//             { error === false ? (
//                 <div>
//                     <h1>Game start</h1>
//                     <RoomInfo room={roomName} users={users}/>
//                     <Messages messages={messages} />
//                     {/* <GameQuestion currentQuestion={currentQuestion} currentOptions={currentOptions}/> */}

//                     {/* <GameStart users={users}/> */}
//                 </div>
//             ) : (
//                 <div>
//                     <h1>Go back</h1>
//                     {errorMsg}
//                     <div><Link to={'/'}>Go Back</Link></div>
//                 </div>
//                 )
//             }
//         </div>
//     );
// };

// export default Game;