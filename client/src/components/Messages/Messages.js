import React from 'react';

const Messages = ({ messages }) => (

  <div>
    {messages.map((message, index) => 
        <p key={index}>{message.text}</p>
      )
    }
  </div>

);

export default Messages;