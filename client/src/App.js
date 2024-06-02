import React, {createElement} from "react";
import logo from './logo.svg';
import './App.css';

function App() {/*

  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setData(data.message));
  }, []);

  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <p>{!data ? "Loading..." : data}</p>
        </header>
      </div>
  );*/
}

function sendMessage() {
    let message = document.getElementById("inputfield").value;
    if (message.length !== 0) {
        const node = document.createElement("h4");
        node.setAttribute("id", "sent-message")
        const textnode = document.createTextNode(message);
        node.appendChild(textnode);
        document.getElementById("messages-sent").appendChild(node);
        let messagesSent = document.getElementById("messages-sent");
        messagesSent.scrollTop = messagesSent.scrollHeight;
    }
}

const messageButton = document.getElementById("send-button");

messageButton.addEventListener("click", function () {
    sendMessage();
});

var inputField = document.getElementById("inputfield");
inputField.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("send-button").click();
        inputField.value = "";
    }
})
export default App;
