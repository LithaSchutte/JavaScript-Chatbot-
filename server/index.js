// server/index.js

const express = require("express");
const { createServer } = require("node:http");
const { join } = require('node:path');


const PORT = process.env.PORT || 3001;

const app = express();
const server = createServer(app)
app.use(express.static(join(__dirname, '../client/src')));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, '../client/public/index.html'))
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});