const express = require("express");
const http = require("http");
const { join } = require("path");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(join(__dirname, '../client/build')));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, '../client/build/index.html'));
});

var dict = {
  "bestellen": "Sie wollen eine Bestellung aufgeben. Was möchten Sie bestellen? Als Getränk haben wir Fanta und Cola",
  "aufgeben": "Sie wollen eine Bestellung aufgeben. Was möchten Sie bestellen? Getränk",
  "bestellung": "Sie wollen eine Bestellung aufgeben. Was möchten Sie bestellen? Fangen wir mit Getränken an: Cola oder Fanta?",
  "cola": "Ich habe Cola notiert. Sie kostet 1€, möchten Sie noch ein Getränk bestellen",
  "fanta": "Ich habe Fanta notiert. Sie kostet 1€, möchten Sie noch ein Getränk bestellen",
  "gericht": "Sie möchten ein Gericht bestellen. Ich habe folgende Gerichte zur Auswahl"
}

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("sendMessage", (message) => {
    let response;
    if (message.toLowerCase() === "hello") {
      response = "Hello! How can I help you today?";
    } else {
      response = dict[message];
    }
    socket.emit("receiveMessage", { message, response });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});