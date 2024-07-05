import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from "socket.io-client";
import './App.css'; // Remove if not needed
import './index.css'; // Remove if not needed


function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  /*
  useEffect(() => {
    // Simulate token storage (replace 'token' with an actual token in a real scenario)
    const token = 'token';

    // Connect to the socket with the token
    socketRef.current = socketIOClient({
      auth: {
        token: token
      }
    });
  */

  useEffect(() => {
    socketRef.current = socketIOClient();

    socketRef.current.on("receiveMessage", ({ response }) => {
      setMessages((prevMessages) => [...prevMessages, { text: response, sender: 'bot' }]);
    });

    socketRef.current.on('refresh page', () => {
      window.location.reload();
    })

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    let message = input.trim();
    if (message.length !== 0) {
      socketRef.current.emit("sendMessage", message);
      setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'user' }]);
      setInput('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="main-parent">
      <header className="bg-dark text-white p-3">
        <h1 id="heading"> IntelliDrive Motors Chatbot </h1>
      </header>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <main role="main" className="container chat-container">
        <div id="main-div" className="d-flex flex-column justify-content-between h-100">
          <div id="messages-sent" className="flex-grow-0 overflow-auto">
            {messages.map((message, index) => (
              <div key={index} className={`sent-message ${message.sender === 'user' ? 'client' : 'bot'}`}>
                {message.text}
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>
          <div id="user-input" className="input-group my-3">
            <input
              id="inputfield"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="form-control"
              placeholder="Send a message..."
            />
            <div className="input-group-append">
              <button id="send-button" className="btn btn-primary" onClick={sendMessage}>
                <i className="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
