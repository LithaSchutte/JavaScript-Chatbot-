// server/index.js

const express = require("express");
const { createServer } = require("node:http");


const PORT = process.env.PORT || 3001;

const app = express();
const server = createServer(app)

app.get("/api", (req, res) => {
  res.sendFile();
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});