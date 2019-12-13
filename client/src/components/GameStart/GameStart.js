import React, { useState, useEffect } from 'react';
import GameInfo from '../GameInfo/GameInfo';

import './GameStart.css';
import io from 'socket.io-client';

// ***** TODOS ******
// fetch questions
// set currentQuestion to the question object
// put all options in same array - incorrect + correct
// map through options to show them
// next button - onclick -> next question function -> new currentQuestion
// onclick option, make it active, setUserAnswer to what they click
// next button - check if userAnswer is the same as correctAnswer - increment setScore if correct
// if no more questions setGameEnd to true, show finish page with score - save score with form (username, score)

// when game finish, set score to whatever it is, emit it to server, save it in mogodb
// new game - set states to empty, 0, false

let socket;

const GameStart = ({ users }) => {
    const server = 'localhost:5000';
    const [clicked, setClick] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(''); // index 0, first question object?
    const [currentOptions, setCurrentOptions] = useState([]);
    // const [userAnswer, setUserAnswer] = useState('');
    // const [correctAnswer, setCorrectAnswer] = useState('');
    // const [score, setScore] = useState(0);
    // const [gameEnd, setGameEnd] = useState(false);
    // const [error, setError] = useState('');
    // const [loading, setLoading] = useState('');

    socket = io.connect(server)


    // fetch questions
    useEffect(() => {
        const getQuestions = async () => {
            const response = await fetch("https://opentdb.com/api.php?amount=5&type=multiple&encode=url3986")
                .then(response => response.json())
                .then(questions => {
                    setQuestions(questions.results);
                    setCurrentQuestion(questions.results[0]);
                    const options = questions.results[0].incorrect_answers
                    const correctAnswer = questions.results[0].correct_answer
                    // console.log('!!!!! options', options, correctAnswer);
                    setCurrentOptions([...options, correctAnswer]); //options has to have random position
                });
        };
        getQuestions();
    }, []);
        
    console.log('questions array', questions);
    console.log('current question', currentQuestion);
    console.log('current options', currentOptions);


    useEffect(() => {
        socket.on('question', ({ currentQuestion }))
        socket.on('answers', ({ currentOptions }))
    });


    const handleClick = () => {
        console.log('click');
        setClick(true);
    }

    return (
        <div>
        <GameInfo currentQuestion={currentQuestion} currentOptions={currentOptions}/>
        {/* { clicked === false ? (
            <button onClick={handleClick}>Start game</button>
        ) : (
            <div>
                <h1>Let the game begin</h1>
                <h3>Category: {decodeURIComponent(currentQuestion.category)}</h3>
                <h1>Question: {decodeURIComponent(currentQuestion.question)}</h1>
                
                <div className="container">
                    {currentOptions.map((option, index) => 
                        <div className="choice-container" key={index}>
                            <p className="choice-text" key={index}>
                                {decodeURIComponent(option)}
                            </p>
                        </div>
                        )
                    }
                </div>
            </div>
            )
        } */}
    </div>
  );
};


export default GameStart;










    // startGame();

    // countdown
    // check if everyone has clicked 'start'! set wait to false and render game
    // emit message to all users: waiting for players to start game?
    // for now users don't have to play at the same time - no countdown
    // or countdown and let game begin, use function that sets a state 
    // to true if counter is at 0, then trigger it to render a div with the game
    


// const [wait, setWait] = useState(true);
    // const [availableQuestions, setAvailableQuestions] = useState([]);
    // let [currentQuestion, setCurrentQuestion] = useState({});
    // let [questionCounter, setQuestionCounter] = useState(0);
    // const [score, setScore] = useState(0);

    // const questions = [
    //     {
    //         question: "Whaat is my name?",
    //         choice1: "hee",
    //         choice2: "geghee",
    //         choice3: "hasdsaee",
    //         choice4: "h1243ee",
    //         answer: 1
    //     }
    // ]

    // const CORRECT_ANSWER_POINTS = 10;
    // const MAX_QUESTIONS = 3;

    // const startGame = () => {
    //     // setQuestionCounter(0);
    //     setScore(0);
    //     // availableQuestions([...questions]);
    //     console.log(availableQuestions);
    //     getNewQuestion();
    // }

    // const getNewQuestion = () => {
    //     questionCounter++;
    //     const questionIndex = Math.floor(Math.random() + availableQuestions.length);
    //     currentQuestion = availableQuestions[questionIndex];
    //     question.innerText = currentQuestion.question;
    // }