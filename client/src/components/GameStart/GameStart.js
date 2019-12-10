import React, { useState } from 'react';

const GameStart = () => {
    const [clicked, setClick] = useState(false);
    // check if everyone has clicked 'start'! then let game begin
    // or countdown and let game begin, use function that sets a state 
    // to true if counter is at 0, then trigger it to render a div with the game
    
    // fetch questions, make game logic

    const handleClick = () => {
        console.log('click');
        setClick(true);
    }

  return (
      <div>
      { clicked === false ? (
        <button onClick={handleClick}>Start game</button>
      ) : (
        <div>
            <h1>Let the game begin</h1>
            <h3>Question</h3>
        </div>          
        )
      }
    </div>
  );
};


export default GameStart;




//   const [seconds, setSeconds] = useState(3);

//   useEffect(() => {
//     const interval = setInterval(() => {
//     setSeconds(seconds => seconds - 1);  
//     }, 1000);

//     return () => clearInterval(interval);
//     }, []);

//     if (seconds === 0) {
//         console.log('hit 0')

//         // return () =>{
//         //     clearInterval(seconds);
//         //     setSeconds(0);
//         // }
//     }