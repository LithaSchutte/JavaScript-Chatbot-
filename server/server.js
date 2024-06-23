const express = require("express");
const http = require("http");
const {join} = require("path");
const socketIo = require("socket.io");
const WebSocket = require("ws");
const PORT = process.env.PORT || 3001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const fs = require("fs");

app.use(express.static(join(__dirname, '../client/build')));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, '../client/build/index.html'));
});

const filePath = 'responses.json';
let responses = {};

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        responses = JSON.parse(data);
        console.log("Responses loaded successfully: ", responses);
    } catch (err) {
        console.error('Error parsing JSON:', err);
    }
});

const userStates = {};

io.on("connection", (socket) => {
    console.log("New client connected");
    userStates[socket.id] = {};

    socket.emit("receiveMessage", {response: responses.default});

    socket.on("sendMessage", (message) => {
        let response;
        const lowerMessage = message.toLowerCase();
        if (!userStates[socket.id].context) {
            userStates[socket.id].context = "begin";
        }

        const currentContext = userStates[socket.id].context;
        const currentResponses = responses[currentContext] || {};

        if (currentResponses[lowerMessage]) {
            const responseData = currentResponses[lowerMessage];

            if (typeof responseData === "string") {
                response = responseData; // Handle simple string response
            } else if (typeof responseData === "object" && responseData.answer) {
                response = responseData.answer; // Handle structured response with "answer"

                // Update context based on "switch" field in the response
                if (responseData.switch) {
                    userStates[socket.id].context = responseData.switch;
                }
            }
        } else if (currentResponses.default) {
            response = currentResponses.default.answer;
            if (currentResponses.default.switch) {
                userStates[socket.id].context = currentResponses.default.switch;
            }
        } else {
            response = "I'm sorry, I didn't understand that.";
        }

        socket.emit("receiveMessage", {message, response});
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
